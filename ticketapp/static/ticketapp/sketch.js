
let img;
let overBox = false;
let numCols = 8;
let numRows = 10;
let mouseDown = false;
let canvasWidth = window.innerWidth*0.3;
let canvasHeight = window.innerHeight*0.53;
let boxRadius = canvasWidth/numCols*0.35;
let theaterSeats = canvasHeight*0.6;
let theaterScreen;
let button;
let playing = false;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  rectMode(RADIUS);
  strokeWeight(2);
  theaterScreen = createVideo(video);
  theaterScreen.hide();
  button = createButton('play');
  button.mousePressed(toggleVid); // attach button listener
  //img = loadImage('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iconsdb.com%2Ficons%2Fdownload%2Fred%2Fcar-26-256.png&f=1&nofb=1');
}
function mousePressed() {
  mouseDown = true;
  theaterScreen.loop();
  
}



function mouseReleased() {
  mouseDown = false;
}
function draw() {
  background(220);
  frameRate(300);
  noCursor();
  
  for (let i = 1; i <= numCols; i++){
    w = canvasWidth/numCols;
    sx = w*i - w/2;
    for(let j = 1; j <= numRows; j++){
      h = theaterSeats/numRows;
      sy = (canvasHeight-theaterSeats) + h*j - h/2;
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
            fill(244, 122, 158);
          }
          else{
            stroke(255);
            fill(244, 122, 158);
          }
        }else {
          stroke(156, 39, 176);
          fill(244, 122, 158);
          overBox = false;
        }
        rect(sx,sy,boxRadius,boxRadius);
      }
    }
    fill(255,0,0);
    image(theaterScreen,0,0);
    rect(mouseX, mouseY, boxRadius/2, boxRadius/2);
  }
  
  
  

// plays or pauses the video depending on current state
function toggleVid() {
  if (playing) {
    fingers.pause();
    button.html('play');
  } else {
    fingers.loop();
    button.html('pause');
  }
  playing = !playing;
}
  
  