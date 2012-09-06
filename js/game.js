(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

window.onload = function () {
    //start crafty
    Crafty.init();
    //Crafty.canvas.init();
    


	Crafty.scene("scene1", function () {
		
		var block1 = Crafty.e( "2D, Draggable, DOM, Color, Collision" ).attr( { w: 20, h: 300 } )
			.color( "red" );
		block1.dragDirection({x:1, y:0});
		//block1.onHit("2D", function() { this.stopDrag(); console.log("hit2"); });
		
		
		// block1.bind("Dragging", function(){
			// this.onHit("Color", function() { this.stopDrag();  });
		// });
		// block1.bind("StartDrag", function(){
			// this.onHit("Color", function() { this.stopDrag();  });
		// });
		
		block1.bind("Dragging", function() {
			this.onHit("Collision", function (){ this.stopDrag(); });
		});
		

		var block2 = Crafty.e( "2D, Draggable, DOM, Color, Collision" ).attr( { w: 20, h: 300 } )
			.color( "green" ).onHit( "Color", function () { });
		block2.dragDirection({x:0, y:1});		

		var myBox = Crafty.e("2D,DOM,Player,Collision,Draggable").collision(
			new Crafty.polygon([10,10],[50,10],[50,50],[10,50]));//.image('img/ballon.png', true);
		myBox.dragDirection({x:1, y:0});
		//myBox.bind("StartDrag", function(e) {
        //    console.log(e);
        //});
	});


	//automatically play the loading scene
	Crafty.scene("scene1");

};



