from unittest.mock import patch

from django.test import Client, TestCase, override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class HealthEndpointTests(TestCase):
    def test_health_returns_ok(self):
        response = Client().get('/api/health/')
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json(), {'status': 'ok', 'database': 'ok'})

    @override_settings(SECURE_SSL_REDIRECT=True)
    def test_health_is_exempt_from_ssl_redirect(self):
        response = Client().get('/api/health/')
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()['status'], 'ok')

    def test_health_reports_database_failure_without_raising(self):
        with patch('config.views.connection') as connection, self.assertLogs('config.views', level='ERROR'):
            connection.cursor.side_effect = Exception('database unavailable')
            response = Client().get('/api/health/')
        self.assertEqual(response.status_code, 503, response.content)
        self.assertEqual(response.json(), {'status': 'error', 'database': 'error'})
