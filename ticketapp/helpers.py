from django.core.paginator import Paginator
from ticketapp.models import Showing, Movie, User, Ticket, Review
from datetime import datetime, timedelta

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

#creates 3 showings for each film that day.
def createShowings(date):
    movies = Movie.objects.all()
    date_ = datetime(date.date)
    for movie in movies:
        Showing(movie=movie,time=date_)
        
