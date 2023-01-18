from .models import Post, NetworkProfile

def delete_NetworkProfile_data(user_email):
    if NetworkProfile.objects.filter(email=user_email).exists():
        NetworkProfile.objects.filter(email=user_email).delete()
