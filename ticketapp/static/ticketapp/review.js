document.addEventListener('DOMContentLoaded', function(){
    const reviewstars = document.querySelector('#reviewstars');
    console.log(staricon)
    for (let i = 0; i < 5; i++){
        const star = document.createElement('img');
        star.setAttribute('class','reviewstar');
        star.setAttribute('id',`star-${i}`);
        star.setAttribute('src',staricon);
        let starstate = false;
        star.addEventListener('click',()=>{
            if(!starstate){
                star.setAttribute('src',yellowstaricon);
                starstate= true;
            }else{
                star.setAttribute('src',staricon);
                starstate= false;
            }
        })
        reviewstars.append(star);
    }
})