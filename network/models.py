from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models


#class NetworkUser(AbstractUser):
    #following = models.ManyToManyField("NetworkUser", related_name="followers")
    #def follower_count(self):
       # return self.followers.all().count()
   # def following_count(self):
        #return self.following.all().count()
    

class NetworkProfile(models.Model):
    id = models.SmallIntegerField(verbose_name="id",unique=True, primary_key=True)
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=20, unique=True)
    following = models.ManyToManyField("NetworkProfile",related_name="followers")
    def follower_count(self):
        return self.followers.all().count()
    def following_count(self):
        return self.following.all().count()

class Post(models.Model):
    user = models.ForeignKey(NetworkProfile,on_delete=models.CASCADE, related_name="posts")
    textcontent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(NetworkProfile,blank = True,related_name="liked_post")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "userid": self.user.id,
            "textcontent": self.textcontent,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": [user.username for user in self.likes.all()]
        }
    def updatePost(self,postcontent):
        self.textcontent = postcontent
        return
