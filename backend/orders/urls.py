from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.OrderCreateView.as_view(), name='order-create'),
    path('payment-config/', views.PaymentConfigView.as_view(), name='payment-config'),
    path('', views.OrderHistoryView.as_view(), name='order-history'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
]
