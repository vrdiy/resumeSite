
TicketPal by Anthony Verdi //(vrdiy)

--------Distinctiveness and Complexity:--------

TicketPal is a web application with the purpose of making ticket buying fast and easy. In my development configuration it is for movies but it could easily be transformed to any sort of event hosting with an auditorium. On the home page you have a paginated view of available titles at various showtimes, upon clicking on a showtime the accompanying 2d rendered window to your right(large screen) or below(small screen/mobile) will be updated with a gif preview of said movie/event and the seats(which are represented as boxes) will be updated with what is currently available for this showing. Using the power of javascript and session data you can freely browse the different events and load your cart with tickets. When you're finally ready you can go to the secure checkout with CSRF verification, login if you haven't already, and purchase your tickets in a fast and intuitive way. There are ways to manage your tickets, see reviews for events/titles, and view your purchased tickets. The project uses 5 django models, 10+ view functions, good use of js fetch api to speed up user experience, and is mobile responsive. With further reading I am sure this project meets expectation and shows proficiency and understanding of Django, Python, and Javascript. From this point forward "title" refers to a film name.

--------Static Files-------
All .png, .gif, .ttf files in the static/ticketapp directory are used for UI/CSS.

account.js is the javascript file accompanying the account.html template. The code in this file simply uses the fetch api to get a logged in user's tickets. These are checked on the server for expiry and paginated before being displayed on the page.

cart.js accompanies cart.html and is similar in function to account.js. It looks at the user's session data which is holding the tickets, checks their validity, redirects the user to login if not already, and has tools for a user to manipulate their cart. You can remove tickets individually or empty your entire cart. You can then of course purchase the tickets in a secure manner with a CSRF token, and if any tickets are rejected, you are brought back to your cart with a message for which tickets are invalid. No tickets will be bought until your entire cart is valid, this is relevant because imagine you wanted a row of four seats and the third seat was taken, you wouldn't want the others anymore.

p5.js is an external library used solely for the custom mini-theater UI, the implementation of p5 is in index.js. 

index.js accompanies index.html and implements a p5 sketch to draw a 2d rendered mock theater with selection boxes for seats and a gif for a movie preview. There are 3 parallel arrays to keep track of tickets in the theater, one for cart tickets, sold tickets, and selected tickets. The UI reacts to these different properties to make it clear to the user what is going on. Cart tickets are yellow, sold are black, and selected are red. There is an Add To Cart button which adds selected tickets to your session data, which will be used in cart.js to purchase your tickets(see above cart.js). On the page you also have a paginated selection of titles which have showings automatically generated for them(3 per title per day). Showings that have already happened are removed from the page, so you can't mistakenly buy a ticket for a showing that already happened. There are many other small details, index.js is over 500 lines long.

utils.js just has a pagination function that coincides with a pagination function I made in helpers.py. Given a function with a maximum of one required argument and a page metadata object(also from helpers.py) the pagination function will return a pagination html element with it's anchors made automatically using the page metadata. The function you are supplying needs it's one non-default argument to be the page number you are requesting. If you set all this up right it makes pagination super fast and easy, although.. it probably took me longer to make these functions than it would've taken to do manually...

review.js accompanies reviews.html, it's purpose is to let users write reviews for movies and see what others have rated and wrote about the movie. There is a custom little rating stars UI so you can click star rating and write a review for a movie. You're only allowed one review per title, and you can edit it. The ratings for a movie are averaged and displayed under each title on this page.

--------Templates-------

account.html, cart.html, reviews.html, index.html are all essentially just extensions of layout.html and just serve as a husk for the accompanying .js files. The other html files are just defaults from the network project, such as login.html etc.

--------Python Files-------

views.py has nothing out of the ordinary, just server side checks for attempts made by the user, html renders, session data management, and implements a few helper functions of it's own and from helpers.py.

models.py is also what you'd expect, 5 models. User, Review, Showing, Movie, and Ticket. The most notable being Ticket and Showing. The tickets have an anonymous seat function so as to not expose any user data about a seat when being used in other places. Ticket and Showing also have expiry functions that will set a flag. These are checked through cart validation and on the get_showings_by_date view function.

helpers.py has two important functions, pagePack and createShowings. pagePack is a function I made to standardize how pagination information can be passed with a page. It takes the same parameters the Paginator constructor does with page number as an additional argument. It then returns you the array with a dict appended to it that contains page metadata, this is then used by various js files in this project to easily make pagination UI with the function in utils.js. createShowings is called by the home/index view, it checks to see if any showings exist for the next week, for any title that doesn't have atleast 3 showings per day, it will automatically create them.

admin.py has basic implementation of each model for manipulation on the admin page.

--------Running the app--------
p5 is included in my static files, there is no need to go get it elsewhere but it is available online https://cdn.jsdelivr.net/npm/p5/lib/
To run simply:
python manage.py makemigrations
python manage.py migrate --run-syncdb
python manage.py runserver

The tables need to be created for the app to work, but they can be empty. I've included my database but if you do not have it, for showings to be created there needs to be movies, these can be added through the admin portal. From there everything should be very intuitive.

Lastly I do want to thank whoever you are for reading this, and I am grateful for this class because I believe this will be a stepping stone for my life. Thank you -Anthony