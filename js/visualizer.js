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

	var activeTouches = []; //Active touch points
	var removedTouches = []; //Removed touches and still animating
	var offset = $(canvas).offset();
	var ACTIVERADIUS = 50;
	var ACTIVECOLOR = "rgba(89, 186, 206, 1.0)";// OR "blue"
	var REMOVEDCOLOR = "rgba(89, 186, 206, 0.5)"; // OR "red"
	var RADIUSDECREMENT = 5;
	var TEXTOFFSETX = 25;
	var TEXTOFFSETY = 25;
	var colors  = ["red", "green", "yellow", "blue", "magenta", "orangered"];

	var self = {
	    //bind click events
	    init: function() {
					//Refresh the canvas at 50fps
					//CHECK if it eats up a lot of battery and processing
					setInterval(self.cRefresh,20);
		
					//Finger lands on the screen
	        canvas.addEventListener('touchstart', self.onTouchStart, false);
	
					//Finger is touching screen and moving
	        canvas.addEventListener('touchmove', self.onTouchMove, false);
	
					//Finger is lifted from the screen
					canvas.addEventListener('touchend', self.onTouchEnd, false);
					
					//OS interrupts and cancels a touch due to predefined gestures or other reasons
					//http://developer.apple.com/library/ios/#DOCUMENTATION/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html
					canvas.addEventListener('touchcancel', self.onTouchCancel, false);
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
						if(showId) {
							ctxt.fillStyle = "black";
							ctxt.font = "bold 12px sans-serif";
							ctxt.fillText(touch.id, touch.x-TEXTOFFSETX, touch.y-TEXTOFFSETY);
						}
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
						if(showId) {
							ctxt.fillStyle = "black";
							ctxt.font = "bold 12px sans-serif";
							ctxt.fillText(touch.id, touch.x-TEXTOFFSETX, touch.y-TEXTOFFSETY);
						}
				});
			},

	    onTouchStart: function(event) {
				//Get the newly created Touch from event.changedTouches and add to activeTouches
				//NOTE that changed touches might have multiple touches that simultaneously occured
        $.each(event.changedTouches, function(i, touch) {    
					var newTouch = {
													id: touch.identifier,
													x: touch.pageX - offset.left, 
             							y: touch.pageY - offset.top, 
             							color: ACTIVECOLOR,
													radius: ACTIVERADIUS };

					activeTouches.push(newTouch); 				 	
        });
        event.preventDefault();
	    },

	    onTouchMove: function(event) {
				//Get the touches that moved from event.changedTouches and update their location
        $.each(event.changedTouches, function(chIndex, chTouch) {
           var chTouchId = chTouch.identifier;

					//Loop through activeTouches list and break when a match is found
					var i = 0;
					while(activeTouches[i].id != chTouchId && i<activeTouches.length) {
						i++;
					}
					
					//Update the location of touch that moved
					if(i<activeTouches.length) {
						//match found
						activeTouches[i].x = chTouch.pageX - offset.left;
						activeTouches[i].y = chTouch.pageY - offset.top;
					}
        });
        event.preventDefault();
	    },

			onTouchEnd: function(event) {
				//Get the id for the touches corresponding to finger(s) that just left the surface					
				$.each(event.changedTouches, function(chIndex, chTouch) {
           var chTouchId = chTouch.identifier;

					//Loop through the activeTouches list and find the index where match happens
					var i = 0;
					while(activeTouches[i].id != chTouchId && i<activeTouches.length) {
							i++;
					}
					
					//Pop the matched item from activeTouches list and add to removedTouches list
					if(i<activeTouches.length) {
						//CHECK if reducing the length of array in the line below effects the comparison in the line above
						//NOTE splice returns a new array with the removed element hence [0]
						var justRemovedTouch = activeTouches.splice(i,1)[0];
						justRemovedTouch.color = REMOVEDCOLOR;
						justRemovedTouch.radius -= RADIUSDECREMENT;
						removedTouches.push(justRemovedTouch);
					}
				});
				event.preventDefault();
			},
			
			onTouchCancel: function(event) {
				$("#cancelledTouches").text("CancelledTouches: "+event.changedTouches.length);
			},
			
			debug: function(message) {
				$("#debug").append("<span>"+message+"</span>&nbsp&nbsp");
			}
	};

	return self.init();
};


$(document).ready(function () {
  var super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawr({id:"canvas", size: 15, showId: false}); 
});
