from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse


def home(request):
    return HttpResponseRedirect(reverse('hub:about'))
    
def about(request):
    return render(request,"hub/about.html",{
})

def contact(request):
    return render(request,"hub/contact.html",{
})
