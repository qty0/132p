function setup() 
{
  createCanvas(1024, 576);
}

function draw() 
{
  //color the sky
  background("rgba(182, 217, 240, 0.9)"); 

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
}

