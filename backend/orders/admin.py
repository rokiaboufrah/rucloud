from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ['product', 'product_name', 'size', 'price', 'quantity']
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'status', 'payment_method', 'payment_status', 'total', 'created_at']
    list_filter = ['status', 'payment_method', 'payment_status', 'created_at']
    search_fields = ['full_name', 'email', 'phone']
    readonly_fields = ['total', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    fieldsets = [
        ('Customer', {'fields': ['user', 'full_name', 'email', 'phone']}),
        ('Shipping', {'fields': ['address', 'city', 'wilaya_code', 'delivery_type', 'shipping_cost', 'country']}),
        ('Payment', {'fields': ['payment_method', 'payment_status', 'ccp_ref', 'payment_receipt']}),
        ('Order', {'fields': ['status', 'total', 'notes', 'created_at', 'updated_at']}),
    ]
