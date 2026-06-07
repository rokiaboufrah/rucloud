from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'size', 'price', 'quantity', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'full_name', 'email', 'phone', 'address', 'city', 'wilaya_code', 'delivery_type', 'shipping_cost', 'country', 'status', 'payment_method', 'payment_status', 'ccp_ref', 'payment_receipt', 'total', 'notes', 'items', 'created_at']
        read_only_fields = ['status', 'payment_status', 'created_at']

class CreateOrderSerializer(serializers.Serializer):
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    wilaya_code = serializers.IntegerField(required=False, allow_null=True)
    delivery_type = serializers.ChoiceField(choices=['domicile', 'stop_desk'], default='domicile')
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    country = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=['cod', 'baridimob', 'ccp', 'bank_transfer'])
    ccp_ref = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
