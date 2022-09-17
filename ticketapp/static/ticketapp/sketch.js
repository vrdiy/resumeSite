


document.addEventListener('DOMContentLoaded', function() {
  let now = new Date();
  timeselect = document.querySelector("#timeselect");
  timeselect.valueAsNumber = now.getTime(); //pre-fill the value
  document.querySelector('#banner').innerHTML = timeselect.value;
  //Date function doesn't have leading zeros for single digits so I add them:
  let formattedDate = `${now.getFullYear()}-${now.getMonth()+1 < 10 ? `0${now.getMonth()+1}`:now.getMonth()+1}-${now.getDate() < 10 ? `0${now.getDate()}`:now.getDate()}`
  timeselect.setAttribute('min',formattedDate);
  let oneWeekFromNow = now.getTime() + 604800000; // One week in ms
  now.setTime(oneWeekFromNow);
  let formattedDatePlusAWeek = `${now.getFullYear()}-${now.getMonth()+1 < 10 ? `0${now.getMonth()+1}`:now.getMonth()+1}-${now.getDate() < 10 ? `0${now.getDate()}`:now.getDate()}`
  timeselect.setAttribute('max', formattedDatePlusAWeek);

  //handle date selection
  timeselect.addEventListener('change', ()=>{
    let now1 = new Date();
    let oneWeekFromNow1 = new Date();
    oneWeekFromNow1.setTime(now1.getTime() + 604800000); // One week in ms
    if((timeselect.valueAsNumber < now1.getTime())||(timeselect.valueAsNumber > oneWeekFromNow1.getTime())){
      timeselect.valueAsNumber = now1.getTime();
    }
    document.querySelector('#banner').innerHTML = timeselect.value;
    let date = String(timeselect.value).split("-");
    get_showings_by_date(new Date(parseInt(date[0]),parseInt(date[1]-1),parseInt(date[2])));
  });
  //call default which is the current day
  get_showings_by_date();
  //buttons are setup by the above function, once they've been dynamically created for each showing
});

//global, only allow one button at a time.
let buttonSelected = ''

function setButtonSelected(element){
  buttonSelected = (element).getAttribute("id");
  element.style.textDecoration = "underline";
  element.style.backgroundColor = "#AACCCC";
  element.style.fontWeight = "bolder";
}
//function for stylizing and event handling for buttons
function setButtonEvents(){
  
  test = document.querySelectorAll(".showingselect");
  test.forEach((element) => {
    element.addEventListener('click', ()=> {
      setButtonSelected(element);
      get_seats(parseInt((element).getAttribute("id").slice(8)));
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

//----------------------- P5 CANVAS STARTS HERE -----------------------------------------------

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

//init 2d arrays
let occupiedSeats = new Array(numCols); //Depending on which showing the user selects, this variable gets updated for the p5 canvas to use
for (let i = 0; i < numCols; i++){occupiedSeats[i] = new Array(numRows).fill(false);}


let selectedSeats = new Array(numCols); //Depending on which showing the user selects, this variable gets updated for the p5 canvas to use
for (let i = 0; i < numCols; i++){selectedSeats[i] = new Array(numRows).fill(false);}
let currentSelection;
let canSelect = false;

let seatsUpdated = false;

function setup() {
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
  console.log(selectedSeats);
}



function mouseReleased() {
  mouseDown = false;
  canSelect = true;
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

              if(canSelect){
                selectedSeats[i-1][j-1] = !selectedSeats[i-1][j-1];
                canSelect = false;
              }
            
            //selectedSeats[i-1][j-1] = !selectedSeats[i-1][j-1];
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
        if(selectedSeats[i-1][j-1] == true){
          stroke(0, 0, 255);
          fill(255, 0, 0);
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
    //filter(OPAQUE);
    if(vidLoaded){
      image(theaterScreen,7.5,7.5,canvasWidth-15,canvasWidth*9/16);
      //filter(POSTERIZE,4);
      //filter(GRAY);
    }
    //rect(mouseX, mouseY, boxRadius/2, boxRadius/2);
    image(mouseicon,mouseX,mouseY);
  }
  
// plays or pauses the video depending on current state
function vidLoad() {
    vidLoaded = true;
    
}

//-------------------------------- P5 ENDS HERE ------------------------------------------------------

//The js .includes function doesn't work like I expect it to so this does what I figured .includes would do
function isValueInArray(arr,val){
  let flag = false;
  arr.forEach(elem =>{
    if(elem == val){
      flag = true;}
  })
  return flag;
}

/* Deprecated, should use the results of get_showings_by_date, or remove seats_taken from get_showings_by_date
and to save on initial amount of data loaded. Either more data upfront and more responsive ui, or the inverse.
For the sake of 'complexity' and scalability I will probably keep this function and change get_showings_by_date.
*/
function get_seats(showingid){

	
	fetch(`/seats/${showingid}`)
	.then(response => {
		if(response.status != 200){return false;}
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
    
    response.forEach(showing =>{
      let appendSpanFlag = false;
      if (!isValueInArray(moviesOnScreen,showing.movie.id)){
        moviesOnScreen.push(showing.movie.id);
        span = document.createElement("span");
        span.setAttribute('id',`mov-${showing.movie.id}`);
        span.setAttribute('style','display:inline-block; width: 30vw; height: auto; top: 15px; border: 1px solid black; margin: 5px;text-align: center;');

        movimg = document.createElement("img");
        movimg.setAttribute('style',"width: 80%; height: auto; padding-top: 5px;");

        
        movimg.setAttribute('src', showing.movie.preview);
        movimg.setAttribute('alt', showing.movie.film);
        span.append(movimg);
        appendSpanFlag = true;

      }else{
        span = document.querySelector(`#mov-${showing.movie.id}`);
      }
       
        button = document.createElement("button");
        button.setAttribute('class','showingselect');
        button.setAttribute('style', " user-select: none; border-radius: 3px;");
        button.setAttribute('id',`showing-${showing.id}`);
        button.innerHTML = `${showing.time.ftime}`;
        if(span != undefined){

          span.append(button);
        }

      if(appendSpanFlag){
        moviesdiv.append(span);
        appendSpanFlag = false;
      }
    })
    setButtonEvents();
    pickfirstshowing = document.querySelector(`[id^=showing-]`);
    if(pickfirstshowing != null){
      setButtonSelected(pickfirstshowing);
      get_seats(String(pickfirstshowing.id).slice(8));
    }
  })
}