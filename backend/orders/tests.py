import base64
import json
import tempfile

from django.contrib.auth.models import User
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings
from products.models import Product, ProductSize

from cart.models import Cart, CartItem
from .models import Order

PNG_BYTES = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC'
)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    SECURE_SSL_REDIRECT=False,
    ADMIN_EMAIL='admin@example.com',
)
class OrderFlowTests(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        media_override = override_settings(MEDIA_ROOT=self.tmp.name)
        media_override.enable()
        self.addCleanup(media_override.disable)
        self.addCleanup(self.tmp.cleanup)

        self.client = Client()
        self.user = User.objects.create_user('buyer', 'buyer@example.com', 'StrongPass123!')
        self.other = User.objects.create_user('stranger', 'stranger@example.com', 'StrongPass123!')
        self.product = Product.objects.create(name='Test Dress', slug='test-dress', price='250.00')
        self.size = ProductSize.objects.create(product=self.product, name='M', stock=5)

    def order_payload(self, **overrides):
        payload = {
            'full_name': 'Buyer Name',
            'email': 'buyer@example.com',
            'phone': '0550000000',
            'address': '1 Test Street',
            'city': 'Constantine',
            'country': 'Algeria',
            'payment_method': 'ccp',
            'shipping_cost': '500.00',
        }
        payload.update(overrides)
        return payload

    def post_json(self, url, payload):
        return self.client.post(url, data=json.dumps(payload), content_type='application/json')

    def create_order(self, user=None, **overrides):
        values = {
            'user': user or self.user,
            'full_name': 'Buyer Name',
            'email': 'buyer@example.com',
            'phone': '0550000000',
            'address': '1 Test Street',
            'city': 'Constantine',
            'country': 'Algeria',
            'payment_method': 'ccp',
            'total': '1000.00',
        }
        values.update(overrides)
        return Order.objects.create(**values)

    def test_create_order_happy_path_and_stock_decrement(self):
        self.client.login(username='buyer', password='StrongPass123!')
        add = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 2,
        })
        self.assertEqual(add.status_code, 200, add.content)

        mail.outbox = []
        response = self.post_json('/api/orders/create/', self.order_payload())
        self.assertEqual(response.status_code, 201, response.content)
        data = response.json()
        self.assertEqual(data['payment_status'], 'pending')
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['total'], '1000.00')

        order = Order.objects.get(id=data['id'])
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.user, self.user)
        self.size.refresh_from_db()
        self.assertEqual(self.size.stock, 3)
        self.assertEqual(CartItem.objects.filter(cart__user=self.user).count(), 0)
        self.assertEqual(len(mail.outbox), 2)

    def test_create_order_rolls_back_when_stock_is_insufficient(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, size=self.size, quantity=9)
        self.client.login(username='buyer', password='StrongPass123!')

        response = self.post_json('/api/orders/create/', self.order_payload())
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('error', response.json())
        self.assertEqual(Order.objects.count(), 0)
        self.size.refresh_from_db()
        self.assertEqual(self.size.stock, 5)
        self.assertEqual(CartItem.objects.count(), 1)

    def test_create_order_rejects_international_shipping(self):
        self.client.login(username='buyer', password='StrongPass123!')
        self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'size_id': self.size.id,
            'quantity': 1,
        })
        response = self.post_json('/api/orders/create/', self.order_payload(country='France'))
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('error', response.json())
        self.assertEqual(Order.objects.count(), 0)

    def upload(self, order, username='buyer', field='receipt', content_type='image/png', content=PNG_BYTES):
        self.client.login(username=username, password='StrongPass123!')
        upload = SimpleUploadedFile('receipt.png', content, content_type=content_type)
        return self.client.post(f'/api/orders/{order.id}/receipt/', data={field: upload})

    def test_receipt_upload_success(self):
        order = self.create_order()
        response = self.upload(order)
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(response.json()['payment_receipt'])
        self.assertIn('payment_status', response.json())
        order.refresh_from_db()
        self.assertTrue(order.payment_receipt.name.startswith('payment_receipts/receipt'))

    def test_receipt_upload_rejects_other_owner(self):
        order = self.create_order()
        response = self.upload(order, username='stranger')
        self.assertEqual(response.status_code, 403, response.content)
        self.assertEqual(response.json(), {
            'error': 'You are not allowed to upload a receipt for this order'
        })
        order.refresh_from_db()
        self.assertFalse(order.payment_receipt)

    def test_receipt_upload_validation(self):
        order = self.create_order()
        response = self.upload(order, content=b'not an image', content_type='text/plain')
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('error', response.json())

        response = self.upload(order, content=b'x' * (5 * 1024 * 1024 + 1))
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('error', response.json())

        response = self.upload(order, field='wrong_field')
        self.assertEqual(response.status_code, 400, response.content)

        cod_order = self.create_order(payment_method='cod')
        response = self.upload(cod_order)
        self.assertEqual(response.status_code, 400, response.content)

        paid_order = self.create_order(payment_status='paid')
        response = self.upload(paid_order)
        self.assertEqual(response.status_code, 400, response.content)

        response = self.upload(Order(id=999999))
        self.assertEqual(response.status_code, 404, response.content)
        self.assertIn('error', response.json())
