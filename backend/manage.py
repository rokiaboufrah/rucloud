#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    # Local management commands (migrate, collectstatic, runserver, tests) do not
    # need a persistent secret. Production (gunicorn/wsgi) never reaches this code
    # and still requires DJANGO_SECRET_KEY when DJANGO_DEBUG is False.
    if not os.environ.get('DJANGO_SECRET_KEY'):
        debug_explicitly_off = os.environ.get('DJANGO_DEBUG', '').strip().lower() in ('0', 'false', 'no')
        if not debug_explicitly_off:
            import secrets
            os.environ['DJANGO_SECRET_KEY'] = 'django-insecure-ephemeral-' + secrets.token_urlsafe(50)

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
