import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def env_flag(name, default=False):
    value = os.environ.get(name)
    if value is None or not value.strip():
        return default
    return value.strip().lower() in ('1', 'true', 'yes')


def env_list(name, default=''):
    value = os.environ.get(name, default) or ''
    return [item.strip() for item in value.split(',') if item.strip()]


def env_int(name, default):
    value = os.environ.get(name)
    if not value or not value.strip():
        return default
    try:
        return int(value.strip())
    except ValueError:
        return default


def unique(items):
    result = []
    for item in items:
        if item not in result:
            result.append(item)
    return result


DEBUG = env_flag('DJANGO_DEBUG', False)

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '').strip()
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured(
            'DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is False. '
            'Set the DJANGO_SECRET_KEY environment variable before starting the application.'
        )
    SECRET_KEY = 'django-insecure-development-only-secret-change-me'

ALLOWED_HOSTS = env_list(
    'DJANGO_ALLOWED_HOSTS',
    '.onrender.com,.vercel.app,localhost,127.0.0.1',
) or ['.onrender.com', '.vercel.app', 'localhost', '127.0.0.1']

FRONTEND_URL = (os.environ.get('FRONTEND_URL') or 'https://rucloud.vercel.app').strip().rstrip('/')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'rest_framework',
    'corsheaders',
    'whitenoise',
    'accounts',
    'products',
    'cart',
    'orders',
    'contact',
    'newsletter',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'config' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
FIXTURE_DIRS = [BASE_DIR / 'fixtures']

# Security (Render terminates TLS and forwards the original protocol)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    # Render's health checker may call the port directly over HTTP.
    SECURE_REDIRECT_EXEMPT = [r'^api/health/$']
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # The storefront (vercel.app) and API (onrender.com) are different sites:
    # credentialed cross-site requests need SameSite=None plus Secure above.
    SESSION_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SAMESITE = 'None'
    SECURE_HSTS_SECONDS = 31536000

# Default primary key field type
# https://docs.djangoproject.com/en/6.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS / CSRF
DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
]
CORS_ALLOWED_ORIGINS = unique(
    env_list('CORS_ALLOWED_ORIGINS', ','.join(DEFAULT_ORIGINS))
    + env_list('EXTRA_ALLOWED_ORIGINS')
    + [FRONTEND_URL]
)
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = unique(
    env_list('CSRF_TRUSTED_ORIGINS', ','.join(DEFAULT_ORIGINS[:2]))
    + env_list('EXTRA_ALLOWED_ORIGINS')
    + [FRONTEND_URL]
)

# Email (safe by default: nothing is sent to a real SMTP server unless configured)
DEFAULT_FROM_EMAIL = (os.environ.get('DEFAULT_FROM_EMAIL') or 'Ru Cloud <no-reply@rucloud.dz>').strip()
ADMIN_EMAIL = (os.environ.get('ADMIN_EMAIL') or '').strip()
EMAIL_BACKEND = (os.environ.get('EMAIL_BACKEND') or 'django.core.mail.backends.console.EmailBackend').strip()
EMAIL_HOST = (os.environ.get('EMAIL_HOST') or '').strip()
EMAIL_PORT = env_int('EMAIL_PORT', 587)
EMAIL_HOST_USER = (os.environ.get('EMAIL_HOST_USER') or '').strip()
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD') or ''
EMAIL_USE_TLS = env_flag('EMAIL_USE_TLS', False)
EMAIL_USE_SSL = env_flag('EMAIL_USE_SSL', False)
EMAIL_TIMEOUT = env_int('EMAIL_TIMEOUT', 10)

# Payment Configuration (no account numbers in source; set via environment)
BARIDIMOB_PHONE = os.environ.get('BARIDIMOB_PHONE', '')
BARIDIMOB_NAME = os.environ.get('BARIDIMOB_NAME', '')

CCP_ACCOUNT_HOLDER = os.environ.get('CCP_ACCOUNT_HOLDER', '')
CCP_ACCOUNT_NUMBER = os.environ.get('CCP_ACCOUNT_NUMBER', '')
CCP_CLE = os.environ.get('CCP_CLE', '')
CCP_BANK = os.environ.get('CCP_BANK', '')
CCP_ADDRESS = os.environ.get('CCP_ADDRESS', '')

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
