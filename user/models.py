from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class SiteUserAccountManager(BaseUserManager):
    def create_user(self, email, name, password=None):

        if not email:
            raise ValueError('Users must provide email')
        email = self.normalize_email(email)
        email = email.lower()

        user = self.model(
            email=email,
            name=name
        )
        user.set_password(password)
        user.save(using='users')
        print("created user")
        print(self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(email, name, password)

        user.is_superuser = True
        user.is_admin = True
        user.is_staff = True

        user.save(using=self._db)

        return user

class SiteUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(verbose_name='email address', max_length=255,unique=True)
    name = models.CharField(max_length=255)
    date_of_birth = models.DateField(null=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)


    objects = SiteUserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email