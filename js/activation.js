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
	
	var offset = $(canvas).offset();
	var activeTouches = []; //Active touch points
	var removedTouches = []; //Removed touches and still animating
	//control states: 0: idle, engaged, activated, dragging
	var CTRL_STATE_IDLE = 0;
	var CTRL_STATE_ENGAGED = 1;
	var CTRL_STATE_ACTIVATED = 2;
	var CTRL_TYPE_BUTTON = 0;
	var CTRL_TYPE_SLIDER = 1;
	var controls = [{
										id: 0,
										type: CTRL_TYPE_BUTTON,
										x: canvas.width/2 - 50 - offset.left, 
										y: canvas.height/2 - offset.top, 
										w: 80, 
										h: 40, 
										defaultColor: "#8D8D8D", 
										title: "Button1", 
										state: CTRL_STATE_IDLE,
										engagedTouchId: -1,
										unengagedTouchId: []
									}, 
									{
										id: 1,
										type: CTRL_TYPE_BUTTON,
										x: canvas.width/2 + 50 - offset.left, 
										y: canvas.height/2 - offset.top, 
										w: 80, 
										h: 40, 
										defaultColor: "#8D8D8D", 
										title: "Button2", 
										state: CTRL_STATE_IDLE,
										engagedTouchId: -1,
										unengagedTouchId: []
									}];
	var CTRL_TEXTPADDING_LEFT = 40;
	var CTRL_TEXTPADDING_TOP = 20;
	var CTRL_ENGAGEDCOLOR = "rgba(250, 250, 250, 1.0)";
	
	var ACTIVERADIUS = 40;
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
			
			//Redraw controls
			$.each(controls, function(i, control){
				self.drawControl(control);
			});
			
			//Redraw active touches
			$.each(activeTouches, function(i, touch){
				if(touch.engagedControlId != -1) {
					//ASSUMPTION: engagedTouch.engagedControlId is same as index of "controls"
					var engagedControl = controls[touch.engagedControlId];
					if(!(self.isTouchOnAControl(touch, engagedControl))) {
						//Show tethering
						self.drawTether(touch, engagedControl);
					}
				}
				self.drawTouch(touch);	
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
				self.drawTouch(touch);
			});
		},
		drawTether: function(touch, control) {
			ctxt.beginPath();
			ctxt.moveTo(control.x + control.w/2, control.y + control.h/2);
			ctxt.lineTo(touch.x, touch.y);
			ctxt.lineWidth = 3;
			ctxt.strokeStyle = "#e3d7c7";
			ctxt.stroke();
		}, 
		drawTouch: function(touch) {
			//This function takes a touch object and draws it
			ctxt.beginPath();
		  ctxt.arc(touch.x, touch.y, touch.radius, 0, 2 * Math.PI, false);
		  ctxt.fillStyle = touch.color;
		  ctxt.fill();
			if(showId) {
				ctxt.fillStyle = "black";
				ctxt.font = "bold 12px sans-serif";
				ctxt.fillText(touch.id, touch.x-TEXTOFFSETX, touch.y-TEXTOFFSETY);
			}
		},
		drawControl: function(control) {
			//This function takes a control object and draws it
			//ASSUMPTION: Control is a rectangular button
			ctxt.beginPath();
      ctxt.rect(control.x, control.y, control.w, control.h);
			switch(control.state) {
				case CTRL_STATE_IDLE:
					ctxt.fillStyle = control.defaultColor;      
					break;
				case CTRL_STATE_ENGAGED:
					ctxt.fillStyle = CTRL_ENGAGEDCOLOR;
					//TODO if the engagedTouchId is not on the control draw tethering
					break;
			}
			ctxt.fill();
      ctxt.lineWidth = 2;
      ctxt.strokeStyle = 'black';
      ctxt.stroke();
			ctxt.font = "bold 12px sans-serif";
			ctxt.fillStyle = "black";
			ctxt.textAlign = "center";
			ctxt.fillText(control.title, control.x + CTRL_TEXTPADDING_LEFT, control.y + CTRL_TEXTPADDING_TOP);
		},
		isTouchOnAControl: function(touch, control) {
			//ASSUMPTION Canvas origin and control origin are top left
			if(touch.x >= control.x && touch.y >= control.y && (touch.x - control.x) <= control.w && (touch.y - control.y) <= control.h) {
				return true;
			} else {
				return false;
			}
		},
		debug: function(message) {
			$("#debug").append("<span>"+message+"</span>&nbsp&nbsp");
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
												radius: ACTIVERADIUS,
												engagedControlId: -1};

				activeTouches.push(newTouch);
				
				//Check if any of the finger landed on a control 
				$.each(controls, function(i, control) {
					if(self.isTouchOnAControl(newTouch, control)) {
						//If a control is not already engaged then engage
						// else do not allow engaging and show tethering
						if(control.state != CTRL_STATE_ENGAGED) {
							control.state = CTRL_STATE_ENGAGED;
							control.engagedTouchId = newTouch.id;
							newTouch.engagedControlId = control.id;
						} else {
							//Show tethering
							
						}
						
					}
				});				 	
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
					if(justRemovedTouch.engagedControlId != -1) {
						controls[justRemovedTouch.engagedControlId].engagedTouchId = -1;
						controls[justRemovedTouch.engagedControlId].state = CTRL_STATE_IDLE;
						justRemovedTouch.engagedControlId = -1;
					}
				}
			});
			event.preventDefault();
		},
		
		onTouchCancel: function(event) {
			$("#cancelledTouches").text("CancelledTouches: "+event.changedTouches.length);
		},
	};
	return self.init();
};


$(document).ready(function () {
  var super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawr({id:"canvas", size: 15, showId: false }); 
});