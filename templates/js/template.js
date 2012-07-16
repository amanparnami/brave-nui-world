// canvasDrawr originally from Mike Taylr  http://miketaylr.com/
// Tim Branyen massaged it: http://timbranyen.com/
// and Paul Irish: http://paulirish.com did too. with multi touch.
// and boris fixed some touch identifier stuff to be more specific.
           
var CanvasDrawr = function(options) {
	// grab canvas element
	var canvas = document.getElementById(options.id),
	    ctxt = canvas.getContext("2d"),
			showId = options.showId;
  
	//CHECK What are the next 3 lines for
	canvas.style.width = '100%';
	canvas.width = canvas.offsetWidth;
	canvas.style.width = '';

	// set props from options, but the defaults are for the cool kids
	ctxt.lineWidth = options.size || Math.ceil(Math.random() * 35);
	ctxt.lineCap = options.lineCap || "round";
	ctxt.pX = undefined;
	ctxt.pY = undefined;
	
	var self = {
    //bind click events
    init: function() {
			//Refresh the canvas at 50fps
			//CHECK if it eats up a lot of battery and processing
			setInterval(self.cRefresh,20);
			
			//Finger lands on the screen
			//TODO define onTouchStart
      canvas.addEventListener('touchstart', self.onTouchStart, false);
		},
		cRefresh: function() {
			//Clear the canvas
			ctxt.clearRect(0, 0, canvas.width, canvas.height);
			
			//Redraw active touches
			$.each(activeTouches, function(i, touch){
					ctxt.beginPath();
				  ctxt.arc(touch.x, touch.y, touch.radius, 0, 2 * Math.PI, false);
				  ctxt.fillStyle = touch.color;
				  ctxt.fill();
					ctxt.fillStyle = "black";
					ctxt.font = "bold 12px sans-serif";
					ctxt.fillText(touch.id, touch.x-TEXTOFFSETX, touch.y-TEXTOFFSETY);
			});
			
			//Reduce the radius of touches and remove invisible touches (radius <=0)
			var i = 0;
			while(i<removedTouches.length) {
				if(removedTouches[i].radius <= 0) {
					//It is about time to remove the point and not draw it anymore
					removedTouches.splice(i,1);
				} else {
					//Animation has not finished, so reduce the radius
					removedTouches[i].radius -= RADIUSDECREMENT;	
					i++;
				}
			}
			
			//Redraw removed touches, if exist
			$.each(removedTouches, function(i, touch){
					ctxt.beginPath();
				  ctxt.arc(touch.x, touch.y, touch.radius, 0, 2 * Math.PI, false);
				  ctxt.fillStyle = touch.color;
				  ctxt.fill();
					ctxt.fillStyle = "black";
					ctxt.font = "bold 12px sans-serif";
					ctxt.fillText(touch.id, touch.x-TEXTOFFSETX, touch.y-TEXTOFFSETY);
			});
		},
		debug: function(message) {
			$("#debug").append("<span>"+message+"</span>&nbsp&nbsp");
		}
		
	};
	
	
	return self.init();
};


$(document).ready(function () {
  var super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawr({id:"canvas", size: 15, showId: true }); 
});