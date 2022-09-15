
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
THEATER_COLUMNS = 8
THEATER_ROWS = 10

class User(AbstractUser):
    pass

class Ticket(models.Model):
    holder = models.ForeignKey("User",on_delete=models.CASCADE,related_name="tickets")
    showing = models.ForeignKey("Showing",on_delete=models.CASCADE,related_name="seats_taken")
    timestamp = models.DateTimeField(auto_now_add=True)
    tcolumn = models.IntegerField(validators=[MaxValueValidator(THEATER_COLUMNS), MinValueValidator(1)])
    trow = models.IntegerField(validators=[MaxValueValidator(THEATER_ROWS),MinValueValidator(1)])

    def anonymizedSeat(self):
        return {
            "column" : self.tcolumn,
            "row" : self.trow
        }
    class Meta:
        unique_together = ('showing','trow','tcolumn')
    

class Movie(models.Model):
    film = models.TextField(default="Missing Film Name" ,max_length=100)
    preview = models.URLField(max_length=250)

    def serialize(self):
        return {
            "id" : self.id,
            "film" : self.film,
            "preview" : self.preview
        }

class Showing(models.Model):
    movie = models.ForeignKey(Movie,on_delete=models.CASCADE,related_name="showings")
    time = models.DateTimeField()

    def showingTime(self):
        #get rid of leading zero and just return hour/minute of showing
        if(self.time.strftime("%I:%M %p")[:1] == '0'):
            return { "ftime" : self.time.strftime("%I:%M %p")[1:] }
        else:
            return  { "ftime" : self.time.strftime("%I:%M %p") }

    def serialize(self):
        return{
            "id" : self.id,
            "movie" : self.movie.serialize(),
            "time" : self.showingTime()
            }
            
        #split from serialize to be more scalable and only send seats when requested
    def seats(self):
        seats_taken = []
        for seat in self.seats_taken.all():
            seats_taken.append(seat.anonymizedSeat())
        return{
            "seats_taken" : seats_taken
        }

        

