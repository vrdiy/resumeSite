from django.urls import path
from ticketapp import views

urlpatterns = [
    path("", views.home, name="home"),
]