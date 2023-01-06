
class UserRouter:
    """
    A router to control all database operations on models in the
    user application
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read user models go to user database.
        """
        if model._meta.app_label == 'user':
            return 'users'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write user models go to user database.
        """
        if model._meta.app_label == 'user':
            return 'users'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the user app is involved.
        """
        if obj1._meta.app_label == 'user' or \
            obj2._meta.app_label == 'user':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the user app only appears in the 'user'
        database.
        """
        if app_label == 'user':
            return db == 'users'
        return None

class TicketAppRouter:
    """
    A router to control all database operations on models in the
    ticketapp application
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read ticketapp models go to ticketapp database.
        """
        if model._meta.app_label == 'ticketapp':
            return 'ticketapp'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write ticketapp models go to ticketapp database.
        """
        if model._meta.app_label == 'ticketapp':
            return 'ticketapp'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the ticketapp app is involved.
        """
        if obj1._meta.app_label == 'ticketapp' or \
           obj2._meta.app_label == 'ticketapp':
           return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the ticketapp app only appears in the 'ticketapp'
        database.
        """
        if app_label == 'ticketapp':
            return db == 'ticketapp'
        return None

class NetworkRouter:
    """
    A router to control all database operations on models in the
    network application
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read network models go to network database.
        """
        if model._meta.app_label == 'network':
            return 'network'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write network models go to network database.
        """
        if model._meta.app_label == 'network':
            return 'network'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the network app is involved.
        """
        if obj1._meta.app_label == 'network' or \
           obj2._meta.app_label == 'network':
           return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the network app only appears in the 'network'
        database.
        """
        if app_label == 'network':
            return db == 'network'
        return None