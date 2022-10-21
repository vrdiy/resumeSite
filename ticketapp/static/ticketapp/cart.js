


document.addEventListener('DOMContentLoaded', function() {
    cartlist = document.querySelector("#cart");
    
    cartlist.innerHTML = ''
    console.log(tickets);
    console.log(document.cookie)
    loadTickets();
})

function loadTickets(){
    //Create tickets from cart, these can be removed in this view
    for (let i = 0; i < tickets.length; i++) {
        formattedTicket = JSON.parse(tickets[i]);
        li = document.createElement("li");
        li.setAttribute("class","ticketlist");
            movieName = document.createElement("i");
            movieName.setAttribute("class","moviename");
            movieName.innerHTML = formattedTicket.showing.movie.film;
            li.append(movieName);
            li.innerHTML += `${formattedTicket.showing.date}, ${formattedTicket.showing.time}<br>`
    
            optionsSpan = document.createElement("span");
            optionsSpan.style.float ="right";
            const deleteButton = document.createElement("input");
            deleteButton.style.paddingBottom = "4px";
            deleteButton.style.backgroundColor = "#FF0000"
            deleteButton.style.width = "32px";
            deleteButton.src = garbageCan;
            deleteButton.type = "image";
            deleteButton.innerHTML = "Remove";
            deleteButton.addEventListener("click", ()=>{
                //delete entry from page and cart
                console.log("clicked");
                deleteButton.parentNode.parentNode.animationPlayState = "running";
            })
            deleteButton.parentNode.parentNode.addEventListener("animationend", ()=>{
                //delete entry from page and cart
                deleteButton.parentNode.parentNode.remove();
            })
            optionsSpan.append(deleteButton);
            li.append(optionsSpan);

            seatInfoParagraph = document.createElement("p");
            seatInfoParagraph.innerHTML = `Seat: Column: ${formattedTicket.column}, Row ${formattedTicket.row}`;
            li.append(seatInfoParagraph);
            
            
        cartlist.append(li);
    };
    
}