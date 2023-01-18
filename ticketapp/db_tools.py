from .models import TicketUser

def delete_TicketUser_data(user_email):
    if TicketUser.objects.filter(email=user_email).exists():
        TicketUser.objects.filter(email=user_email).delete()
