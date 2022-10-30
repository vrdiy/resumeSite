


document.addEventListener('DOMContentLoaded', function() {
    
    console.log(tickets);
    loadTickets();
})

canDelete = true;
function loadTickets(){
    //Create tickets from cart, these can be removed in this view
    const cartlist = document.querySelector("#cart");
    cartlist.innerHTML = ''
    if(tickets.length === 0){
        const emptyCart = document.createElement("li")
        emptyCart.setAttribute("class","ticketlist");
        emptyCart.innerHTML = "Oh no! Your cart is empty!";
        cartlist.append(emptyCart);
        return
    }
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
                if(canDelete){
                    canDelete = false;
                    deleteButton.remove();
                    li.style.animationPlayState = "running";
                }
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
        if(response.status == 200){
            tickets.splice(index,1);
            loadTickets();
            canDelete = true;
        }
        return response.json();
    })
}
