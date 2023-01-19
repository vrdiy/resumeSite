import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
import html
from .models import NetworkProfile, Post
from user.models import SiteUser



def index(request):
    return render(request, "network/index.html", {
        
    })

def load_profile(request,id):
    try: 
        NetworkProfile.objects.get(id=id)
        profile = NetworkProfile.objects.get(id=id)
        followers = profile.followers.all()
        follower = followers.filter(id=request.user.id)
        if not follower:
            follows = False
        else:
            follows = True
        userinfo = {"username": profile.username,"id": profile.id, "followers": profile.follower_count(),"following": profile.following_count(), "isfollowing": follows}
    except NetworkProfile.DoesNotExist:
        
        return JsonResponse({"error": "Profile could not be found."}, status=400)

    return render(request,"network/profile.html",{"userinfo":userinfo})
    
@csrf_exempt
def follow_user(request,userid):
    if(request.user.is_authenticated != True):
        return JsonResponse({"error": "User is not logged in."}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    usertofollow = NetworkProfile.objects.get(id=userid)
    user = NetworkProfile.objects.get(id=request.user.id)

    for followers in usertofollow.followers.all():
        if followers == user:
            usertofollow.followers.remove(user)
            usertofollow.save()
            return JsonResponse({"message": "You've unfollowed this user", "followstatus": "0"}, status=201)
    usertofollow.followers.add(user)
    usertofollow.save()
    return JsonResponse({"message": "User Followed.", "followstatus": "1"}, status=201)

@csrf_exempt
def likepost(request,postid):
    if(request.user.is_authenticated != True):
        return JsonResponse({"error": "User is not logged in."}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    posttocheck = Post.objects.get(id=postid)
    user = NetworkProfile.objects.get(id=request.user.id)

    for liker in posttocheck.likes.all():
        if liker == user:
            posttocheck.likes.remove(user)
            posttocheck.save()
            return JsonResponse({"message": "You've unliked this post", "likestatus": "0"}, status=201)
    posttocheck.likes.add(user)
    posttocheck.save()
    return JsonResponse({"message": "Post Liked.", "likestatus": "1"}, status=201)


@csrf_exempt
def newpost(request):
    if(request.user.is_authenticated != True):
        return JsonResponse({"error": "User is not logged in."}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    postcontent = data.get("textcontent", "")
    postcontent = html.escape(postcontent)
    user = NetworkProfile.objects.get(id=request.user.id)
    post = Post(user=user,textcontent=postcontent)
    post.save()
    return JsonResponse({"message": "Post uploaded successfully."}, status=201)

@csrf_exempt
def editpost(request):
    if(request.user.is_authenticated != True):
        return JsonResponse({"error": "User is not logged in."}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    postcontent = data.get("textcontent", "")
    postcontent = html.escape(postcontent)
    postid = data.get("postid","")
    user = NetworkProfile.objects.get(id=request.user.id)

    posttoedit = Post.objects.get(id=postid)
    if(posttoedit.user == user):
        posttoedit.textcontent = postcontent
        posttoedit.updatePost(postcontent)
        posttoedit.save()
        return JsonResponse({"message": "Post edited successfully.","textcontent":postcontent}, status=201)
    else:
        return JsonResponse({"error": "You are not the owner of this post."}, status=401)


def getposts(request,id):
    if(id != 0):
        try:
            user_ = NetworkProfile.objects.get(id=id)
            posts = Post.objects.filter(user=user_)
        except NetworkProfile.DoesNotExist:
            return JsonResponse({"error": "User does not exist."}, status=400)

    elif(request.GET.get('following') == "true"):
        posts = Post.objects.filter(user__in=user_.following.all())
        user_ = NetworkProfile.objects.get(id=request.user.id)

    else:
        user_ = NetworkProfile.objects.get(id=request.user.id)
        posts = Post.objects.all()


    posts = posts.order_by("-timestamp").all()
    serializedposts = []
    for post in posts:
        initial = post.serialize()
        initial["userhasliked"] = False
        if(user_ == post.user):
            initial["ownpost"] = True
        else:
            initial["ownpost"] = False

        for liker in post.likes.all():
            if liker == user_:
                initial["userhasliked"] = True
        serializedposts.append(initial)
    #print(serializedposts)
    
    paginator = Paginator(serializedposts,10)
    
    try:
        pagenum = request.GET.get('page_number')
        
    except KeyError: 
        pagenum = 1

    currentpage = paginator.get_page(pagenum)
    page = list(currentpage)

    pagemeta = {}
    pagemeta['count']= paginator.count
    pagemeta['num_pages']= paginator.num_pages
    pagemeta['has_next']= currentpage.has_next()
    pagemeta['has_previous']= currentpage.has_previous()
    pagemeta['page_num'] = pagenum
    page.append(pagemeta)
    
    
    return JsonResponse(page,safe=False,status =201)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("network:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = SiteUser.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("network:index"))
    else:
        return render(request, "network/register.html")
