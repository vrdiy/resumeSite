


document.addEventListener('DOMContentLoaded', function() {

  //-----------------------------time selector field initialize values---------------------------------
  let now = new Date();
  timeselect = document.querySelector("#timeselect");
  timeselect.valueAsNumber = now.getTime(); //pre-fill the value
  document.querySelector('#banner').innerHTML = timeselect.value;

  //Date function doesn't have leading zeros for single digits so I add them:
  let formattedDate = `${now.getFullYear()}-${now.getMonth()+1 < 10 ? `0${now.getMonth()+1}`:now.getMonth()+1}-${now.getDate() < 10 ? `0${now.getDate()}`:now.getDate()}`
  //the 'min' attribute needs leading zeros
  timeselect.setAttribute('min',formattedDate);

  let oneWeekFromNow = now.getTime() + 604800000; // One week in ms
  now.setTime(oneWeekFromNow);
  let formattedDatePlusAWeek = `${now.getFullYear()}-${now.getMonth()+1 < 10 ? `0${now.getMonth()+1}`:now.getMonth()+1}-${now.getDate() < 10 ? `0${now.getDate()}`:now.getDate()}`
  //the 'max' attribute needs leading zeros
  timeselect.setAttribute('max', formattedDatePlusAWeek);

  //---------------------------------------------------------------------------------------------------

  //handle date selection
  timeselect.addEventListener('change', ()=>{
    document.querySelector('#banner').innerHTML = timeselect.value;
    let date = String(timeselect.value).split("-");
    get_showings_by_date(new Date(parseInt(date[0]),parseInt(date[1]-1),parseInt(date[2])));
  });
  //call default which is the current day
  get_showings_by_date();
  //buttons are setup by the above function, once they've been dynamically created for each showing
});

//global, only allow one button at a time.
let buttonSelected = '';
let showingSelectedID = 0;

function setButtonSelected(element){
  buttonSelected = (element).getAttribute("id");
  element.style.textDecoration = "underline";
  element.style.backgroundColor = "#AACCCC";
  element.style.fontWeight = "bolder";
  showingSelectedID = parseInt((element).getAttribute("id").slice(8));
}
//function for stylizing and event handling for buttons
function setButtonEvents(){
  
  test = document.querySelectorAll(".showingselect");
  test.forEach((element) => {
    element.addEventListener('click', ()=> {
      setButtonSelected(element);
      get_seats(showingSelectedID);
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
let THEATERSCREENPADDING = 7.5; //pixels
let submitted = false;
let revealUI = false;
let mouseDownOverButton = false;

let buttonHeight = parseFloat(((canvasHeight- theaterSeats)-canvasWidth*9/16));
let playing = false;
let vidLoaded = false;

let p5font;
let p5fontsize = 40;

function preload() {
  p5font = loadFont('/static/ticketapp/MovieBill-M86w.ttf');
  
}
//init 2d arrays
let occupiedSeats = new Array(numCols); //Depending on which showing the user selects, this variable gets updated for the p5 canvas to use
for (let i = 0; i < numCols; i++){occupiedSeats[i] = new Array(numRows).fill(false);}


let selectedSeats = new Array(numCols); //Depending on which showing the user selects, this variable gets updated for the p5 canvas to use
for (let i = 0; i < numCols; i++){selectedSeats[i] = new Array(numRows).fill(false);}
let canSelect = false;

let seatsUpdated = false;


function setup() {
  let canv = createCanvas(canvasWidth, canvasHeight);
  canv.parent('p5app');
  canvdiv = document.querySelector('#p5app');
  textFont(p5font);
  textSize(p5fontsize);
 // textAlign(CENTER, CENTER);
  //canv.style('background-image',curtainsimg);
  //canv.style('top','5px');
  //canv.style('border','5px solid grey');
  //canv.style('border-radius', '3px');
  rectMode(RADIUS);
  strokeWeight(1);
  theaterScreen = createVideo([video],vidLoad);
  mouseicon = loadImage(ticketicon);
  //theaterScreen.size(canvasWidth-15,canvasWidth*9/16);
  //theaterScreen.size(100,100);
  theaterScreen.parent('p5app');
  theaterScreen.hide();
}
function mousePressed() {
  if(!revealUI){
    revealUI = true;
  }
    mouseDown = true;
    if(vidLoaded){
      theaterScreen.loop();
      theaterScreen.volume(0);
    }
}



function mouseReleased() {
  mouseDown = false;
  canSelect = true;
}
function draw() {
  if(!revealUI){
    background(255,0,0);
    text('Click to select tickets',0,canvasHeight/2);
    return;
  }
  if(submitted){
    return;
  }
  background(255);
  noCursor();
  for (let i = 1; i <= numCols; i++){
    w = canvasWidth/numCols;
    sx = w*(i) - w/2;
    for(let j = 1; j <= numRows; j++){
      h = theaterSeats/numRows;
      sy = (canvasHeight-theaterSeats) + h*(j) - h/2;
      if (
        mouseX > sx - boxRadius &&
        mouseX < sx + boxRadius &&
        mouseY > sy - boxRadius &&
        mouseY < sy + boxRadius
        ){
          if(mouseDown){
            mouseDownOverButton = true;
          }
          if (!mouseDown && mouseDownOverButton) {
            stroke(0,255,0);
            fill(83, 83, 158);
            mouseDownOverButton = false;
            if(canSelect){
              selectedSeats[i-1][j-1] = !selectedSeats[i-1][j-1];
              canSelect = false;
            }
          }
          else{
            stroke(255);
            fill(0, 0, 158);
          }


        }else {
          stroke(0, 39, 176);
          fill(244, 255, 255);
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
        image(theaterScreen,THEATERSCREENPADDING,THEATERSCREENPADDING,canvasWidth-15,canvasWidth*9/16);
        //filter(POSTERIZE,4);
        //filter(GRAY);
      }
      
      submitRect();
      image(mouseicon,mouseX,mouseY);
      //rect(0,canvasWidth*9/16 + button.height/2 + THEATERSCREENPADDING, canvasWidth, button.height/2.5);
  }
  
  
  function submitRect(){
  //rect( x, y, w, h, tl, tr, br, bl )
  //rectangles are also drawn from the center
  this.x = 0;
  this.y = (canvasWidth*9/16) + (buttonHeight/2) + THEATERSCREENPADDING;
  this.w = canvasWidth;
  this.h = buttonHeight/2.5;
  if (
    mouseX > this.x - 0 &&
    mouseX < this.x + this.w &&
    mouseY > this.y - this.h &&
    mouseY < this.y + this.h
    ){
      fill(0,255,0);
      if(mouseDown){
        if(canSelect){
          addToCart(selectedSeats,showingSelectedID);
          submitted = true;
          canSelect = false;
        }
      }
    }
    else{
      fill(255,255,255);
    }
    rect(this.x,this.y, this.w, this.h);
    fill(0,0,0);
    text('Add Ticket(s) to Cart',this.x,this.y+ this.h/2);

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

function addToCart(tickets, showingid = 0){
  let counter = 0;
  //console.log(tickets);
  selectedTickets = [];
  
  for(let i = 0; i < numCols; i++){
    for(let j = 0; j < numRows; j++){
      
      if (tickets[i][j]){
        let entry = {"column" : i+1, "row" : j+1};
        selectedTickets.push(entry);
      }
      counter++;
    }
  }
      console.log(JSON.stringify({'tickets': selectedTickets}));
  fetch(`/cart/add`,{
    credentials : 'same-origin',
    method: "POST",
    body: JSON.stringify(
      {tickets: selectedTickets,
      showingid : showingid}
    )
  })
	.then(response => {
		if(response.status != 200){return false;}
		else{
			return response.json();
		}
	})

}


function get_seats(showingid = 0){

	
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
    if(response.status == 400){
      console.log("just use the ui bro....")
      return false;
    }
		else{
			return response.json();
		}
  })
  .then(response =>{
    let moviesOnScreen = [];
    moviesdiv = document.querySelector("#subcontainer");
    moviesdiv.innerHTML = '';
    if(response){
      
      response.forEach(showing =>{
        let appendSpanFlag = false;
        if (!isValueInArray(moviesOnScreen,showing.movie.id)){
          moviesOnScreen.push(showing.movie.id);
          span = document.createElement("span");
          span.setAttribute('id',`mov-${showing.movie.id}`);
          span.setAttribute('class',"showings");
          

          movimg = document.createElement("img");
          movimg.setAttribute('class',"posters");
          movimg.setAttribute('style',"width: auto; height: 80%; margin-top: 5px;text-align: center;");

          
          movimg.setAttribute('src', showing.movie.preview);
          movimg.setAttribute('alt', showing.movie.film);
          span.append(movimg);
          appendSpanFlag = true;

        }else{
          span = document.querySelector(`#mov-${showing.movie.id}`);
        }
        
          button = document.createElement("button");
          button.setAttribute('class','showingselect');
          button.setAttribute('id',`showing-${showing.id}`);
          button.innerHTML = `${showing.time}`;
          if(span != undefined){

            span.append(button);
          }

        if(appendSpanFlag){
          moviesdiv.append(span);
          appendSpanFlag = false;
        }
      })

      setButtonEvents();

      //try to pre-select the first showing
      pickfirstshowing = document.querySelector(`[id^=showing-]`);
      if(pickfirstshowing != null){
        setButtonSelected(pickfirstshowing);
        get_seats(String(pickfirstshowing.id).slice(8));
      }


    }
    else{
      document.querySelector('#banner').innerHTML =''; 
    }
  })
}