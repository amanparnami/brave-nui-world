// canvasDrawr originally from Mike Taylr  http://miketaylr.com/
// Tim Branyen massaged it: http://timbranyen.com/
// and Paul Irish: http://paulirish.com did too. with multi touch.
// and boris fixed some touch identifier stuff to be more specific.
           
var CanvasDrawr = function(options) {
		// grab canvas element
		var canvas = document.getElementById(options.id),
		    ctxt = canvas.getContext("2d");
   
		canvas.style.width = '100%';
		canvas.width = canvas.offsetWidth;
		canvas.style.width = '';

		// set props from options, but the defaults are for the cool kids
		ctxt.lineWidth = options.size || Math.ceil(Math.random() * 35);
		ctxt.lineCap = options.lineCap || "round";
		ctxt.pX = undefined;
		ctxt.pY = undefined;

		var points = ["","",""]; //The length should be set to maximum number of touches supported
		var removedPoints = ["","",""];
		var intervals = new Array();
		var offset = $(canvas).offset();
		var newItemIndex = -1;
		var removedItemIndex = 0;
		var updatedItemIndex = 0;
		var wantMore = false;

		var self = {
		    //bind click events
		    init: function() {
		        //set pX and pY from first click
		        canvas.addEventListener('touchstart', self.preDraw, false);
		        canvas.addEventListener('touchmove', self.draw, false);
						canvas.addEventListener('touchend', self.dissolve, false);
						canvas.addEventListener('touchcancel', self.touchCancelled, false);
		    },
				touchCancelled: function(event) {
					$("#cancelledTouches").text("CancelledTouches: "+event.changedTouches.length);
				},
		    preDraw: function(event) {
						$("#touches").text("Touches: "+event.touches.length);
		        $.each(event.changedTouches, function(i, touch) {
         
		            var id      = touch.identifier, 
		                colors  = ["red", "green", "yellow", "blue", "magenta", "orangered"], mycolor = "blue";
		                /*mycolor = colors[Math.floor(Math.random() * colors.length)]*/
								wantMore = true;
								$.each(points, function(i,point) {
									if(point == "" && wantMore) {
										//Place the new touch into first item that is null
											newItemIndex = i;
											wantMore = false;			 	
									}
								});
								
								points[newItemIndex] = { 
													id: touch.identifier, 
													x: touch.pageX - offset.left, 
	                        y: touch.pageY - offset.top, 
	                        color : mycolor,
													steps : 25
	                      };
								//draw the point
								$("#newItemIndex").text("newItemIndex: "+newItemIndex);
								ctxt.beginPath();	
							  ctxt.arc(points[newItemIndex].x, points[newItemIndex].y, 50, 0, 2 * Math.PI, false);
							  ctxt.fillStyle = points[newItemIndex].color;
							  ctxt.fill();
								ctxt.fillStyle = "black";
								ctxt.font = "bold 12px sans-serif";
								ctxt.fillText(points[newItemIndex].id,points[newItemIndex].x-12, points[newItemIndex].y);			 	
		        });

		        event.preventDefault();
		    },

		    draw: function(event) {
						ctxt.clearRect(0, 0, canvas.width, canvas.height);
		        $.each(event.touches, function(i, touch) {
		            var id = touch.identifier;
								wantMore = true;
								$.each(points, function(i,point) {
									//update position of tracked points
									if(point.id == id && wantMore) {
										//match found
										updatedItemIndex = i;
										wantMore = false;
									}
								});
								points[updatedItemIndex].x = touch.pageX - offset.left;
								points[updatedItemIndex].y = touch.pageY - offset.left;
				        //redraw the point                
								ctxt.beginPath();
							  ctxt.arc(points[updatedItemIndex].x, points[updatedItemIndex].y, 50, 0, 2 * Math.PI, false);
							  ctxt.fillStyle = points[updatedItemIndex].color;
							  ctxt.fill();
								ctxt.fillStyle = "black";
								ctxt.font = "bold 12px sans-serif";
								ctxt.fillText(points[updatedItemIndex].id,points[updatedItemIndex].x-12, points[updatedItemIndex].y);
		           
		        });

		        event.preventDefault();
		    },

		    move: function(i, changeX, changeY) {
		        ctxt.strokeStyle = lines[i].color;
		        ctxt.beginPath();
		        ctxt.moveTo(lines[i].x, lines[i].y);

		        ctxt.lineTo(lines[i].x + changeX, lines[i].y + changeY);
		        ctxt.stroke();
		        ctxt.closePath();

		        return { x: lines[i].x + changeX, y: lines[i].y + changeY };
		    },
				dissolveAnim: function(index) {
					return setInterval(function() {
						ctxt.clearRect(0, 0, canvas.width, canvas.height);
						points[index].steps -= 5;
						$.each(points, function(i, point){
							if(point != "") {
								ctxt.beginPath();
							  ctxt.arc(point.x, point.y, point.steps*2, 0, 2 * Math.PI, false);
							  ctxt.fillStyle = point.color;
							  ctxt.fill();
								ctxt.fillStyle = "black";
								ctxt.font = "bold 12px sans-serif";
								ctxt.fillText(point.id,point.x-12, point.y);
							}
						});
					},15);
				},
		
				dissolve: function(event) {
					$("#changedTouches").text("ChangedTouches: "+event.changedTouches.length);
					$("#touches").text("Touches: "+event.touches.length);
					$("#points").text("Points: "+points.length);
					$.each(event.changedTouches, function(i, touch) {
            var id = touch.identifier;
						wantMore = true;
						$.each(points, function(i,point) { 
							if(point.id == id && wantMore) {
								//set the point null
								removedItemIndex = i;
								wantMore = false;
							}
						});
						intervals[removedItemIndex] = self.dissolveAnim(removedItemIndex);
						setTimeout(function() {clearInterval(intervals[removedItemIndex]); points[removedItemIndex] = "";},100);
						$("#removedItemIndex").text("removedItemIndex: "+removedItemIndex);
						/*if(points[id].steps != 0) points[id].steps -= 2 ;	
						ctxt.clearRect(0, 0, canvas.width, canvas.height);
						//Return everything else to it's state
						$.each(points, function() {
							ctxt.beginPath();
						  ctxt.arc(this.x, this.y, (this.steps)*2, 0, 2 * Math.PI, false);
						  ctxt.fillStyle = this.color;
						  ctxt.fill();
						});*/
						//intervals[id] = setInterval(function (){


						/*ctxt.beginPath();
					  ctxt.arc(points[id].x, points[id].y, steps[id]*2, 0, 2 * Math.PI, false);
					  ctxt.fillStyle = points[id].color;
					  ctxt.fill();*/
						//	}, 20);
						//setTimeout("clearInterval(intervals[id])",500);
					});
					ctxt.clearRect(0, 0, canvas.width, canvas.height);
       
		      $.each(points, function(i, point){
						if(point != "") {
							ctxt.beginPath();
						  ctxt.arc(point.x, point.y, 50, 0, 2 * Math.PI, false);
						  ctxt.fillStyle = point.color;
						  ctxt.fill();
							ctxt.fillStyle = "black";
							ctxt.font = "bold 12px sans-serif";
							ctxt.fillText(point.id,point.x-12, point.y);
						}
					});
				event.preventDefault();
				}
		};

		return self.init();
};


$(document).ready(function () {
  var super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawr({id:"canvas", size: 15 }); 
});
