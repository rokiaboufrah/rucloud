from django.conf import settings
from django.db import transaction
from django.db.models import F as db_f
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer
from cart.views import get_or_create_cart
from notifications import send_new_order_alert, send_order_confirmation
from products.models import ProductSize

try:
    from PIL import Image
except ImportError:
    Image = None

MAX_RECEIPT_SIZE = 5 * 1024 * 1024


def validate_receipt(upload):
    content_type = (getattr(upload, 'content_type', '') or '').lower()
    if not content_type.startswith('image/'):
        return 'Receipt must be an image'
    if upload.size > MAX_RECEIPT_SIZE:
        return 'Receipt image must be 5MB or smaller'
    if Image is not None:
        try:
            image = Image.open(upload)
            image.verify()
            upload.seek(0)
        except Exception:
            return 'Receipt must be a valid image file'
    return None

class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        country = serializer.validated_data.get('country', '').lower()
        allowed = ['algeria', 'algérie', 'algerie', 'dz', 'dza']
        if not any(c in country for c in allowed):
            return Response(
                {'error': 'International shipping is not available at this time. We currently ship within Algeria only.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = get_or_create_cart(request)
        if cart.item_count == 0:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        shipping_cost = serializer.validated_data.get('shipping_cost', 0) or 0
        order_total = float(cart.total) + float(shipping_cost)
        items = list(cart.items.select_related('product', 'size').all())

        with transaction.atomic():
            # Lock and verify every tracked size before writing anything.
            for item in items:
                if item.size_id is None:
                    continue
                size = ProductSize.objects.select_for_update().filter(id=item.size_id).first()
                if size is None or size.stock < item.quantity:
                    raise ValidationError({
                        'error': f'Insufficient stock for {item.product.name} ({item.size.name})'
                    })

            order = Order.objects.create(
                user=request.user,
                total=order_total,
                **serializer.validated_data
            )

            for item in items:
                order.items.create(
                    product=item.product,
                    product_name=item.product.name,
                    size=item.size.name if item.size else '',
                    price=item.product.price,
                    quantity=item.quantity
                )
                if item.size_id is not None:
                    updated = ProductSize.objects.filter(
                        id=item.size_id,
                        stock__gte=item.quantity
                    ).update(stock=db_f('stock') - item.quantity)
                    if updated == 0:
                        raise ValidationError({
                            'error': f'Insufficient stock for {item.product.name} ({item.size.name})'
                        })

            cart.items.all().delete()

        send_order_confirmation(order)
        send_new_order_alert(order)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class ReceiptUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        order = Order.objects.filter(id=pk).first()
        if order is None:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        if order.user_id != request.user.id:
            return Response({'error': 'You are not allowed to upload a receipt for this order'},
                            status=status.HTTP_403_FORBIDDEN)
        if order.payment_status != 'pending':
            return Response({'error': 'This order is no longer awaiting payment'},
                            status=status.HTTP_400_BAD_REQUEST)
        if order.payment_method == 'cod':
            return Response({'error': 'Cash on delivery orders do not need a receipt'},
                            status=status.HTTP_400_BAD_REQUEST)

        upload = request.FILES.get('receipt')
        if upload is None:
            return Response({'error': 'Receipt file is required'}, status=status.HTTP_400_BAD_REQUEST)
        error = validate_receipt(upload)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        order.payment_receipt = upload
        order.save(update_fields=['payment_receipt', 'updated_at'])
        return Response(OrderSerializer(order).data)

class PaymentConfigView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'baridimob': {
                'phone': settings.BARIDIMOB_PHONE,
                'name': settings.BARIDIMOB_NAME,
            },
            'ccp': {
                'account_holder': settings.CCP_ACCOUNT_HOLDER,
                'account_number': settings.CCP_ACCOUNT_NUMBER,
                'cle': settings.CCP_CLE,
                'bank': settings.CCP_BANK,
                'address': settings.CCP_ADDRESS,
            }
        })
