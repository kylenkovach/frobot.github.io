/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};

 
game.HUD.Container = me.Container.extend({

	init: function() {
		// call the constructor
		this._super(me.Container, 'init');
		
		// persistent across level change
		this.isPersistent = true;

		// make sure we use screen coordinates
		this.floating = true;
		
		// make sure our object is always draw first
		this.z = Infinity;

		// give a name
		this.name = "HUD";
		
		// add our child score object at the right-bottom position
		this.addChild(new game.HUD.ScoreItem(me.game.viewport.width / 1.005, 440));

		// add the healthbar to the HUD
		this.addChild(new game.HUD.HealthBar(me.game.viewport.width / 2, 100));
        }   
	});

/** 
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend( {	
	/** 
	 * constructor
	 */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this._super(me.Renderable, 'init', [x, y, 10, 10]); 
		
		// create a font
		this.font = new me.BitmapFont("32x32_font", 32);
		this.font.set("right");
		
		// local copy of the global score
		this.score = -1;
	},
	
	/**
	 * update function
	 */
	update : function () {
		// we don't do anything fancy here, so just
		// return true if the score has been updated
		if (this.score !== game.data.score) {	
			this.score = game.data.score;
			return true;
		}
		return false;
	},

	/**
	 * draw the score
	 */
	draw : function (renderer) {
		this.font.draw (renderer, game.data.score, this.pos.x, this.pos.y);
	}

});

// a healthbar
game.HUD.HealthBar = me.Renderable.extend( {	

	/** 
	 * constructor
	 */
	init: function(x, y) {
		
		// call the parent constructor 
		// (size does not matter here)
		this._super(me.Renderable, 'init', [x, y, 10, 10]); 
		this.health = 100;
		this.font = new me.BitmapFont("VT323A", 32);
	},
	
	/**
	 * update function
	 */
	update : function () {
		// we don't do anything fancy here, just update the health
		// return true if the health has been updated
		if (this.health !== game.data.health) {	
			this.health = game.data.health;
			return true;
		}
		return false;
	},

	draw : function (renderer) {
        var context = renderer.getContext();
        //display player life bar
		context.fillStyle = '#000000';
		context.fillRect(me.game.viewport.width / 2.4 - 5, 5, 220, 20);
		context.fillStyle = '#FF0000';
		context.fillRect(me.game.viewport.width / 2.4, 10, playerhealth*2 + 10, 10);
		context.font="25px VT323";
        context.fillText("MOJO",me.game.viewport.width / 2.8,22);
	}
});