var SVGDrawr = function(options) {
	//Get svg element
	var svg = document.getElementById(options.id);
	
	var self = {
		init: function() {
			//Finger lands on the screen
      svg.addEventListener('touchstart', self.onTouchStart, false);
		},
		
		onTouchStart: function(event) {
			//Change the color of the rectangle to red
			$(svg).children().attr("fill","#ff0000");
			event.preventDefault();
		},
		
		debug: function(message) {
			$("#debug").append("<span>"+message+"</span>&nbsp&nbsp");
		}
	};
	
	return self.init();
};

$(document).ready(function () {
  var super_awesome_multitouch_drawing_svg_thingy = new SVGDrawr({id:"svg-canvas", size: 15 }); 
});