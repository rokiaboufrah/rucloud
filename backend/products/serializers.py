from rest_framework import serializers
from .models import Collection, Category, Product, ProductImage, ProductSize, ProductColor

class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'name', 'stock']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'order', 'is_primary']

class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    secondary_image = serializers.SerializerMethodField()
    has_multiple_sizes = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'compare_at_price', 'primary_image', 'secondary_image', 'has_multiple_sizes', 'is_featured', 'category']

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            return img.image.url
        return None

    def get_secondary_image(self, obj):
        imgs = obj.images.filter(is_primary=True).first() or obj.images.first()
        if imgs and obj.images.count() > 1:
            second = obj.images.exclude(id=imgs.id).first()
            if second:
                return second.image.url
        return None

    def get_has_multiple_sizes(self, obj):
        return obj.sizes.count() > 1

class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'name', 'hex_code', 'stock']

class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    colors = ProductColorSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'compare_at_price', 'category', 'category_name', 'material', 'care_instructions', 'images', 'sizes', 'colors', 'is_featured', 'created_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'collection']

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug', 'description', 'image', 'order']
