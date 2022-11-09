
from datetime import datetime, timedelta
from email.policy import default
import json
from msilib.schema import Error
from queue import Empty
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
    #print(movieObjs)
    allShowings = []
    for title in movieObjs:
            allShowings.append(title.serialize())
    decodedtickets = sessionTicketsWithInfo(request)
    return render(request,'ticketapp/index.html', {
        "movies" : movieObjs,
        "currentdatetime" : datetime.now(),
        'tickets' : decodedtickets
    })

def reviews(request,id):
    return render(request,"ticketapp/review.html")

#only called by other view functions
def sessionTicketsWithInfo(request):
    decodedtickets = []
    showings = Showing.objects.all()
    try:
        for ticket in request.session["tickets"]:

            fullticket = json.loads(ticket)
            fullticket['showing'] = showings.get(id=fullticket['showing']).serialize()
            decodedtickets.append(json.dumps(fullticket))
        print('decoded tickes')
        print(decodedtickets)
        print('decoded tickes')

        return decodedtickets
    except:
        print("exception sessionTicketsWithInfo")
        return decodedtickets

#called from fetch api for p5 cart data.
def cartTickets(request):
    return JsonResponse({'cartTickets': sessionTicketsWithInfo(request)},safe=False,status=200)

def validateCartTickets(request):
    #loop through all cart tickets and make sure there are no duplicates. And that they are all available.
    tickets = request.session["tickets"]
    showings_ = Showing.objects.all()
    #try to create all tickets
    validTickets = []
    invalidTickets = []
    invalidAdjacentTickets = []
    user_ = User.objects.get(id=request.user.id)
    for ticket in tickets:
        ticket_ = json.loads(ticket)
        try:
            showing_ = Showing.objects.get(id=ticket_["showing"])
            # get_or_create() is almost a great solution but it saves the entry it creates...
            # which isn't wanted because you may only want to buy a set of seats if you can get them all
            # if a user wants to buy two seats side by side, and one is taken. They probably don't want the one available seat anymore.

            #tempTicket, newTicketWasCreated = Ticket.objects.get_or_create(holder = user_,showing = showing_,tcolumn = ticket_["column"],trow = ticket_["row"])
            newTicketWasCreated = True
            try:
                tempTicket = Ticket.objects.get(holder = user_,showing = showing_,tcolumn = ticket_["column"],trow = ticket_["row"])
                newTicketWasCreated = False
            except Ticket.DoesNotExist:
                tempTicket = Ticket(holder = user_,showing = showing_,tcolumn = ticket_["column"],trow = ticket_["row"])
                newTicketWasCreated = True

            if(newTicketWasCreated):
                isDuplicate = False
                for i in validTickets:
                    if(i.showing != tempTicket.showing):
                        if(i.tcolumn != tempTicket.tcolumn):
                            if(i.trow != tempTicket.trow):
                                isDuplicate = True       
                if(not isDuplicate):
                    validTickets.append(tempTicket.serialize())
            else:
                invalidTickets.append(tempTicket.serialize())
        except:
            print("validation failed")
        
    return JsonResponse({'invalidTickets': invalidTickets, 'validTickets': validTickets},safe=False,status=200)

    


def confirmpurchase(request):
    decodedtickets = sessionTicketsWithInfo(request)
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse('login'))
        else:
            response = validateCartTickets(request)
            if(len(json.loads(response.content)['invalidTickets'])):
                print("invalidtickets")
                return render(request,"ticketapp/cart.html", {'invalidTickets' : json.loads(response.content)['invalidTickets'], 'tickets' : decodedtickets})
            else:
                ticketObjs = json.loads(response.content)['validTickets']
                for ticket in ticketObjs:
                    
                    ticket.save()
        return HttpResponseRedirect(reverse('index'))

    return render(request,"ticketapp/cart.html", {'tickets' : decodedtickets})


def removeFromCart(request):
    message = 'success'
    try:
        tempCart = request.session["tickets"]
        del tempCart[int(request.GET.get("index"))]
        request.session["tickets"] = tempCart
        return JsonResponse(message,safe = False,status = 200)    
    except TypeError:
        message = "TypeError"
    except IndexError:
        message = "IndexError"

    return JsonResponse(message,safe = False,status = 400)


def emptyCart(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse('login'))
        else:
            request.session["tickets"] = []
            return HttpResponseRedirect(reverse('confirmpurchase'))

#Adds tickets from P5 sketch to cart
@csrf_exempt
def addToCart(request):
    try:
        if request.session["tickets"] == None:
            request.session["tickets"] = []
    except:
            request.session["tickets"] = []
    if request.method == "POST":
        data = json.loads(request.body)
        selectedTickets = data.get("selectedTickets_",None)
        selectedShowing = data.get("showingid",0)
        if (selectedTickets):
            for ticket in selectedTickets:
                tdata = {"showing" : selectedShowing, "column" : ticket['column'], "row" : ticket['row']}
                request.session["tickets"].append(json.dumps(tdata))
                request.session.modified = True
        print(request.session["tickets"])
    return JsonResponse(selectedTickets,safe = False,status = 200)


def get_showings_by_date(request):
    today = datetime.now()
    weekfromtoday = today + timedelta(days=7)
    showings = []
    allshowings = Showing.objects.all()
    allshowings = allshowings.order_by('time').all()

    try:
        rday = int(request.GET.get('day'))
        rmonth = int(request.GET.get('month'))
        ryear = int(request.GET.get('year'))
        date = datetime(ryear,rmonth,rday)
        if today.date() <= date.date() <= weekfromtoday.date():
            for i in allshowings:
                if((i.time.day == int(request.GET.get('day'))) and (i.time.month == int(request.GET.get('month'))) and (i.time.year == int(request.GET.get('year')))):
                    showings.append(i.serialize())
            return JsonResponse(showings,safe = False,status = 200)
        else:
            #date out of range
            for i in allshowings:
                if((i.time.day == today.day) and (i.time.month == today.month) and (i.time.year == today.year)):
                    showings.append(i.serialize())
            showings = {}
            return JsonResponse(showings,safe = False,status = 400)
    except (ValueError, TypeError):
        #arguments either missing or not 'integers'
        for i in allshowings:
                if((i.time.day == today.day) and (i.time.month == today.month) and (i.time.year == today.year)):
                    showings.append(i.serialize())
        showings = {}
        return JsonResponse(showings,safe = False,status = 400)


 
def get_seats(request,id):
    try:
        showing = Showing.objects.get(id=id)
        return JsonResponse(showing.seats(), status = 200)
    except Showing.DoesNotExist:
        return JsonResponse("showing does not exist",safe=False,status=400)
        


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