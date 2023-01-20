from django.urls import path
from hub import views

app_name = 'hub'
urlpatterns = [
    path("", views.home, name="home"),
    path("about",views.about, name="about")
]