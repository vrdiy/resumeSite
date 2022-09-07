from django.contrib import admin
from .models import Movie, Showing
# Register your models here.

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    pass

@admin.register(Showing)
class ShowingAdmin(admin.ModelAdmin):
    pass