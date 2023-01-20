document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('reviewsubcontainer2').style.display = 'none';
    document.getElementById('commentsdiv').style.display = 'none';

    ratingStars();
    setupMoviesToReview();

})
function focusMovie(movieToFocus){

    document.getElementById('reviewsubcontainer2').style.display = 'grid';
    document.getElementById('commentsdiv').style.display = 'block';

    

    const movieElements = document.getElementsByClassName('posters');
    movieElements.forEach(poster =>{
        if(parseInt((poster).getAttribute("id").slice(4)) != movieToFocus){
            poster.style.filter = 'grayscale(100%)';
        }
        else{
            poster.style.filter = '';
            document.getElementById('movieTitle').innerHTML = poster.getAttribute("name");
        }
    })
}
function ratingStars(){
    const reviewstars = document.querySelector('#reviewstars');
    console.log(staricon)
    for (let i = 1; i <= 5; i++){
        const star = document.createElement('img');
        star.setAttribute('class','reviewstar');
        star.setAttribute('id',`star-${i}`);
        star.setAttribute('src',staricon);
        const buttonNum = i;
        star.addEventListener('click',()=>{
            setStarValue(buttonNum);
        })
        reviewstars.append(star);
    }
    
}

function setStarValue(val){
    
    document.getElementById('ratingoption').value = val;
    
        for (let j = 1; j <= 5; j++){
            if(j<=val){
                document.getElementById(`star-${j}`).setAttribute('src',yellowstaricon);
            }else{
                document.getElementById(`star-${j}`).setAttribute('src',staricon);
                
            }
        }
}

function loadUserReviews(movieid,pagenum = 1)
{
    fetch(`reviews/user?movieid=${movieid}&page=${pagenum}`)
    .then(result => {
        if(result.status != 200)
        {
            const error = new Error("Internal Error");
            error.name = 'StatusNotOk'
            throw error;
        }
        else
        {
            return result.json();
        }
    })
    .then(reviews =>{
        const userReviewsDiv = document.getElementById('userReviews');
        userReviewsDiv.innerHTML = '';
        console.log(reviews.userreview)
        if(reviews.userreview != '')
        {
            document.getElementById('text-content').value = reviews.userreview.content;
            setStarValue(parseInt(reviews.userreview.rating))
        }
        else
        {
            document.getElementById('text-content').value = '';
            setStarValue(0);
        }
        reviews.reviews.pop()
        reviews.reviews.forEach(review_ =>{
            const p = document.createElement('p');
            p.setAttribute('class',"userReview");
            p.innerHTML = review_.content;
            userReviewsDiv.append(p);
        })
        if(reviews.reviews.length == 0 )
        {
            document.getElementById('commentsdiv').style.display = 'none';
        }
    })
    .catch(error =>{
        console.log(error)
    })
}

function setupMoviesToReview(pagenum = 1){

    fetch(`reviews/${pagenum}`)
    .then(response =>{
        return response.json()
    })
    .then(response =>{
        pagemeta = response[response.length-1];
        const paginationUI = page_bootstrap(pagemeta,'setupMoviesToReview');
        document.getElementById('pageselect').innerHTML = '';
        document.getElementById('pageselect').append(paginationUI);
        response.pop();
        numMovies = response.length;
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
                loadUserReviews(movie.id);
                document.getElementById('movieid').value = movie.id;
                console.log(movie.id);
            })
            posterimg.setAttribute('class',"posters");
            posterimg.setAttribute('id',`mov-${movie.id}`);
            posterimg.setAttribute('src',movie.preview);
            posterimg.setAttribute('name',movie.film);

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

