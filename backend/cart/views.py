from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product, ProductSize

def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.save()
            session_key = request.session.session_key
        cart, created = Cart.objects.get_or_create(session_key=session_key)
    return cart


def merge_guest_cart(session_key, user):
    """Transfer a guest (session) cart's items into the user's cart."""
    if not session_key:
        return
    guest_cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
    if guest_cart is None or not guest_cart.items.exists():
        return
    cart, _ = Cart.objects.get_or_create(user=user)
    for item in guest_cart.items.all():
        existing = cart.items.filter(product=item.product, size=item.size).first()
        if existing:
            existing.quantity += item.quantity
            existing.save()
        else:
            item.cart = cart
            item.save()
    guest_cart.delete()


def parse_quantity(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def available_stock(product, size):
    """Return stock for a size, or the combined stock of a product's sizes.

    A product without any tracked sizes is treated as unrestricted, matching
    the existing behaviour for products that do not use ProductSize.
    """
    if size is not None:
        return size.stock
    stocks = list(product.sizes.values_list('stock', flat=True))
    return sum(stocks) if stocks else None


def stock_error(product, size, quantity):
    available = available_stock(product, size)
    if available is not None and quantity > available:
        return f'Insufficient stock. Only {available} available.'
    return None

class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart).data)

class CartAddView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        cart = get_or_create_cart(request)
        product_id = request.data.get('product_id')
        size_id = request.data.get('size_id')
        quantity = parse_quantity(request.data.get('quantity', 1))

        if quantity is None or quantity <= 0:
            return Response({'error': 'Quantity must be a positive number'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id, is_active=True)
        size = None
        if size_id:
            size = ProductSize.objects.filter(id=size_id, product=product).first()
            if size is None:
                return Response({'error': 'Invalid size for this product'}, status=status.HTTP_400_BAD_REQUEST)

        existing = CartItem.objects.filter(cart=cart, product=product, size=size).first()
        requested = quantity + (existing.quantity if existing else 0)
        error = stock_error(product, size, requested)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        if existing:
            existing.quantity = requested
            existing.save()
        else:
            CartItem.objects.create(cart=cart, product=product, size=size, quantity=quantity)

        return Response(CartSerializer(cart).data)

class CartUpdateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = parse_quantity(request.data.get('quantity', 1))
        if quantity is None:
            return Response({'error': 'Quantity must be a number'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            item.delete()
        else:
            error = stock_error(item.product, item.size, quantity)
            if error:
                return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
            item.quantity = quantity
            item.save()
        return Response(CartSerializer(cart).data)

class CartRemoveView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response(CartSerializer(cart).data)
