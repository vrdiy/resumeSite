from django.urls import path
from ticketapp import views

urlpatterns = [
    path("", views.home, name="index"),
    path("showing/<int:id>",views.get_showing, name="get_showing"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]