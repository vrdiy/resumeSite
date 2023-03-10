"""
Django settings for ticketproj project.

Generated by 'django-admin startproject' using Django 4.1.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""
#from ticketapp.settings import *
#from network.settings import *


from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG",1)

CSRF_TRUSTED_ORIGINS = os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS").split(" ")
CORS_ORIGIN_WHITELIST = os.environ.get("DJANGO_CORS_ORIGIN_WHITELIST").split(" ")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS").split(" ")
# Application definition

INSTALLED_APPS = [
    'user',
    'ticketapp',
    'upload',
    'network',
    'hub',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ticketproj.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ticketproj.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases
DATABASE_ROUTERS = ['ticketproj.routers.UserRouter','ticketproj.routers.TicketAppRouter','ticketproj.routers.NetworkRouter']
SITE_ID = 1
DATABASES = {
    'default' : {},
    'users' : {
        "ENGINE": os.environ.get("SQL_ENGINE_USERS", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("SQL_DATABASE_USERS", BASE_DIR / "db.sqlite3"),
        "USER": os.environ.get("SQL_USER_USERS", "user"),
        "PASSWORD": os.environ.get("SQL_PASSWORD_USERS", "password"),
        "HOST": os.environ.get("SQL_HOST_USERS", "localhost"),
        "PORT": os.environ.get("SQL_PORT_USERS", "5432"),
    },
    'ticketapp': {
        "ENGINE": os.environ.get("SQL_ENGINE_TICKETAPP", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("SQL_DATABASE_TICKETAPP", BASE_DIR / "db.sqlite3"),
        "USER": os.environ.get("SQL_USER_TICKETAPP", "user"),
        "PASSWORD": os.environ.get("SQL_PASSWORD_TICKETAPP", "password"),
        "HOST": os.environ.get("SQL_HOST_TICKETAPP", "localhost"),
        "PORT": os.environ.get("SQL_PORT_TICKETAPP", "5431"),
    },
    'network': {
        "ENGINE": os.environ.get("SQL_ENGINE_NETWORK", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("SQL_DATABASE_NETWORK", BASE_DIR / "db.sqlite3"),
        "USER": os.environ.get("SQL_USER_NETWORK", "user"),
        "PASSWORD": os.environ.get("SQL_PASSWORD_NETWORK", "password"),
        "HOST": os.environ.get("SQL_HOST_NETWORK", "localhost"),
        "PORT": os.environ.get("SQL_PORT_NETWORK", "5430"),
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / "staticfiles"


#Media files from user uploads
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"


# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'user.SiteUser'
