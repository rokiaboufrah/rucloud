from io import StringIO

from django.core.management import call_command
from django.test import Client, TestCase, override_settings
from .models import Product, ProductColor, ProductImage, ProductSize


@override_settings(SECURE_SSL_REDIRECT=False)
class ProductListTests(TestCase):
    def test_product_list(self):
        Product.objects.create(name='Visible Product', slug='visible-product', price='10.00')
        Product.objects.create(name='Hidden Product', slug='hidden-product', price='10.00', is_active=False)

        response = Client().get('/api/products/')
        self.assertEqual(response.status_code, 200, response.content)
        names = [item['name'] for item in response.json()]
        self.assertIn('Visible Product', names)
        self.assertNotIn('Hidden Product', names)


class LoadCatalogCommandTests(TestCase):
    def test_load_catalog_is_idempotent(self):
        output = StringIO()
        call_command('load_catalog', stdout=output)
        self.assertEqual(Product.objects.count(), 6)
        self.assertEqual(ProductSize.objects.count(), 17)
        self.assertEqual(ProductImage.objects.count(), 23)
        self.assertEqual(ProductColor.objects.count(), 13)
        self.assertIn('Catalog loaded', output.getvalue())

        second_output = StringIO()
        call_command('load_catalog', stdout=second_output)
        self.assertEqual(Product.objects.count(), 6)
        self.assertIn('already exist', second_output.getvalue())
