from django.shortcuts import render


def home(request):
    return render(request,"hub/home.html",{

    })

def about(request):
    return render(request,"hub/about.html",{
})