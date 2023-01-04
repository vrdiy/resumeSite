#!/bin/sh
#implementation from https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while [! nc -z $SQL_HOST_TICKETAPP $SQL_PORT_TICKETAPP]||[! nc -z $SQL_HOST_NETWORK $SQL_PORT_NETWORK]; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi


#python manage.py flush --no-input
#python manage.py migrate

exec "$@"