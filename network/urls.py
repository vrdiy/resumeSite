
from django.urls import path, include

from . import views
app_name = 'network'
urlpatterns = [
    path("", views.index, name="index"),
    path("newpost",views.newpost, name="newpost"),
    path("editpost",views.editpost, name="editpost"),
    path("getposts/<int:id>",views.getposts, name="getposts"),
    path("followuser/<int:userid>",views.follow_user, name="followuser"),
    path("likepost/<int:postid>",views.likepost, name="likepost"),
    path("profile/<int:id>",views.load_profile,name="loadprofile"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]
