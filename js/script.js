/* Author: Aman Parnami (http://amanparnami.com)
*  Date: 6/21/2012	 	
*/

var step = 25;
var myInterval;
$(document).ready(function () {
 var canvas = $("#canvas").get(0);
 var context = canvas.getContext("2d");
 context.canvas.width  = $('[data-role="page"]').first().width();
 context.canvas.height = $('[data-role="page"]').first().height();

	$("#canvas").bind("vmousedown", function (e) {
		visualizeTouch(e.pageX, e.pageY);
	});
	
	$("#canvas").bind("vmouseup", function (e) {
		fadeOutTouch(e.pageX, e.pageY);
	});

	$("#canvas").bind("vmousemove", function (e) {
		visualizeTouch(e.pageX, e.pageY);
	});
 //drawRects(context);
  
});
 
function visualizeTouch(x, y){
	step = 25;
	clearInterval(myInterval);
	var canvas = $("#canvas").get(0);
	 var c = canvas.getContext("2d");
	var canvasPos = findPos(document.getElementById("canvas"));
	//Clean the canvas
	var canvasWidth = $("#canvas").width();
 var canvasHeight = $("#canvas").height();
	 c.clearRect(0, 0, canvasWidth, canvasHeight);
 	c.beginPath();
  c.arc(x-canvasPos[0], y-canvasPos[1], 50, 0, 2 * Math.PI, false);
  c.fillStyle = "#8ED6FF";
  c.fill();
}

function fadeOutTouch(x, y) {
	var canvas = $("#canvas").get(0);
	var c = canvas.getContext("2d");
	var canvasPos = findPos(document.getElementById("canvas"));
	//Clean the canvas
	var canvasWidth = $("#canvas").width();
  var canvasHeight = $("#canvas").height();
	myInterval=setInterval(function (){
		  if(step != 0) step = step-1;	
			c.clearRect(0, 0, canvasWidth, canvasHeight);
			c.beginPath();
		  c.arc(x-canvasPos[0], y-canvasPos[1], step*2, 0, 2 * Math.PI, false);
		  c.fillStyle = "#8ED6FF";
		  c.fill();
		}, 10);
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft,curtop];
}

function drawRects(c){
 //Rect in red
 c.fillStyle = "#FF0000";
 c.fillRect(70, 10, 30, 130);
}





