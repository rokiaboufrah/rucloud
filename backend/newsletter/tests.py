import json

from django.core import mail
from django.test import Client, TestCase, override_settings
from .models import NewsletterSubscriber


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    SECURE_SSL_REDIRECT=False,
)
class NewsletterSubscribeTests(TestCase):
    def test_subscribe(self):
        mail.outbox = []
        response = Client().post(
            '/api/newsletter/subscribe/',
            data=json.dumps({'email': 'subscriber@example.com'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json(), {'message': 'Subscribed successfully'})
        self.assertTrue(NewsletterSubscriber.objects.filter(email='subscriber@example.com').exists())
        self.assertEqual(len(mail.outbox), 1)

    def test_duplicate_subscription_is_rejected(self):
        NewsletterSubscriber.objects.create(email='subscriber@example.com')
        response = Client().post(
            '/api/newsletter/subscribe/',
            data=json.dumps({'email': 'subscriber@example.com'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400, response.content)
        self.assertEqual(NewsletterSubscriber.objects.count(), 1)
