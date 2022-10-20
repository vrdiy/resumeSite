


document.addEventListener('DOMContentLoaded', function() {
    cartlist = document.querySelector("#cart");
    
    cartlist.innerHTML = ''
    console.log(tickets);

    
    for (let i = 0; i < tickets.length; i++) {
        formattedTicket = JSON.parse(tickets[i]);
        li = document.createElement("li");
        li.innerHTML = formattedTicket.showing.movie.film;
        cartlist.append(li);
    };
})