
from datetime import datetime
import json
from telnetlib import STATUS
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.forms import ModelForm
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
import html
from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

from ticketapp.models import Showing, Movie, User, Ticket

def home(request):
    movieObjs = Movie.objects.all()
    print(movieObjs)
    allShowings = []
    for title in movieObjs:
            allShowings.append(title.serialize())
    
    return render(request,'ticketapp/index.html', {
        "movies" : movieObjs,
        "currentdatetime" : datetime.now()
    })

def get_showings_by_date(request):
    showings = []
    allshowings = Showing.objects.all()
    for i in allshowings:
        print(i.time.day)
        print("day to compare")
        print(request.GET.get('day'))
        print(i.time.month)
        print("month to compare")
        print(request.GET.get('month'))
        print(i.time.year)
        print("year to compare")
        print(request.GET.get('year'))
        if((i.time.day == request.GET.get('day')) and (i.time.month == request.GET.get('month')) and (i.time.year == request.GET.get('year'))):
            print("got here")
            showings.append(i.serialize())
    return JsonResponse(showings,safe = False,status = 201)



def get_showing(request,id):
    showing = Showing.objects.get(id=id)
    return JsonResponse(showing.serialize(), status = 201)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "ticketapp/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "ticketapp/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "ticketapp/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "ticketapp/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "ticketapp/register.html")