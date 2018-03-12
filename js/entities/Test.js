/**
 * Enemy Entity
 */
game.EnemyEntity = me.Entity.extend({    
    init: function (x, y, settings)
    {
        this.image = "Peace_Projectile"
          
        settings.width = 150;
        settings.height = 16;

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        //settings.framewidth = settings.width = 16;
        //settings.frameheight = settings.height = 16;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight);
        
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y, settings]);
        
        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.pos.x  = x + width - settings.framewidth;

        // to remember which side we were shooting
        this.shootLeft = false;

        // shooting & jumping speed
        this.body.setVelocity(5, 0);

        // walking animation
        this.renderable.addAnimation("shoot",  [0]);


        this.renderable.setCurrentAnimation("shoot"); 
    
    },
    
    // manage the enemy movement
    update : function (dt)
    {            
        if (this.inViewport)
        {
            if (this.shootLeft && this.pos.x <= this.startX)
            {
                this.shootLeft = false;
            }
            else if (!this.shootLeft && this.pos.x >= this.endX)
            {
                this.shootLeft = true;
            }
            
            this.renderable.flipX(this.shootLeft);
            this.body.vel.x += (this.shootLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

        }
        else
        {
            me.game.world.removeChild(this);
        }
        // check & update movement
        this.body.update(dt);
            
        // handle collisions against other shapes
        me.collision.check(this);
            
        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },
    
    /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        console.log("Hit!") 
        // make sure it cannot be collected "again"
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
        // Make all other objects solid
        return true;
    },

    draw: function(renderer) {
        this.image = "Peace_Projectile";
        this.draw (renderer, this.image, this.pos.x, this.pos.y);
    }
});
