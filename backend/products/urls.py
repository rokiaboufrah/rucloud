from django.urls import path
from . import views

urlpatterns = [
    path('collections/', views.CollectionListView.as_view(), name='collections'),
    path('collections/<slug:slug>/', views.CollectionDetailView.as_view(), name='collection-detail'),
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('', views.ProductListView.as_view(), name='products'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
]
