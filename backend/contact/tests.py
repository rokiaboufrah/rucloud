import json

from django.core import mail
from django.test import Client, TestCase, override_settings
from .models import ContactMessage


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    SECURE_SSL_REDIRECT=False,
    ADMIN_EMAIL='admin@example.com',
)
class ContactCreateTests(TestCase):
    def test_contact_create(self):
        mail.outbox = []
        response = Client().post(
            '/api/contact/',
            data=json.dumps({
                'name': 'Visitor',
                'email': 'visitor@example.com',
                'subject': 'Question',
                'message': 'Do you ship internationally?',
            }),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json(), {'message': 'Message sent successfully'})
        message = ContactMessage.objects.get()
        self.assertEqual(message.email, 'visitor@example.com')
        self.assertEqual(message.subject, 'Question')
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Visitor', mail.outbox[0].body)

    def test_contact_requires_message(self):
        response = Client().post(
            '/api/contact/',
            data=json.dumps({'name': 'Visitor', 'email': 'visitor@example.com'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400, response.content)
        self.assertEqual(ContactMessage.objects.count(), 0)
