


document.addEventListener('DOMContentLoaded', function() {
    cartlist = document.querySelector("#cart");
    cartlist.innerHTML = ''
    
    console.log(tickets);
    loadTickets();
})


function loadTickets(){
    //Create tickets from cart, these can be removed in this view
    document.querySelector("#cart").innerHTML = '';
    for (let i = 0; i < tickets.length; i++) {
        formattedTicket = JSON.parse(tickets[i]);
        const li = document.createElement("li");
        const cartIndex = i;
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
            deleteButton.style.width = "5vh";
            deleteButton.src = garbageCan;
            deleteButton.type = "image";
            deleteButton.innerHTML = "Remove";

            deleteButton.addEventListener("click", ()=>{
                deleteButton.remove();
                li.style.animationPlayState = "running";
            })
            li.addEventListener("animationend", ()=>{
                //delete entry from page and cart
                li.remove();
                removeCartIndex(cartIndex);
            })
            
            optionsSpan.append(deleteButton);
            li.append(optionsSpan);

            seatInfoParagraph = document.createElement("p");
            seatInfoParagraph.innerHTML = `Seat: Column: ${formattedTicket.column}, Row ${formattedTicket.row}`;
            li.append(seatInfoParagraph);
            
            
        cartlist.append(li);
    };
    
}
function removeCartIndex(index){

    fetch(`cart/remove?index=${index}`)
    .then(response => {
        return response.json();
    })
    .then(result =>{
        console.log("cartraw:");
        console.log(result);
        tickets = result;
        loadTickets();
    })
}
