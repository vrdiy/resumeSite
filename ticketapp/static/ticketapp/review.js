document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('reviewsubcontainer2').style.display = 'none';
    ratingStars();
    setupMoviesToReview();
})

function focusMovie(movieToFocus){
    console.log(movieToFocus);
    console.log('what');

    document.getElementById('reviewsubcontainer2').style.display = 'grid';

    for (let i = 0; i < 5; i++){
        if(i != movieToFocus){
            document.getElementById(`star-${i}`).style.filter = 'grayscale(100%)';
        }
        else{
            document.getElementById(`star-${i}`).style.filter = '';

        }
    }
}
function ratingStars(){
    const reviewstars = document.querySelector('#reviewstars');
    console.log(staricon)
    for (let i = 0; i < 5; i++){
        const star = document.createElement('img');
        star.setAttribute('class','reviewstar');
        star.setAttribute('id',`star-${i}`);
        star.setAttribute('src',staricon);
        let starstate = false;
        const buttonNum = i;
        star.addEventListener('click',()=>{
            document.getElementById('ratingoption').value = buttonNum+1;
            console.log(document.getElementById('ratingoption').value)
            for (let j = 0; j < 5; j++){
                if(j<=buttonNum){
                    document.getElementById(`star-${j}`).setAttribute('src',yellowstaricon);
                    // star.setAttribute('src',yellowstaricon); 
                }else{
                    //star.setAttribute('src',staricon);
                    document.getElementById(`star-${j}`).setAttribute('src',staricon);
                    
                }
            }
        })
        reviewstars.append(star);
    }
    
    
}

function setupMoviesToReview(pagenum = 1){

    fetch(`reviews/${pagenum}`)
    .then(response =>{
        return response.json()
    })
    .then(response =>{
        pagemeta = response[response.length-1];
        response.pop();
        console.log(response)
        const container = document.getElementById('reviewsubcontainer');
        container.innerHTML = '';

        response.forEach(movie =>{
            console.log(movie);
            const li = document.createElement('li');
            li.style.listStyle = 'none';
            const span = document.createElement('span');
            const posterimg = document.createElement('img');
            posterimg.addEventListener('click', ()=>{
                focusMovie(movie.id);
                document.getElementById('movieid').value = movie.id;
                console.log(movie.id);
            })
            posterimg.setAttribute('class',"posters");
            posterimg.setAttribute('src',movie.preview);

            const headerWithRating = document.createElement('h2');
            headerWithRating.style.color = "white";
            headerWithRating.style.textAlign = "center";
            if(movie.rating === 0){
                headerWithRating.innerHTML = 'No ratings so far.'
            }
            else{
                headerWithRating.innerHTML = `${movie.rating}/5`

            }
            span.append(posterimg);
            li.append(span);
            li.append(headerWithRating);
            container.append(li);
        })
    })

}

