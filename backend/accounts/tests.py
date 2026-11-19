import json
import re

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import Client, TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

JSON = 'application/json'


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', SECURE_SSL_REDIRECT=False)
class AccountFlowTests(TestCase):
    def setUp(self):
        self.client = Client()

    def post_json(self, url, payload):
        return self.client.post(url, data=json.dumps(payload), content_type=JSON)

    def test_register_login_me(self):
        response = self.post_json('/api/accounts/register/', {
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
        })
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()['username'], 'alice')
        self.assertTrue(User.objects.filter(username='alice', profile__isnull=False).exists())

        response = self.post_json('/api/accounts/login/', {
            'username': 'alice',
            'password': 'StrongPass123!',
        })
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['username'], 'alice')

        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['email'], 'alice@example.com')

    def test_login_with_wrong_password(self):
        User.objects.create_user('bob', 'bob@example.com', 'StrongPass123!')
        response = self.post_json('/api/accounts/login/', {
            'username': 'bob',
            'password': 'wrong-password',
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.json())

    def test_password_reset_request_and_confirm(self):
        user = User.objects.create_user('carol', 'carol@example.com', 'OldPass123!')
        mail.outbox = []

        response = self.post_json('/api/accounts/password/reset/', {'email': 'carol@example.com'})
        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn('message', response.json())
        self.assertEqual(len(mail.outbox), 1)
        body = mail.outbox[0].body
        match = re.search(r'/reset-password/([^/\s]+)/([^\s]+)', body)
        self.assertIsNotNone(match, body)
        uid, token = match.groups()

        new_password = 'FreshSecret789!'
        response = self.post_json('/api/accounts/password/reset/confirm/', {
            'uid': uid,
            'token': token,
            'new_password': new_password,
        })
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json(), {'message': 'Password reset successfully'})
        user.refresh_from_db()
        self.assertTrue(user.check_password(new_password))

        response = self.post_json('/api/accounts/login/', {
            'username': 'carol',
            'password': new_password,
        })
        self.assertEqual(response.status_code, 200, response.content)

    def test_password_reset_does_not_reveal_unknown_email(self):
        mail.outbox = []
        response = self.post_json('/api/accounts/password/reset/', {'email': 'nobody@example.com'})
        self.assertEqual(response.status_code, 200, response.content)
        self.assertIn('message', response.json())
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_rejects_bad_token(self):
        user = User.objects.create_user('dave', 'dave@example.com', 'OldPass123!')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        response = self.post_json('/api/accounts/password/reset/confirm/', {
            'uid': uid,
            'token': default_token_generator.make_token(user) + 'bad',
            'new_password': 'AnotherPass123!',
        })
        self.assertEqual(response.status_code, 400, response.content)
        self.assertIn('error', response.json())
