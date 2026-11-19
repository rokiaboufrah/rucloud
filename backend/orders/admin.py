from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ['product', 'product_name', 'size', 'price', 'quantity']
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'status', 'payment_method', 'payment_status', 'has_receipt', 'total', 'created_at']
    list_filter = ['status', 'payment_method', 'payment_status', 'created_at']
    search_fields = ['full_name', 'email', 'phone']
    readonly_fields = ['total', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    actions = ['mark_as_paid']
    fieldsets = [
        ('Customer', {'fields': ['user', 'full_name', 'email', 'phone']}),
        ('Shipping', {'fields': ['address', 'city', 'wilaya_code', 'delivery_type', 'shipping_cost', 'country']}),
        ('Payment', {'fields': ['payment_method', 'payment_status', 'ccp_ref', 'payment_receipt']}),
        ('Order', {'fields': ['status', 'total', 'notes', 'created_at', 'updated_at']}),
    ]

    @admin.display(boolean=True, description='Receipt')
    def has_receipt(self, obj):
        return bool(obj.payment_receipt)

    @admin.action(description='Mark selected orders as paid')
    def mark_as_paid(self, request, queryset):
        updated = queryset.update(payment_status='paid')
        self.message_user(request, f'{updated} order(s) marked as paid.')
