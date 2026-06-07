from django.conf import settings
from django.db import models as db_models
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer
from cart.views import get_or_create_cart
from products.models import ProductSize

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

        order = Order.objects.create(
            user=request.user,
            total=order_total,
            **serializer.validated_data
        )

        for item in cart.items.all():
            order.items.create(
                product=item.product,
                product_name=item.product.name,
                size=item.size.name if item.size else '',
                price=item.product.price,
                quantity=item.quantity
            )
            if item.size:
                ProductSize.objects.filter(id=item.size.id).update(stock=models.F('stock') - item.quantity)
                item.size.refresh_from_db()

        cart.items.all().delete()
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
