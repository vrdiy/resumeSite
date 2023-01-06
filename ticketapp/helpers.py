from django.core.paginator import Paginator
from ticketapp.models import Showing, Movie, TicketUser, Ticket, Review
from datetime import datetime, timedelta, timezone
from random import random

#paginates and appends page metadata to the end of a container
def pagePack(array,pagesize,pagenum = 1):
    paginator = Paginator(array,pagesize)
    currentpage = paginator.get_page(pagenum)
    page = list(currentpage)

    pagemeta = {}
    pagemeta['count']= paginator.count
    pagemeta['num_pages']= paginator.num_pages
    pagemeta['has_next']= currentpage.has_next()
    pagemeta['has_previous']= currentpage.has_previous()
    pagemeta['page_num'] = pagenum
    page.append(pagemeta)
    return page

def timezoneEST():
    return timezone(timedelta(hours=-5),'est')
#creates 3 showings for each film for the next week(if not already created).
def createShowings():
    today = datetime.now()
    #tz = timezone(timedelta(hours=-5),'est')
    #weekfromtoday = today + timedelta(days=7)

    movies = Movie.objects.all()
    for movie in movies:
        showings = movie.showings.all()
       # Showing(movie=movie,time=date_)
        for day in range(8):
            i = today + timedelta(days=day)
            showingsOnThisDay = []
            for showing in showings:
                if (showing.time.date() == i.date()):
                    showingsOnThisDay.append(showing)
            for x in range(3 - len(showingsOnThisDay)):
                randomTime = datetime(i.year,i.month,i.day,6*(x+1),30 if random()>0.5 else 0,0,0,tzinfo=timezoneEST())
                newShowing_ = Showing(time=randomTime,movie=movie)
                newShowing_.save()
    return



                
