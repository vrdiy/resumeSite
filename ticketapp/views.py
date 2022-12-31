
from datetime import datetime, timedelta
from email.policy import default
import json
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
from django.templatetags.static import static
import html
from django.shortcuts import render


# Create your views here.
from django.http import HttpResponse

from ticketapp.models import Showing, Movie, User, Ticket, Review
from ticketapp.helpers import pagePack, createShowings, timezoneEST
from datetime import datetime, timedelta, timezone


def home(request):
    movieObjs = Movie.objects.all()
    createShowings()
    #need static path for p5 sketch:
    fontpath = static('/ticketapp/MovieBill-M86w.ttf')
    allShowings = []
    for title in movieObjs:
            allShowings.append(title.serialize())
    decodedtickets = sessionTicketsWithInfo(request)
    return render(request,'ticketapp/index.html', {
        "movies" : movieObjs,
        "currentdatetime" : datetime.now(),
        'tickets' : decodedtickets,
        'fontpath' : fontpath
    })

def moviesRatings(request,pagenum):
    movies = Movie.objects.all()
    serializedMovies = []
    for movie in movies:
        serializedMovies.append(movie.serialize())
    return JsonResponse(pagePack(serializedMovies,10,pagenum),safe=False,status=200)

def userreviews(request):
    mov = Movie.objects.get(id=int(request.GET.get("movieid")))
    pagenum = int(request.GET.get("page"))
    serializedReviews = []
    for review in mov.reviews.all():
        serializedReviews.append(review.serialize())

    if request.user.is_authenticated:
        user_ = User.objects.get(id=request.user.id)
        thisUsersReviews = mov.reviews.filter(user=user_)
        

        try:
            userreview_ = mov.reviews.get(user=user_).serialize()
        except Review.DoesNotExist:
            userreview_ = ''
            
        return JsonResponse({"reviews" : pagePack(serializedReviews,10,pagenum),"userreview" : userreview_},safe=False,status=200)


def reviews(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse('login'))
        user_ = User.objects.get(id=request.user.id)
        movie_ = Movie.objects.get(id=request.POST["movieid"])
        #review = Review(user = user_,content = request.POST["comment"],movie = movie_,rating=int(request.POST["rating"]))


        try:
            review_ = Review.objects.get(user = user_,movie = movie_)
            reviewCreated = False
        except Review.DoesNotExist:
            review_ = Review(user = user_,content = request.POST["comment"],movie = movie_,rating=int(request.POST["rating"]))
            reviewCreated = True

        if reviewCreated:
            review_.save()
        else:
            review_.content = request.POST["comment"]
            review_.rating = int(request.POST["rating"])
            review_.save()

        return HttpResponseRedirect(reverse('reviews'))

    movies = Movie.objects.all()
    serializedMovies = []
    for movie in movies:
        serializedMovies.append(movie.serialize())
    return render(request,"ticketapp/reviews.html",{
        "movies" : serializedMovies
    })

#only called by other view functions
def sessionTicketsWithInfo(request):
    decodedtickets = []
    showings = Showing.objects.all()
    try:
        if request.session["tickets"] == None:
            request.session["tickets"] = []
    except:
            request.session["tickets"] = []
    
    for ticket in request.session["tickets"]:
        try:
            fullticket = json.loads(ticket)
            fullticket['showing'] = showings.get(id=fullticket['showing']).serialize()
            decodedtickets.append(json.dumps(fullticket))
        except Showing.DoesNotExist:
            print("showing does not exist")

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
       
        showing_ = Showing.objects.get(id=ticket_["showing"])
        
        # get_or_create() is almost a great solution but it saves the entry it creates...
        # which isn't wanted because you may only want to buy a set of seats if you can get them all
        # if a user wants to buy two seats side by side, and one is taken. They probably don't want the one available seat anymore.
        #newTicketWasCreated = True
        try:
            tempTicket = Ticket.objects.get(showing = showing_,tcolumn = ticket_["column"],trow = ticket_["row"])
            newTicketWasCreated = False
        except Ticket.DoesNotExist:
            tempTicket = Ticket(holder = user_,showing = showing_,tcolumn = ticket_["column"],trow = ticket_["row"])
            newTicketWasCreated = True

        showing_.checkExpiration()
        if(showing_.expired):
            invalidTickets.append(tempTicket.serialize()) 
        else:
            if(newTicketWasCreated):
                isDuplicate = False
                for i in validTickets:
                    if(i["showing"]["id"] == tempTicket.showing.id):
                        if(i["column"] == tempTicket.tcolumn):
                            if(i["row"] == tempTicket.trow):
                                isDuplicate = True       
                if(not isDuplicate):
                    validTickets.append(tempTicket.serialize())
            else:
                invalidTickets.append(tempTicket.serialize()) 
    return JsonResponse({'invalidTickets': invalidTickets, 'validTickets': validTickets},safe=False,status=200)

    


def confirmpurchase(request):
    decodedtickets = sessionTicketsWithInfo(request)
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse('login'))
        else:
            response = validateCartTickets(request)
            if(len(json.loads(response.content)['invalidTickets'])):
                return render(request,"ticketapp/cart.html", {'invalidTickets' : json.loads(response.content)['invalidTickets'], 'tickets' : decodedtickets})
            else:
                
                showings_ = Showing.objects.all()
                user_ = User.objects.get(id=request.user.id)
                ticketObjs = json.loads(response.content)['validTickets']
                
                for ticket in ticketObjs:
                    showing_ = Showing.objects.get(id=ticket["showing"]["id"])
                    ticket = Ticket(holder = user_,showing = showing_,tcolumn = ticket["column"],trow = ticket["row"])
                    ticket.save()
                    request.session["tickets"] = []
                    request.session.modified = True
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

#sorting predicate for cart tickets, used only by views.addToCart, kind of jank~
def showingDate(sessionShowingObj):
    ticket = json.loads(sessionShowingObj)
    
    showingObj = Showing.objects.get(id=ticket['showing'])
    
    
    return showingObj.time

#Adds tickets from P5 sketch to cart
@csrf_exempt
def addToCart(request):
    if request.method == "POST":
        try:
            if request.session["tickets"] == None:
                request.session["tickets"] = []
        except:
            request.session["tickets"] = []

        #make sure the showing still exists, old tickets in cart for example would be an issue
        ticketlist = []
        for i in request.session["tickets"]:
            ticket_ = json.loads(i)
            try:
                showing_ = Showing.objects.get(id=ticket_["showing"])
                ticketlist.append(i)
                print("appended ticket")
            except:
                print("showing does not exist")
        request.session["tickets"] = ticketlist
        request.session.modified = True
        data = json.loads(request.body)
        selectedTickets = data.get("selectedTickets_",None)
        selectedShowing = data.get("showingid",0)
        if (selectedTickets):
            for ticket in selectedTickets:
                tdata = {"showing" : selectedShowing, "column" : ticket['column'], "row" : ticket['row']}
                request.session["tickets"].append(json.dumps(tdata))
                request.session["tickets"].sort(key=showingDate)
                request.session.modified = True
    return JsonResponse(selectedTickets,safe = False,status = 200)


def get_showings_by_date(request):
    today = datetime.now(tz=timezone.utc)
    today = today + timedelta(hours=-5)
    weekfromtoday = today + timedelta(days=7)
    showings = []
    allshowings = Showing.objects.all()
    allshowings = allshowings.order_by('time').all()
    movies = Movie.objects.all()

    try:
        rday = int(request.GET.get('day'))
        rmonth = int(request.GET.get('month'))
        ryear = int(request.GET.get('year'))
        date = datetime(ryear,rmonth,rday)

        try:
            pagenum = request.GET.get('page')
        except KeyError: 
            pagenum = 1

        if today.date() <= date.date() <= weekfromtoday.date():

            for movie in movies:
                showingsForThisMovieToday = []
                thisMoviesShowings = movie.showings.all()
                for showing in thisMoviesShowings:

                    if((showing.time.day == int(request.GET.get('day'))) and (showing.time.month == int(request.GET.get('month'))) and (showing.time.year == int(request.GET.get('year'))) and (showing.time.timestamp() > today.timestamp())):
                        showingsForThisMovieToday.append(showing.serialize())
                if(len(showingsForThisMovieToday)):
                    showings.append(showingsForThisMovieToday)
            return JsonResponse(pagePack(showings,4,pagenum),safe = False,status = 200)

        else:
            #date out of range
            showings = {}
            return JsonResponse(showings,safe = False,status = 400)

    except Exception as exception:
        print(exception)
        #arguments either missing or not 'integers'
        showings = {}
        return JsonResponse(showings,safe = False,status = 400)


 
def get_seats(request,id):
    try:
        showing = Showing.objects.get(id=id)
        return JsonResponse({"seats" :showing.seats(), "gif" : showing.movie.gif}, status = 200)
    except Showing.DoesNotExist:
        return JsonResponse("showing does not exist",safe=False,status=400)
        

def account_view(request):
    return render(request,"ticketapp/account.html")

def account_tickets(request):
    if(request.user.is_authenticated):
        user_ = User.objects.get(id=request.user.id)
        ownedTickets = Ticket.objects.filter(holder=user_)
        ownedTickets = ownedTickets.order_by("-showing")
        serializedTickets = []

        try:
            pagenum = request.GET.get('page')
            paginator = Paginator(ownedTickets,10)
            currentpage = paginator.get_page(pagenum)
            for ticket in currentpage:
                ticket.checkExpiration()
                serializedTickets.append(ticket.serialize())
            
            #same operation as pagePack function but done seperate because of ticket expiration check. Otherwise would check all tickets or have to parse them out of paginated list.
            pagemeta = {}
            pagemeta['count']= paginator.count
            pagemeta['num_pages']= paginator.num_pages
            pagemeta['has_next']= currentpage.has_next()
            pagemeta['has_previous']= currentpage.has_previous()
            pagemeta['page_num'] = pagenum

            serializedTickets.append(pagemeta)
            return JsonResponse(serializedTickets,safe=False,status=200)
        
        except KeyError:
            return JsonResponse("Server Error",safe=False,status=500)



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