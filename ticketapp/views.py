
from datetime import datetime, timedelta
import json
from re import U
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

def reviews(request,id):
    return render(request,"ticketapp/review.html")

def confirmpurchase(request):
    print(request.session["tickets"])
    decodedtickets = []
    showings = Showing.objects.all()
    #fill tickets with actual showing info when viewed in cart
    for ticket in request.session["tickets"]:

        fullticket = json.loads(ticket)
        fullticket['showing'] = showings.get(id=fullticket['showing']).serialize()
        decodedtickets.append(fullticket)
    #tickets = json.loads(request.session["tickets"])
    print(decodedtickets)
    return render(request,"ticketapp/cart.html", {'tickets' : decodedtickets})
    if request.method == "POST":
        pass
        #process tickets and take to account page.

    data = json.loads(request.body)
    selectedTickets = data.get("tickets",None)
    selectedShowing = data.get("showingid",0)
    print(selectedShowing)
    showing = Showing.objects.get(id=selectedShowing)
    user_ = User.objects.get(id=request.user.id)
    if (selectedTickets):
        return render(request,"ticketapp/cart.html",{
            "tickets" : selectedTickets
        })
        for ticket in selectedTickets:
            print("------")
            print(ticket)

            hold = Ticket(holder = user_,showing = showing, tcolumn = ticket["column"],trow = ticket["row"])
            hold.save()
    

#called from js fetch for ticket validation. then user will be taken to csrf required checkout page to confirm
@csrf_exempt
def checkout(request):
    request.session["tickets"] = []
    if('tickets' not in request.session):
        request.session["tickets"] = []
    if request.method == "POST":
        print(request)
        data = json.loads(request.body)
        selectedTickets = data.get("tickets",None)
        selectedShowing = data.get("showingid",0)
        print(selectedShowing)
        showing = Showing.objects.get(id=selectedShowing)
        user_ = User.objects.get(id=request.user.id)
        if (selectedTickets):
            for ticket in selectedTickets:
                print("------")
                print(ticket)
                tdata = {"showing" : selectedShowing, "column" : ticket['column'], "row" : ticket['row']}
                #tdata = json.dumps(tdata)
                request.session["tickets"].append(json.dumps(tdata))
                #hold = Ticket(holder = user_,showing = showing, tcolumn = ticket["column"],trow = ticket["row"])
                #hold.save()
        
        return HttpResponseRedirect("cart")
    return JsonResponse(selectedTickets,safe = False,status = 200)


def get_showings_by_date(request):
    today = datetime.now()
    print(today)
    weekfromtoday = today + timedelta(days=7)
    showings = []
    allshowings = Showing.objects.all()
    allshowings = allshowings.order_by('time').all()

    try:
        rday = int(request.GET.get('day'))
        rmonth = int(request.GET.get('month'))
        ryear = int(request.GET.get('year'))
        date = datetime(ryear,rmonth,rday)
        if today.day <= date.day <= weekfromtoday.day:
            for i in allshowings:
                if((i.time.day == int(request.GET.get('day'))) and (i.time.month == int(request.GET.get('month'))) and (i.time.year == int(request.GET.get('year')))):
                    showings.append(i.serialize())
            return JsonResponse(showings,safe = False,status = 200)
        else:
            for i in allshowings:
                if((i.time.day == today.day) and (i.time.month == today.month) and (i.time.year == today.year)):
                    showings.append(i.serialize())
            showings = {}
            return JsonResponse(showings,safe = False,status = 400)
    except ValueError:
        for i in allshowings:
                if((i.time.day == today.day) and (i.time.month == today.month) and (i.time.year == today.year)):
                    showings.append(i.serialize())
        showings = {}
        return JsonResponse(showings,safe = False,status = 400)


        





def get_seats(request,id):
    showing = Showing.objects.get(id=id)
    return JsonResponse(showing.seats(), status = 200)


def account_view(request):
    if(request.user.is_authenticated):
        user_ = User.objects.get(id=request.user.id)
        ownedTickets = Ticket.objects.filter(holder=user_)
        ownedTickets = ownedTickets.order_by("-showing")
        serializedTickets = []
        for ticket in ownedTickets:
            serializedTickets.append(ticket.serialize())
        return render(request, "ticketapp/account.html", {
            "ownedTickets" : serializedTickets
        })
    pass


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