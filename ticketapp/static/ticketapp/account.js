document.addEventListener('DOMContentLoaded', function() {
    
    accountTickets();
})

function accountTickets(pagenum =1){

    fetch(`account/tickets?page=${pagenum}`)
    .then(response => {
        if(response.status != 200){
            return false;
        }
        else{
            return response.json();
        }
    })
    .then(tickets =>{
        if(!tickets){
            return false;
        }
        const div = document.getElementById('accountTickets');
        div.innerHTML = '';
        console.log(tickets)
        const paginationUI = page_bootstrap(tickets[tickets.length-1],'accountTickets');
        tickets.pop();
        tickets.forEach(ticket => {
            //const ticket = JSON.parse(ticketa);
            console.log(ticket);
            const li = document.createElement('li');
            li.setAttribute('class','ticketlist');
            const movieName = document.createElement('i');
            movieName.setAttribute('class','moviename');
            const br = document.createElement('br');
            const p = document.createElement('p');
            p.style.paddingLeft = '10vw';
            const anchor = document.createElement('a');
            anchor.setAttribute('href',reviewURL);
            anchor.innerHTML = "Review This Movie";


            movieName.innerHTML = `${ticket.showing.movie.film}`;
            li.append(movieName);
            li.append(`${ticket.showing.date}, ${ticket.showing.time}`);
            li.append(br);
            p.append(`Seat: Column ${ticket.column}, Row ${ticket.row}`);
            li.append(p);
            if(ticket.expired){
                li.append(anchor);
                li.style.color = 'red';
            }
            div.append(li);
        });
        div.append(paginationUI);
        return true;
    })
    .then(err =>{
        if(!err){
            const div = document.getElementById('accountTickets');
            div.innerHTML = `Try logging out or refreshing the page. `;
        }
    })
}