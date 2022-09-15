


document.addEventListener('DOMContentLoaded', function() {
  timeselect = document.querySelector("#timeselect");
  let now = new Date();
  //ternary operators are cool
  let formattedDate = `${now.getFullYear()}-${now.getMonth()+1 < 10 ? `0${now.getMonth()+1}`:now.getMonth()+1}-${now.getDate() < 10 ? `0${now.getDate()}`:now.getDate()}`
  timeselect.setAttribute('min',formattedDate);
  let oneWeekFromNow = now.getTime() + 604800000; // One week in ms
  now.setTime(oneWeekFromNow);
  let formattedDatePlusAWeek = `${now.getFullYear()}-${now.getMonth()+1 < 10 ? `0${now.getMonth()+1}`:now.getMonth()+1}-${now.getDate() < 10 ? `0${now.getDate()}`:now.getDate()}`
  timeselect.setAttribute('max', formattedDatePlusAWeek);
  timeselect.addEventListener('change', ()=>{
    let date = String(timeselect.value).split("-");
    //need to validate this date as well on the server
    get_showings_by_date(new Date(parseInt(date[0]),parseInt(date[1]-1),parseInt(date[2])));
  });
  get_showings_by_date();
  setButtonEvents();
});


function setButtonEvents(){
  
  test = document.querySelectorAll(".showingselect");
  let buttonSelected = ''
  test.forEach((element) => {
    console.log((element).getAttribute("id"));
    element.addEventListener('click', ()=> {
      buttonSelected = (element).getAttribute("id");
      
      get_showing(parseInt((element).getAttribute("id").slice(8)));
      element.style.textDecoration = "underline";
      element.style.backgroundColor = "#AACCCC";
      element.style.fontWeight = "bolder";
    });
    element.addEventListener('mouseover', ()=> {
      if((element).getAttribute("id") != buttonSelected){
      element.style.backgroundColor = "#AAAAAA";
      }
    });
    element.addEventListener('mouseout', ()=> {
      if((element).getAttribute("id") != buttonSelected){
      element.style.backgroundColor = "";
      }
    });
    
    //console.log(test);
  });
  
  document.addEventListener('click', ()=> {
    test.forEach((element) => {
    if((element).getAttribute("id") != buttonSelected){
    element.style.textDecoration = "none";
    element.style.backgroundColor = "";
    element.style.fontWeight = "";
  
    }
  });
})}

let img;
let overBox = false;
let numCols = 8; //need to be the same as THEATER_COLUMNS in models.py
let numRows = 10; //need to be the same as THEATER_ROWS in models.py
let mouseDown = false;
let canvasHeight = window.innerHeight*0.7;
let canvasWidth = canvasHeight*0.5;
let boxRadius = canvasWidth/numCols*0.35;
let theaterSeats = canvasHeight*0.6;
let theaterScreen;
let button;
let playing = false;
let vidLoaded = false;
let occupiedSeats = new Array(numCols); //Depending on which showing the user selects, this variable gets updated for the p5 canvas to use
let seatsUpdated = false;

function setup() {
  for (let i = 0; i < numCols; i++){
    occupiedSeats[i] = new Array(numRows).fill(false);
  }
  let canv = createCanvas(canvasWidth, canvasHeight);
  canv.parent('p5app');
  canvdiv = document.querySelector('#p5app');
  //canv.style('background-image',curtainsimg);
  canv.style('top','5px');
  canv.style('border','5px solid grey');
  canv.style('border-radius', '3px');
  rectMode(RADIUS);
  strokeWeight(2);
  theaterScreen = createVideo([video],vidLoad);
  mouseicon = loadImage(ticketicon);
  //theaterScreen.size(canvasWidth-15,canvasWidth*9/16);
  //theaterScreen.size(100,100);
  theaterScreen.parent('p5app');
  theaterScreen.hide();
  
  
    
  

  
  
}
function mousePressed() {
  mouseDown = true;
  if(vidLoaded){
    theaterScreen.loop();
    theaterScreen.volume(0);
  }
  console.log(occupiedSeats);
}



function mouseReleased() {
  mouseDown = false;
}
function draw() {
  background(255);
  //frameRate(300);
  noCursor();
  for (let i = 1; i <= numCols; i++){
    w = canvasWidth/numCols;
    sx = w*(i) - w/2;
    for(let j = 1; j <= numRows; j++){
      h = theaterSeats/numRows;
      sy = (canvasHeight-theaterSeats) + h*(j) - h/2;
      //rect(sx,sy,boxRadius,boxRadius);
      if (
        mouseX > sx - boxRadius &&
        mouseX < sx + boxRadius &&
        mouseY > sy - boxRadius &&
        mouseY < sy + boxRadius
        ){
          overBox = true;
          if (mouseDown) {
            stroke(0,255,0);
            fill(83, 83, 158);
          }
          else{
            stroke(255);
            fill(0, 0, 158);
          }
        }else {
          stroke(0, 39, 176);
          fill(244, 255, 255);
          overBox = false;
        }
          //checks if seat is taken
          if(seatsUpdated){
			
            if(occupiedSeats[i-1][j-1]){
              stroke(0,0,0);
                fill(0, 0, 0);
            }
          }
        
        rect(sx,sy,boxRadius,boxRadius);
      }
    }
    fill(255,0,0);
    filter(OPAQUE);
    if(vidLoaded){
      image(theaterScreen,7.5,7.5,canvasWidth-15,canvasWidth*9/16);
      filter(POSTERIZE,4);
      //filter(GRAY);
    }
    //rect(mouseX, mouseY, boxRadius/2, boxRadius/2);
    image(mouseicon,mouseX,mouseY);
  }
  
  
  

// plays or pauses the video depending on current state
function vidLoad() {
    vidLoaded = true;
    //get_showing(1);
}
  


function get_showing(showingid){

	
	fetch(`/showing/${showingid}`)
	.then(response => {
		if(response.status != 201){return false;}
		else{
			return response.json();
		}
	})
	.then(showing => {
		for (let i = 0; i < numCols; i++){
			occupiedSeats[i] = new Array(numRows).fill(false);
		  }
    if(showing.seats_taken != undefined){
		for(let k =0; k < showing.seats_taken.length; k++){
			occupiedSeats[showing.seats_taken[k].column-1][showing.seats_taken[k].row-1] = true;
			
	}}})
	.then(result => {
		seatsUpdated = true;
	})

}

function get_showings_by_date(date= new Date()){

  console.log(date);
  fetch(`/showings?day=${date.getDate()}&month=${date.getMonth()+1}&year=${date.getFullYear()}`)
  .then(response => {
    //if(response.status != 201){return false;}
		//else{
			return response.json();
		//}
  })
  .then(response =>{

    let moviesOnScreen = [];
    moviesdiv = document.querySelector("#movies");
    moviesdiv.innerHTML = '';
    currentmovs = document.querySelectorAll('[id^=mov-]');
    currentmovs.forEach(element =>{
      console.log(String(element.id).slice(4));
      moviesOnScreen.push(String(element.id).slice(4));
    })
    let appendSpanFlag = false;
    console.log(response);
    response.forEach(showing =>{
      console.log(showing.movie.id);
      if ((moviesOnScreen.filter(elem => {return elem == (String(showing.movie.id).slice(4)); })== true) || moviesOnScreen.length == 0 ){
        moviesOnScreen.push(showing.movie.id);
        console.log("-------");
        console.log(moviesOnScreen);
        console.log("-------");
        span = document.createElement("span");
        span.setAttribute('id',`mov-${showing.movie.id}`);
        span.setAttribute('style','display:inline-block; border: 1px solid black; margin-left: 15px; padding: 5px;');

        movimg = document.createElement("img");
        movimg.setAttribute('style',"width: 200px; height: 300px;");
        movimg.setAttribute('src', showing.movie.preview);
        movimg.setAttribute('alt', showing.movie.film);
        span.append(movimg);
        appendSpanFlag = true;

      }else{
        span = document.querySelector(`#mov-${showing.movie.id}`);
      }
       
        button = document.createElement("button");
        button.setAttribute('class','showingselect');
        button.setAttribute('style', "user-select: none; border-radius: 3px;");
        button.setAttribute('id',`showing-${showing.id}`);
        button.innerHTML = `${showing.time.slice(13)}`;
        if(span != undefined){

          span.append(button);
        }

      if(appendSpanFlag){
        moviesdiv.append(span);
        appendSpanFlag = false;
      }
    })
    
    console.log(response);
    setButtonEvents();
  })
}