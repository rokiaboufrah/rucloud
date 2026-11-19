import logging

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db import connection
from django.db.models import Sum, Count
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from orders.models import Order
from products.models import Product
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

@require_GET
def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
        database = 'ok'
    except Exception:
        logger.exception('Health check database query failed')
        database = 'error'
    status = 200 if database == 'ok' else 503
    return JsonResponse({'status': database, 'database': database}, status=status)

@require_GET
@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

@staff_member_required
def dashboard(request):
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    total_revenue = Order.objects.filter(status='delivered').aggregate(Sum('total'))['total__sum'] or 0
    total_orders = Order.objects.count()
    total_products = Product.objects.count()
    total_customers = User.objects.filter(is_staff=False).count()

    recent_orders = Order.objects.order_by('-created_at')[:10]

    revenue_today = Order.objects.filter(status='delivered', created_at__date=now.date()).aggregate(Sum('total'))['total__sum'] or 0
    revenue_month = Order.objects.filter(status='delivered', created_at__gte=thirty_days_ago).aggregate(Sum('total'))['total__sum'] or 0

    orders_by_status = {
        s[0]: Order.objects.filter(status=s[0]).count()
        for s in Order.STATUS_CHOICES
    }

    return render(request, 'admin/dashboard.html', {
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'total_products': total_products,
        'total_customers': total_customers,
        'recent_orders': recent_orders,
        'revenue_today': revenue_today,
        'revenue_month': revenue_month,
        'orders_by_status': orders_by_status,
        'title': 'Dashboard',
    })
