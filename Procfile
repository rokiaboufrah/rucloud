web: gunicorn config.wsgi:application --workers=4 --max-requests=1200 --timeout=30 --access-logfile - --error-logfile -
release: python manage.py migrate --noinput
