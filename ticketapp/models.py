
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime, timedelta, timezone
THEATER_COLUMNS = 8
THEATER_ROWS = 10

class TicketUser(models.Model):
    email = models.EmailField(max_length=255,unique=True)


class Ticket(models.Model):
    email = models.EmailField(max_length=255)
    holder = models.ForeignKey("TicketUser",on_delete=models.CASCADE,related_name="tickets")
    showing = models.ForeignKey("Showing",on_delete=models.CASCADE,related_name="seats_taken")
    timestamp = models.DateTimeField(auto_now_add=True)
    tcolumn = models.IntegerField(validators=[MaxValueValidator(THEATER_COLUMNS), MinValueValidator(1)])
    trow = models.IntegerField(validators=[MaxValueValidator(THEATER_ROWS),MinValueValidator(1)])
    expired = models.BooleanField(default=False)

    def anonymizedSeat(self):
        return {
            "column" : self.tcolumn,
            "row" : self.trow
        }
        
    def serialize(self):
        return {
            "column" : self.tcolumn,
            "row" : self.trow,
            "showing" : self.showing.serialize(),
            "expired" : self.expired
        }

    def checkExpiration(self):
        today = datetime.now(tz=timezone.utc)
        today = today + timedelta(hours=-5)
        if today.timestamp() > self.showing.time.timestamp():
            self.expired = True   
        else:
            self.expired = False
        self.save()

    class Meta:
        unique_together = ('showing','trow','tcolumn')
    

class Movie(models.Model):
    film = models.TextField(default="Missing Film Name" ,max_length=100)
    preview = models.URLField(max_length=250)
    gif = models.URLField(max_length=250, null=True)

    def getRating(self):
        rating = 0
        if(self.reviews.exists()):
            for i in self.reviews.all():
                rating += i.rating
            
            return round(rating/len(self.reviews.all()),1)
        else:
            return 0


    def serialize(self):
        return {
            "id" : self.id,
            "film" : self.film,
            "preview" : self.preview,
            "gif" : self.gif,
            "rating" : self.getRating()
        }


class Review(models.Model):
    email = models.EmailField(max_length=255)
    holder = models.ForeignKey(TicketUser,on_delete=models.CASCADE,related_name="reviews")
    movie = models.ForeignKey(Movie,on_delete=models.CASCADE,related_name="reviews")
    content = models.TextField(default="No comment" ,max_length=500)
    rating = models.IntegerField(validators=[MaxValueValidator(5),MinValueValidator(0)])

    def serialize(self):
        return {
            "id" : self.id,
            "movie" : self.movie.film,
            "content" : self.content,
            "rating" : self.rating
        }
    class Meta:
        unique_together = ('email','movie')
    


class Showing(models.Model):
    movie = models.ForeignKey(Movie,on_delete=models.CASCADE,related_name="showings",primary_key=False)
    time = models.DateTimeField(primary_key=False)
    expired = models.BooleanField(default=False)

    def showingTime(self):
        #get rid of leading zero and just return hour/minute of showing
        #there should be a strftime code for this, but it doesn't work on my platform atleast
        if(self.time.strftime("%I:%M %p")[:1] == '0'):
            return self.time.strftime("%I:%M %p")[1:] 
        else:
            return self.time.strftime("%I:%M %p") 



    def serialize(self):
        return{
            "id" : self.id,
            "movie" : self.movie.serialize(),
            "time" : self.showingTime(),
            "date" : self.time.strftime("%B %e"),
            "expired" : self.expired
            }
            
        #split from serialize to be more scalable and only send seats when requested
    def seats(self):
        seats_taken = []
        for seat in self.seats_taken.all():
            seats_taken.append(seat.anonymizedSeat())
        return{
            "seats_taken" : seats_taken
        }

    def checkExpiration(self):
        today = datetime.now(tz=timezone.utc)
        today = today + timedelta(hours=-5)
        if today.timestamp() > self.time.timestamp():
            self.expired = True   
        else:
            self.expired = False
        self.save()

        

