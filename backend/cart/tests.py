from django.test import Client, TestCase, override_settings
from products.models import Product, ProductSize


@override_settings(SECURE_SSL_REDIRECT=False)
class CartStockTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.product = Product.objects.create(
            name='Test Abaya',
            slug='test-abaya',
            price='100.00',
            is_active=True,
        )
        self.size = ProductSize.objects.create(product=self.product, name='M', stock=2)

    def add(self, quantity):
        return self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': quantity,
        })

    def test_add_respects_size_stock(self):
        response = self.add(1)
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['item_count'], 1)

        response = self.add(3)
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('error', response.json())

        response = self.add(1)
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['item_count'], 2)

        response = self.add(1)
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('Insufficient stock', response.json()['error'])

    def test_update_rejects_quantity_above_stock(self):
        response = self.add(1)
        self.assertEqual(response.status_code, 200, response.content)
        item_id = response.json()['items'][0]['id']

        response = self.client.post(f'/api/cart/update/{item_id}/', {'quantity': 5})
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('error', response.json())

        response = self.client.post(f'/api/cart/update/{item_id}/', {'quantity': 2})
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['item_count'], 2)

    def test_add_rejects_invalid_quantity_and_wrong_size(self):
        response = self.add(0)
        self.assertEqual(response.status_code, 400, response.content)

        other = ProductSize.objects.create(
            product=Product.objects.create(name='Other', slug='other', price='10.00'),
            name='L',
            stock=5,
        )
        response = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'size_id': other.id,
            'quantity': 1,
        })
        self.assertEqual(response.status_code, 400, response.content)
