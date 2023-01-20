from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout

from user.models import SiteUser
from ticketapp.models import TicketUser
from network.models import NetworkProfile
# Create your views here.
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        email = request.POST["email"]
        email = email.lower()
        print(email)
        password = request.POST["password"]
        try:
            user_ = SiteUser.objects.get(email=email)
        except:
            return render(request, "user/login.html", {
                "message": "Invalid username and/or password."
            })

        user = authenticate(request, username=user_.email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("hub:home"))
        else:
            return render(request, "user/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "user/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("hub:home"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        email = email.lower()

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "user/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = SiteUser.objects.create_user(email, username, password)
            user.save()
            networkAccount = NetworkProfile(id=user.id,email=user.email,username = user.name)
            networkAccount.save()
            ticketAccount = TicketUser(id=user.id,email=user.email)
            ticketAccount.save()
        except IntegrityError:
            return render(request, "user/register.html", {
                "message": "Username already taken."
            })
            
        login(request, user)
        return HttpResponseRedirect(reverse("hub:home"))
    else:
        return render(request, "user/register.html")