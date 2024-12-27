let character = {
  x: 30,
  y: 420,
  speed: 0
}

function setup() 
{
  createCanvas(1024, 576);
}

function draw() 
{
  //color the sky
  background("#b6daf0"); 

  //color the grass
  noStroke();
  fill("rgb(147, 190, 89)");
  rect(0, 400, 1024, 400);
  
  //draw the cloud
  fill("rgb(224, 231, 234)");
  rect(150, 120, 300, 90, 100);
  arc(270, 120, 130, 120, PI, 0);
  arc(350, 120, 100, 90, PI, 0);

  //draw the mountain
  fill(128);
  triangle(650, 100, 850, 400, 450, 400);
  fill("rgba(255, 255, 255, 0.5)")
  quad(650, 100, 750, 250, 650, 185, 600, 175);

  //draw the tree
  fill("rgba(96, 129, 64, 0.95)");
  ellipse(775, 310, 300, 225);
  stroke("rgb(141, 111, 100)");
  strokeWeight(50);
  line(775, 380, 775, 520);
  strokeWeight(25);
  line(775, 375, 860, 315);
  line(775, 370, 720, 345);
  noStroke();
  fill("rgba(96, 129, 64, 0.45)");
  ellipse(775, 310, 300, 225);

  //draw the canyon
  fill("rgb(182, 217, 240)");
  quad(300, 400, 120, 400, 140, 576, 280, 576);
  fill("rgb(179, 164, 137)");
  triangle(120, 400, 120, 576, 140, 576); //left
  triangle(300, 400, 280, 576, 300, 576); //right
  stroke("rgb(161, 152, 123)");
  strokeWeight(3);
  line(120, 400, 120, 576); //left
  line(300, 400, 300, 576); //right
  noStroke();

  //draw a flower
  fill(255);
  textSize(90);
  text
	text("💰", 460, 490);

  //draw a character
  fill("rgba(143, 121, 166, 0.9)");
  stroke("#60556C");
  strokeWeight(2);
  square(character.x, character.y, 70, 90, 90, 25, 25);
  stroke("#211C26");
  strokeWeight(8);
  point(character.x + 20, character.y + 30);
  point(character.x + 50, character.y + 30);
  noFill();
  strokeWeight(3);
  arc(character.x + 25, character.y + 30, 20, 25, PI/6, 4*PI/6);
  arc(character.x + 45, character.y + 30, 20, 25, 2*PI/6, 5*PI/6);

  //movements
  if (key === "a" && keyIsPressed === true && character.x > 5) {
    character.x -= 7;
  }
  if (key === "d" && keyIsPressed === true && character.x < 949) {
    character.x += 7;
  }
  if (key === " " && keyIsPressed === true && character.y > 280) {
    character.speed = 5;
    character.y -= character.speed;
  }
  if (character.y <= 420) {
    character.speed -= 0.5;
    character.y -= character.speed;
  } 
}

