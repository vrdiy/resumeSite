


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
    get_showings_by_date(1,new Date(parseInt(date[0]),parseInt(date[1]-1),parseInt(date[2])));
  });
  //call default which is the current day
  get_showings_by_date();
  //buttons are setup by the above function, once they've been dynamically created for each showing
  
  window.addEventListener('resize', ()=>{
    p5resize();
  })
});

//global, only allow one button at a time.
let isAnyShowings = false;
let buttonSelected = '';
let showingSelectedID = 0;
let movieGifs = {};

function setButtonSelected(element){
  buttonSelected = (element).getAttribute("id");
  element.style.textDecoration = "underline";
  element.style.backgroundColor = "#AACCCC";
  element.style.fontWeight = "bolder";
  //console.log(parseInt((element).getAttribute("id").slice(8)))
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
let numCols = 8; //need to be the same as THEATER_COLUMNS in models.py
let numRows = 10; //need to be the same as THEATER_ROWS in models.py
let mouseDown = false;
let canvasHeight = window.innerHeight*0.7;
let canvasWidth = canvasHeight*0.5;
let boxRadius = canvasWidth/numCols*0.35;
let theaterSeats = canvasHeight*0.6;
let theaterScreen;
let THEATERSCREENPADDING = 7.5; //pixels
let revealUI = false;
let mouseDownOverButton = false;

let buttonHeight = parseFloat(((canvasHeight- theaterSeats)-canvasWidth*9/16));
let vidLoaded = true;

let p5font;
let p5fontsize = canvasHeight/20;

function preload() {
  //p5font = loadFont('/static/ticketapp/MovieBill-M86w.ttf');
  p5font = loadFont(fontpath);

  
}
//init 2d arrays, these are updated to match whichever showing the user has selected
let occupiedSeats = new Array(numCols);
for (let i = 0; i < numCols; i++){occupiedSeats[i] = new Array(numRows).fill(false);}

let cartSeats = new Array(numCols);
for (let i = 0; i < numCols; i++){cartSeats[i] = new Array(numRows).fill(false);}

let selectedSeats = new Array(numCols); 
for (let i = 0; i < numCols; i++){selectedSeats[i] = new Array(numRows).fill(false);}

function flushArrs(){
  for (let i = 0; i < numCols; i++){
    occupiedSeats[i] = new Array(numRows).fill(false);
    cartSeats[i] = new Array(numRows).fill(false);
    selectedSeats[i] = new Array(numRows).fill(false);
    }
}
let canSelect = false;

let seatsUpdated = false;


function setup() {
  let canv = createCanvas(canvasWidth, canvasHeight);
  canv.parent('p5app');
  canvdiv = document.querySelector('#p5app');
  textFont(p5font);
  textSize(p5fontsize);
  canv.style('border','5px solid grey');
  rectMode(RADIUS);
  strokeWeight(1);
  theaterScreen = loadImage(video)
  mouseicon = loadImage(ticketicon);
}

let gif_url = null;
function reloadTheaterScreen(){
  //console.log("reloadgif")
  try{
    if(gif_url != null){
      theaterScreen = loadImage(gif_url, result =>{},error =>{
        theaterScreen = loadImage(video);
      });
    }else{
    theaterScreen = loadImage(video);

    }
  }
  catch (error){
    theaterScreen = loadImage(video);
  }
}
function mousePressed() {
  if(!revealUI){
    revealUI = true;
  }
    mouseDown = true;
}

function mouseReleased() {
  mouseDown = false;
  canSelect = true;
}

function p5resize(){
  canvasHeight = window.innerHeight*0.7;
  canvasWidth = canvasHeight*0.5;
  boxRadius = canvasWidth/numCols*0.35;
  theaterSeats = canvasHeight*0.6
  buttonHeight = parseFloat(((canvasHeight- theaterSeats)-canvasWidth*9/16))
  p5fontsize = canvasHeight/20;
  textSize(p5fontsize);
  resizeCanvas(canvasWidth,canvasHeight,false);
}
function draw() {
  if(!isAnyShowings){
    background(100,40,21);
    textSize(p5fontsize*1.5);

    text('No Showings on this date!',(canvasWidth/6),canvasHeight/2);
    return;
  }
  if(!revealUI){
    background(86,5,12); //#41041e
    textSize(p5fontsize*1.5);

    text('Click to select tickets',(canvasWidth/6),canvasHeight/2);
    return;
  }
  if(!seatsUpdated){
    background(255,255,255);
    textSize(p5fontsize*1.5);

    text('Loading...',(canvasWidth/6),canvasHeight/2);
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
              if((!cartSeats[i-1][j-1]) && (!occupiedSeats[i-1][j-1]))
              selectedSeats[i-1][j-1] = !selectedSeats[i-1][j-1];
              //canSelect = false;
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
        if(cartSeats[i-1][j-1] == true){
          stroke(0,0,80);
          fill(220,220,4);
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
      if(vidLoaded){
        image(theaterScreen,THEATERSCREENPADDING,THEATERSCREENPADDING,canvasWidth-15,canvasWidth*9/16);
        image(theaterScreen,THEATERSCREENPADDING,THEATERSCREENPADDING,canvasWidth-15,canvasWidth*9/16);

      }
      
      submitRect();
      image(mouseicon,mouseX,mouseY);
      
  }
  
  
  function submitRect(){
  //rect( x, y, w, h, tl, tr, br, bl )
  //rectangles are also drawn from the center, I think?
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
          canSelect = false;
        }
      }
    }
    else{
      fill(255,255,255);
    }
    rect(this.x,this.y, this.w, this.h);
    fill(0,0,0);
    textSize(p5fontsize);
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

function addToCart(tickets_, showingid = 0){
  let counter = 0;
  //console.log(tickets);
  selectedTickets = [];
  
  for(let i = 0; i < numCols; i++){
    for(let j = 0; j < numRows; j++){
      
      if (tickets_[i][j]){
        let entry = {"column" : i+1, "row" : j+1};
        selectedTickets.push(entry);
      }
      counter++;
    }
  }
      //console.log(JSON.stringify({'selectedTickets_': selectedTickets}));
  fetch(`cart/add`,{
    credentials : 'same-origin',
    method: "POST",
    body: JSON.stringify(
      {selectedTickets_: selectedTickets,
      showingid : showingid}
    )
  })
	.then(response => {
		if(response.status != 200){return false;}
		else{
      
        fetch('cart/data')
        .then(data =>{
          return data.json();
        }
        )
        .then(cartTickets =>{
          //console.log(cartTickets.cartTickets)
          //console.log(tickets)
          tickets = cartTickets["cartTickets"];
        })
        .then(result =>{
          //console.log(`get seats for showing: ${showingid}`);
          get_seats(showingid);
        })
			return response.json();
		}
	})

}


function get_seats(showingid = 0){

	
	fetch(`seats/${showingid}`)
	.then(response => {
		if(response.status != 200){return false;}
		else{
			return response.json();
		}
	})
	.then(showing => {
    //console.log(showing)
    //console.log(showing.gif)
    gif_url = null;
    //console.log(showing.gif)
    if(showing.gif != null){
      gif_url = showing.gif;
      //reloadTheaterScreen(showing.gif);
    }
    showing = showing.seats;
		flushArrs();
    if(showing.seats_taken != undefined){
      for(let k =0; k < showing.seats_taken.length; k++){
        occupiedSeats[showing.seats_taken[k].column-1][showing.seats_taken[k].row-1] = true;
      }
    }
    if(tickets){
      for (let i = 0; i < tickets.length; i++) {
        formattedTicket = JSON.parse(tickets[i]);
        //console.log(formattedTicket.showing.id);
        //console.log(showingid);
        if(parseInt( formattedTicket.showing.id) === parseInt(showingid)){
          //console.log("matching")
          cartSeats[formattedTicket.column-1][formattedTicket.row-1] = true;
        }
      }
    }
    return true;
  }
  )
	.then(result => {
		seatsUpdated = true;
    reloadTheaterScreen();
	})

}

function get_showings_by_date(pagenum = 1,date= new Date()){

  
  fetch(`showings?day=${date.getDate()}&month=${date.getMonth()+1}&year=${date.getFullYear()}&page=${pagenum}`)
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
    const paginationUI = page_bootstrap(response[response.length-1],'get_showings_by_date');
    paginationUI.style.position = 'absolute';
    document.getElementById('paginationUI').innerHTML = '';
    document.getElementById('paginationUI').append(paginationUI);
    response.pop();
    let moviesOnScreen = [];
    moviesdiv = document.querySelector("#subcontainer");
    moviesdiv.innerHTML = '';
    //console.log(movieGifs[5])
    //console.log(response)
    if(response){
      response.forEach(showings =>{
          showings.forEach(showing =>{
            
            let appendSpanFlag = false;
            if (!isValueInArray(moviesOnScreen,showing.movie.id)){
              moviesOnScreen.push(showing.movie.id);
              container  = document.createElement("div");
              container.setAttribute('class','postercontainer');
              container.setAttribute('id',`container-${showing.movie.id}`);
              
              span = document.createElement("div");
              span.setAttribute('id',`mov-${showing.movie.id}`);
              span.setAttribute('class',"showings");
              

              movimg = document.createElement("img");
              movimg.setAttribute('class',"posters");
              movimg.setAttribute('style',"width: auto; height: 100%; margin-top: 5px;text-align: center;");

              
              movimg.setAttribute('src', showing.movie.preview);
              movimg.setAttribute('alt', showing.movie.film);

              buttoncontainer = document.createElement('div');
              buttoncontainer.setAttribute('id',`buttoncontainer-${showing.movie.id}`);
              buttoncontainer.setAttribute('style',"width: 100%; height: 100%; margin-top: 2px; display:grid;");
              
              span.append(movimg);
              container.append(span);
              container.append(buttoncontainer);
              appendSpanFlag = true;

            }else{
              span = document.querySelector(`#mov-${showing.movie.id}`);
              container = document.querySelector(`#container-${showing.movie.id}`);
              buttoncontainer = document.querySelector(`#buttoncontainer-${showing.movie.id}`);

            }
            
              button = document.createElement("button");
              button.setAttribute('class','showingselect');
              button.setAttribute('id',`showing-${showing.id}`);
              button.innerHTML = `${showing.time}`;
              if(buttoncontainer != undefined){

                buttoncontainer.append(button);
              }

            if(appendSpanFlag){
              moviesdiv.append(container);
              appendSpanFlag = false;
            }
          })
      })

      setButtonEvents();

      //try to pre-select the first showing
      pickfirstshowing = document.querySelector(`[id^=showing-]`);
      if(pickfirstshowing != null){
        setButtonSelected(pickfirstshowing);
        get_seats(String(pickfirstshowing.id).slice(8));
      }


    }
    if(response.length === 0){
      isAnyShowings = false;
    }
    else{
      
      isAnyShowings = true;
    }
  })
}