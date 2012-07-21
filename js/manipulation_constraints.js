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
	var CTRL_TYPE_BOX = 2;
	var controls = [{
										id: 0,
										type: CTRL_TYPE_BOX,
										x: canvas.width/2 - offset.left - 100, 
										y: canvas.height/2 - offset.top, 
										w: 100,
										h: 100,
										defaultColor: "#8D8D8D", 
										state: CTRL_STATE_IDLE,
										engagedTouchId: [],
										unengagedTouchId: [],
										minWidth: 40,
										minHeight: 40,
										maxWidth: 200,
										maxHeight: 200,
									}];
	var CTRL_ENGAGEDCOLOR = "rgba(250, 250, 250, 1.0)";
	
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
		
		compare: function(a,b) {
		  if (a.distance < b.distance)
		     return -1;
		  if (a.distance > b.distance)
		    return 1;
		  return 0;
		},
		getDistance: function(point1,point2) {
			  var xs = 0;
			  var ys = 0;
			  xs = point2.x - point1.x;
			  xs = xs * xs;
			  ys = point2.y - point1.y;
			  ys = ys * ys;
			  return Math.sqrt( xs + ys );
			},
		drawTether: function(touch, control) {
			ctxt.beginPath();
			switch(control.type) {
				case CTRL_TYPE_BOX:
					//ASSUMPTION that the touch will not be within the object
					//Find the section in which the touch lies and decide the edge to tether to
					var c = control, t=touch;
					var distanceBetTouchNEdge = [];
					distanceBetTouchNEdge.push({distance: self.getDistance({x: c.x+c.w/2, y: c.y}, t), side: 't'});
					distanceBetTouchNEdge.push({distance: self.getDistance({x: c.x, y: c.y+c.h/2},t), side: 'l'});
					distanceBetTouchNEdge.push({distance: self.getDistance({x: c.x+c.w/2, y: c.y+c.h},t), side: 'b'});
					distanceBetTouchNEdge.push({distance: self.getDistance({x: c.x+c.w, y: c.y+c.h/2},t), side: 'r'});

					distanceBetTouchNEdge.sort(self.compare);
					
					//Getting the first element (i.e with the smallest value of distance)
					switch(distanceBetTouchNEdge[0].side) {
						case 'l':
							ctxt.moveTo(c.x, c.y + c.h/2);
							break;
						case 't':
							ctxt.moveTo(c.x + c.w/2, c.y);
							break;
						case 'b':
							ctxt.moveTo(c.x + c.w/2, c.y + c.h);
							break;
						case 'r':
							ctxt.moveTo(c.x + c.w, c.y + c.h/2);
							break;
					}

				case CTRL_TYPE_BUTTON:
					ctxt.moveTo(control.x + control.w/2, control.y + control.h/2);
					break;
				case CTRL_TYPE_SLIDER:
					ctxt.moveTo(control.handleX, control.handleY);
					break;
			}
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
			switch(control.state) {
				case CTRL_STATE_IDLE:
					ctxt.fillStyle = control.defaultColor;      
					break;
				case CTRL_STATE_ENGAGED:
					ctxt.fillStyle = CTRL_ENGAGEDCOLOR;
					//TODO if the engagedTouchId is not on the control draw tethering
					break;
			}
			
			switch(control.type) {
				case CTRL_TYPE_SLIDER:
					//Draw slider
					ctxt.moveTo(control.x, control.y);
					if(control.orn == 'v') {
						ctxt.lineTo(control.x, control.y + control.l);
					} else if (control.orn == 'h') {
						ctxt.lineTo(control.x + control.l, control.y);
					}
					
					ctxt.lineWidth = 4;
					ctxt.strokeStyle = "#CD6562";
					ctxt.stroke();	
					ctxt.closePath();
					//Draw handle
					ctxt.beginPath();
					ctxt.arc(control.handleX, control.handleY, control.handleR, 0, 2*Math.PI, false);
					ctxt.fill();
					ctxt.lineWidth = 2;
					ctxt.stroke();
					ctxt.closePath();
					break;
				case CTRL_TYPE_BUTTON:
					ctxt.rect(control.x, control.y, control.w, control.h);
					ctxt.fill();
		      ctxt.lineWidth = 2;
		      ctxt.strokeStyle = 'black';
		      ctxt.stroke();
					ctxt.font = "bold 12px sans-serif";
					ctxt.fillStyle = "black";
					ctxt.textAlign = "center";
					ctxt.fillText(control.title, control.x + CTRL_TEXTPADDING_LEFT, control.y + CTRL_TEXTPADDING_TOP);
					ctxt.closePath();
					break;
				case CTRL_TYPE_BOX:
					ctxt.rect(control.x, control.y, control.w, control.h);
					ctxt.fill();
					ctxt.lineWidth = 1;
		      ctxt.strokeStyle = 'black';
		      ctxt.stroke();
					ctxt.closePath();
					break;
			}
			
		},
		isTouchOnAControl: function(touch, control) {
			//ASSUMPTION Canvas origin and control origin are top left
			switch(control.type) {
				case CTRL_TYPE_BOX:
				case CTRL_TYPE_BUTTON:
					if(touch.x >= control.x && touch.y >= control.y && (touch.x - control.x) <= control.w && (touch.y - control.y) <= control.h) {
						return true;
					} else {
						return false;
					}
					break;
				case CTRL_TYPE_SLIDER:
					//ASSUMPTION: handle is circle
					if(Math.abs(touch.x - control.handleX) <= control.handleR  && Math.abs(touch.y - control.handleY) <= control.handleR) {
						return true;
					} else {
						return false;
					}
					break;
			}
			
		},
		areAllEngagedTouchesOnControl: function(control, reqTouchCnt) {
			//reqTouchCnt: required touch count
			var retVal = 0;
			$.each(control.engagedTouchId, function(i, tId){
				var i = 0;
				while(i<activeTouches.length && activeTouches[i].id !== tId) {
					i++;
				}
				var touch = activeTouches[i];
				if(self.isTouchOnAControl(touch, control)) {
					retVal += 1;
				}
			});
			return ((retVal == reqTouchCnt)? true:false);
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
						switch(control.type) {
							case CTRL_TYPE_SLIDER:
							case CTRL_TYPE_BUTTON:
								if(control.state != CTRL_STATE_ENGAGED) {
									control.state = CTRL_STATE_ENGAGED;
									control.engagedTouchId.push(newTouch.id);
									newTouch.engagedControlId = control.id;
								}
								break;
							case CTRL_TYPE_BOX:
								if(control.engagedTouchId.length < 2) {
									control.state = CTRL_STATE_ENGAGED;
									control.engagedTouchId.push(newTouch.id);
									newTouch.engagedControlId = control.id;
								}
								break;
						}
						 
					}
				});				 	
      });
      event.preventDefault();
    },
		isValueWithinLimits: function(lowLim, upLim, value) {
			if(lowLim <= value && value <= upLim) {
				return true;
			} else {
				return false;
			}
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
					var t = activeTouches[i];
					if(t.engagedControlId != -1) {
						var engagedControl = controls[t.engagedControlId];
						switch(engagedControl.type) {
							case CTRL_TYPE_SLIDER:
								if (engagedControl.orn == 'v') {
									//update vertical position of handle
									var deltaY = chTouch.pageY - offset.top - activeTouches[i].y;
									//apply delta only if it is within bounds
									//bounds here are the origin of the slider and it's end point
									if(self.isValueWithinLimits(engagedControl.y, engagedControl.y + engagedControl.l, engagedControl.handleY + deltaY)) {
										engagedControl.handleY += deltaY;
									} 
								} else if (engagedControl.orn == 'h') {
									//update horizontal position of handle
									var deltaX = chTouch.pageX - offset.left - activeTouches[i].x;
									//apply delta only if it is within bounds
									//bounds here are the origin of the slider and it's end point
									if(self.isValueWithinLimits(engagedControl.x, engagedControl.x + engagedControl.l, engagedControl.handleX + deltaX)) {
										engagedControl.handleX += deltaX;
									}
								}
								break;
							case CTRL_TYPE_BOX:
								var deltaY = chTouch.pageY - offset.top - t.y;
								var deltaX = chTouch.pageX - offset.left - t.x;
								
								switch(engagedControl.engagedTouchId.length) {
									case 1:
									//single finger
										if(self.isTouchOnAControl(t, engagedControl)) {
											if(self.isValueWithinLimits(engagedControl.y, engagedControl.y + engagedControl.h, t.y)) {
												engagedControl.y += deltaY;
											}
										
											if(self.isValueWithinLimits(engagedControl.x, engagedControl.x + engagedControl.w, t.x)) {
												engagedControl.x += deltaX;
											}
										}
										break;
									case 2:
									//two finger
										if(self.areAllEngagedTouchesOnControl(engagedControl, 2)) {
											if(self.isValueWithinLimits(engagedControl.minWidth, engagedControl.maxWidth, engagedControl.w + deltaX)) {
												engagedControl.w += deltaX;
											}
										
											if(self.isValueWithinLimits(engagedControl.minHeight, engagedControl.maxHeight, engagedControl.h + deltaY)) {
												engagedControl.h += deltaY;
											}
										}
										break;
								}
								break;
						}
					}
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
						var c = controls[justRemovedTouch.engagedControlId];
						var index = c.engagedTouchId.indexOf(justRemovedTouch.id); 
						c.engagedTouchId.splice(index,1);
						if(c.engagedTouchId.length == 0) {
							c.state = CTRL_STATE_IDLE;
						}
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