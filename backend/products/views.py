from rest_framework import generics, permissions
from .models import Collection, Category, Product
from .serializers import CollectionSerializer, CategorySerializer, ProductListSerializer, ProductDetailSerializer

class CollectionListView(generics.ListAPIView):
    queryset = Collection.objects.filter(is_active=True)
    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]

class CollectionDetailView(generics.RetrieveAPIView):
    queryset = Collection.objects.filter(is_active=True)
    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        collection = self.request.query_params.get('collection')
        featured = self.request.query_params.get('featured')
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(name__icontains=q) | queryset.filter(description__icontains=q)
        if category:
            queryset = queryset.filter(category__slug=category)
        if collection:
            queryset = queryset.filter(collection__slug=collection)
        if featured:
            queryset = queryset.filter(is_featured=True)
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
