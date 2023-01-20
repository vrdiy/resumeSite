# Setup

First bring down the containers if they're already running:

```
docker-compose -f docker-compose.yml down -v
```

Then spin them up: 
```
docker-compose -f docker-compose.yml up -d --build
```

Create migrations for each app in this order:
```
docker-compose -f docker-compose.yml exec web python manage.py makemigrations user

docker-compose -f docker-compose.yml exec web python manage.py makemigrations ticketapp

docker-compose -f docker-compose.yml exec web python manage.py makemigrations network
```

Then run the migrations in the same order:
```
docker-compose -f docker-compose.yml exec web python manage.py migrate --database=users --fake-initial

docker-compose -f docker-compose.yml exec web python manage.py migrate ticketapp --database=ticketapp --fake-initial

docker-compose -f docker-compose.yml exec web python manage.py migrate network --database=network --fake-initial
```

Run collect static to move all static files into a shared directory:

```
docker-compose -f docker-compose.yml exec web python manage.py collectstatic --noinput --clear
```

Create superuser account:
```
docker-compose -f docker-compose.yml exec web python manage.py createsuperuser --database=users
```