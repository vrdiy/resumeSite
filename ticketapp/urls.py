from django.urls import path
from ticketapp import views

urlpatterns = [
    path("", views.home, name="index"),
    path("seats/<int:id>",views.get_seats, name="get_seats"),
    path("showings", views.get_showings_by_date, name ="getshowingsbydate"),
    path("cart",views.confirmpurchase, name="confirmpurchase"),
    path("cart/add",views.addToCart, name="addToCart"),
    path("cart/remove",views.removeFromCart, name="removeFromCart"),
    path("cart/empty",views.emptyCart,name="emptyCart"),
    path("cart/data",views.cartTickets,name="cartTickets"),
    path("account", views.account_view, name="account"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]