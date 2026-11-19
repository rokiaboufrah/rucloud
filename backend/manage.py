#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    # Local checks/tests do not need a real secret; production (gunicorn/wsgi)
    # still requires DJANGO_SECRET_KEY when DEBUG is False.
    if len(sys.argv) > 1 and sys.argv[1] in ('check', 'test') and not os.environ.get('DJANGO_SECRET_KEY'):
        import secrets
        os.environ['DJANGO_SECRET_KEY'] = secrets.token_urlsafe(50)

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
