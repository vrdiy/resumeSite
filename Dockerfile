# syntax=docker/dockerfile:1
FROM python:3.9.6-alpine
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /code
COPY requirements.txt /code/
RUN py -3 -m venv .venv && . .venv\scripts\activate && pip install -r requirements.txt

COPY . /code/
CMD ["python","manage.py","runserver","0.0.0.0:8000"]