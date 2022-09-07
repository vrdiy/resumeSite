
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxLengthValidator,MaxValueValidator
THEATER_COLUMNS = 8
THEATER_ROWS = 10

class User(AbstractUser):
    pass

class Ticket(models.Model):
    holder = models.ForeignKey("User",on_delete=models.CASCADE,related_name="tickets")
    showing = models.ForeignKey("Showing",on_delete=models.CASCADE,related_name="seats_taken")
    timestamp = models.DateTimeField(auto_now_add=True)
    tcolumn = models.IntegerField(validators=[MaxLengthValidator(1),MaxValueValidator(THEATER_COLUMNS)])
    trow = models.IntegerField(validators=[MaxLengthValidator(1),MaxValueValidator(THEATER_ROWS)])
    

class Movie(models.Model):
    film = models.TextField(default="Missing Film Name" ,max_length=100)
    preview = models.URLField(max_length=250)

class Showing(models.Model):
    movie = models.ForeignKey(Movie,on_delete=models.CASCADE,related_name="showings")
    time = models.DateTimeField()

    def serialize(self):

        return{
            "id" : self.id,
            "movie" : self.movie.film,
            "time" : self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            }

