from django.urls import include, path
from ticketapp import views
app_name = 'ticketapp'
urlpatterns = [
    path("", views.home, name="index"),
    path("seats/<int:id>",views.get_seats, name="get_seats"),
    path("showings", views.get_showings_by_date, name ="getshowingsbydate"),
    path("reviews",views.reviews, name="reviews"),
    path("reviews/user",views.userreviews, name="userreviews"),
    path("reviews/<int:pagenum>",views.moviesRatings,name="moviesratings"),
    path("cart",views.confirmpurchase, name="confirmpurchase"),
    path("cart/add",views.addToCart, name="addToCart"),
    path("cart/remove",views.removeFromCart, name="removeFromCart"),
    path("cart/empty",views.emptyCart,name="emptyCart"),
    path("cart/data",views.cartTickets,name="cartTickets"),
    path("account", views.account_view, name="account"),
    path("account/tickets", views.account_tickets, name="accounttickets"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]
