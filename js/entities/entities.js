/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings)
    {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        
        // set the default horizontal & vertical speed (accel vector)
        this.body.setVelocity(3, 17);
             
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;

        // define a basic walking animation (using all frames)
        this.renderable.addAnimation("walk",  [9, 10, 11, 12]);
        // define a standing animation
        this.renderable.addAnimation("stand",  [0, 1, 2, 3, 4, 5, 5, 5, 6, 7, 7, 7, 8]);
        // define a jumping animation (using the last frame)
        this.renderable.addAnimation("jump",  [13]);
        // set the standing animation as default
        this.renderable.addAnimation("attack", [18]);
        this.renderable.addAnimation("shoot", [19]);
        this.renderable.setCurrentAnimation("stand");
        this.body.attacking = false;
        playerhealth = 100;
        playerposx = this.pos.x;
        playerposy = this.pos.y;
        attacking = false;
        this.lastHitTime = 0; 
        this.lastAttackTime = 1001;
        if(playerhealth == 100) {
            console.log(playerhealth);
            playerhealth == 100;
        }
        if(this.lastHitTime == 0) {
            this.lastHitTime = me.timer.getTime();
        }
        if(this.lastAttackTime == 0) {
            this.lastAttackTime = me.timer.getTime();
        }
    },

    /**
     * update the entity
     */
    update : function (dt) {
            
        if (me.input.isKeyPressed('left'))
        {
            // flip the sprite on horizontal axis
            this.renderable.flipX(true);
            // update the entity velocity
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
            // change to the walking animation
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
        }
        else if (me.input.isKeyPressed('right'))
        {
            // unflip the sprite
            this.renderable.flipX(false);
            // update the entity velocity
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            // change to the walking animation
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
        }
        else
        {
            this.body.vel.x = 0;
            // change to the standing animation
            if (!this.renderable.isCurrentAnimation("stand")) {
                this.renderable.setCurrentAnimation("stand");
            }
        }
        if (me.input.isKeyPressed('jump'))
        {    
            // change to the jump animation
            this.renderable.setCurrentAnimation("jump");
            if (!this.body.jumping && !this.body.falling) 
            {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.body.jumping = true;
                // play some audio 
                me.audio.play("jump");
            }
        }
        if (this.body.jumping || this.body.falling)
        {
            this.renderable.setCurrentAnimation("jump");
        }
        if(!me.input.isKeyPressed('attack'))
        {
            pressing = false;
            attacking = false;
        }
        if ((me.input.isKeyPressed('attack') && me.timer.getTime() - this.lastAttackTime > 500) && pressing == false)
        {
            this.body.attacking = true;
            attacking = true;
            this.renderable.setCurrentAnimation("attack");
            this.lastAttackTime = me.timer.getTime();
            pressing = true;
            console.log(me.timer.getTime() - this.lastAttackTime);
        }
        if(this.body.attacking==true && me.timer.getTime() - this.lastAttackTime < 500){
            this.body.attacking = true;
            attacking = true;
            this.renderable.setCurrentAnimation("attack");
        }
        if(this.body.attacking==true && me.timer.getTime() - this.lastAttackTime > 500 && me.input.isKeyPressed('attack')){
            this.body.attacking = false;
            attacking = false;
            this.renderable.setCurrentAnimation("stand");
        }
        if(this.body.attacking==true && me.timer.getTime() - this.lastAttackTime > 500 && !me.input.isKeyPressed('attack')){
            this.body.attacking = false;
            attacking = false;
        }

        /*if(me.input.isKeyPressed('shoot')) {
            console.log("player location: " + this.pos.x + ", " + this.pos.y)
            var myProjectile = me.pool.pull("ProjectileEntity", this.pos.x + 35, this.pos.y, { image: "Peace_Projectile", spritewidth: 16, spriteheight: 16 }, false);
            // Add the projectile to the game manager with z value 10
            me.game.world.addChild(myProjectile, 4);
            this.renderable.setCurrentAnimation("shoot");
        }*/
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        if (this.pos.x != playerposx || this.pos.y != playerposy)
        {
            playerposx = this.pos.x;
            playerposy = this.pos.y;
        }


        if (!this.inViewport && (this.pos.y > me.video.renderer.getHeight())) {
            // if yes reset the game
            me.game.world.removeChild(this);
            me.game.viewport.fadeIn("#000", 150, function(){
                me.audio.play("die", false);
                me.state.change(me.state.MENU);;
                me.game.viewport.fadeOut("#000", 150);
            });
            return true;
        }

        // handle collisions against other shapes
        me.collision.check(this);
                 
        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);     
        
    },

  /**
     * game over screen
     */
    gameOver: function() {
        me.game.world.removeChild(this);
        me.audio.stopTrack();
        me.state.change(me.state.GAMEOVER);
    },
    
  /**
     * collision handler
     */
    onCollision : function (response, other) {
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
                if (other.type === "platform") {
                    if (this.body.falling &&
                        !me.input.isKeyPressed('down') &&
                        // Shortest overlap would move the player upward
                        (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
                        (~~this.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        // Disable collision on the x axis
                        response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
                    }
                    // Do not respond to the platform (pass through)
                    return false;
                }
                break;

            case me.collision.types.ENEMY_OBJECT:
                if (attacking == false){
                    me.timer.lastUpdate = me.timer.getTime();
                    if ((response.overlapV.y>0) && !this.body.jumping) {
                        // bounce (force jump)
                        this.body.falling = false;
                        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                        // set the jumping flag
                        this.body.jumping = true;
                        // play some audio
                        me.audio.play("stomp");
                    }
                    else {
                        // let's flicker in case we touched an enemy
                        this.renderable.flicker(1000);
                        
                    }
                    // update health
                    if(me.timer.getTime() - this.lastHitTime > 1000) {
                        this.lastHitTime = me.timer.getTime();
                        if(playerhealth > 0){
                            console.log(playerhealth);
                            playerhealth -= 10;
                            this.renderable.flicker(1000);
                        } 
                        else {
                            this.alive = false;
                            me.game.world.removeChild(this);
                            this.gameOver();
                        }
                    }
                    
                    return false;
                    break;
                }
            case me.collision.types.PAINFUL_TILE:
            if (attacking==false){
                if(me.timer.getTime() - this.lastHitTime > 1000) {
                    this.lastHitTime = me.timer.getTime();
                    if(playerhealth > 0){
                        console.log(playerhealth);
                        playerhealth -= 10;
                        this.renderable.flicker(1000);
                    } 
                    else {
                        this.alive = false;
                        me.state.change(me.state.MENU);
                    }
                }
            }
            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }

        // Make the object solid
        return true;
    }
});


/**
 * Coin Entity
 */
game.CoinEntity = me.CollectableEntity.extend({    

    init: function (x, y, settings)
    {
        // call the parent constructor
        this._super(me.CollectableEntity, 'init', [x, y , settings]);
    },

    /**
     * colision handler
     */
    onCollision : function (response, other) {
        // do something when collide
        me.audio.play("cling");
        // give some score
        game.data.score += 250;
        // make sure it cannot be collected "again"
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        // remove it
        me.game.world.removeChild(this);

        return false;
    }
});

/**
 * Health Entity
 */
game.HealthEntity = me.CollectableEntity.extend({    

    init: function (x, y, settings)
    {
        // call the parent constructor
        this._super(me.CollectableEntity, 'init', [x, y , settings]);
    },

    /**
     * colision handler
     */
    onCollision : function (response, other) {
        // do something when collide
        me.audio.play("cling");
        // give some health
        if (playerhealth >= 80) {
            playerhealth = 100;
        }

        else {
            playerhealth += 20;
        }
        // make sure it cannot be collected "again"
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        // remove it
        me.game.world.removeChild(this);

        return false;
    }
});

/**
 * Enemy Entity
 */
game.EnemyEntity = me.Entity.extend({    
    init: function (x, y, settings)
    {
        
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 64;
        settings.frameheight = settings.height = 64;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight);
        
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        
        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.framewidth
        this.pos.x  = x + width - settings.framewidth;

        // to remember which side we were walking
        this.walkLeft = false;

        // walking & jumping speed
        this.body.setVelocity(1, 5);

        // walking animation
        this.renderable.addAnimation("walk",  [9, 9, 10, 10, 11, 11, 12, 12]);

        // define a standing animation
        this.renderable.addAnimation("stand",  [0, 1, 2, 3, 4, 5, 5, 5, 6, 7, 7, 7, 8]);

        this.renderable.setCurrentAnimation("walk"); 
        this.health = 10;
        this.lastHitTime = 0; 
        if(this.health == 10) {
            console.log(this.health);
            this.health == 10;
        }
        if(this.lastHitTime == 0) {
            this.lastHitTime = me.timer.getTime();
        }
    },
    
    // manage the enemy movement
    update : function (dt)
    {            
        if (this.alive)
        {
            if (this.walkLeft && this.pos.x <= this.startX)
            {
                this.walkLeft = false;
            }
            else if (!this.walkLeft && this.pos.x >= this.endX)
            {
                this.walkLeft = true;
            }
            
            this.renderable.flipX(this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

        }
        else
        {
            this.body.vel.x = 0;
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
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
                if (other.type === "platform") {
                    if (this.body.falling &&
                        !me.input.isKeyPressed('down') &&
                        // Shortest overlap would move the player upward
                        (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
                        (~~this.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        // Disable collision on the x axis
                        response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
                    }
                    // Do not respond to the platform (pass through)
                    return false;
                }
                break;

            case me.collision.types.ENEMY_OBJECT:
                if (attacking== true){
                    console.log("enemyattack");
                    if ((response.overlapV.y>0) && !this.body.jumping) {
                        // bounce (force jump)
                        this.body.falling = false;
                        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                        // set the jumping flag
                        this.body.jumping = true;
                        // play some audio
                        me.audio.play("stomp");
                    }
                    // update health
                    if(me.timer.getTime() - this.lastHitTime > 1000) {
                        this.lastHitTime = me.timer.getTime();
                        if(this.health > 0){
                            console.log(this.health);
                            this.health -= 10;
                            this.renderable.flicker(1000);
                        } 
                        else {
                            this.alive = false;
                            me.game.world.removeChild(this);
                        }
                    }
                    return false;
                    break;
                }
            case me.collision.types.PAINFUL_TILE:
                if(attacking==true)
                {
                    console.log("playercollision");
                    if(me.timer.getTime() - this.lastHitTime > 1000) {
                        this.lastHitTime = me.timer.getTime();
                        if(this.health > 0){
                            console.log(this.health);
                            this.health -= 10;
                            this.renderable.flicker(1000);
                        } 
                        else {
                            this.alive = false;
                            me.game.world.removeChild(this);
                        }
                    }
                }   
            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }
        
        // Make all other objects solid
        return true;
    }
});

/**
 * Boss Entity
 */
game.BossEntity = me.Entity.extend({    
    init: function (x, y, settings)
    {
          
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 128;
        settings.frameheight = settings.height = 128;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight);
        
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        
        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.framewidth
        this.pos.x  = x + width - settings.framewidth;

        // to remember which side we were walking
        this.walkLeft = false;

        // walking & jumping speed
        this.body.setVelocity(2, 10);

        // walking animation
        this.renderable.addAnimation("walk",  [0, 0, 1, 1, 2, 2, 3, 3]);

        // define a standing animation
        this.renderable.addAnimation("stand",  [0]);

        this.renderable.addAnimation("jump",  [4]);

        this.renderable.addAnimation("attack",  [5, 6, 7, 8, 9]);

        this.renderable.setCurrentAnimation("walk"); 
        this.health = 100;
        this.lastHitTime = 0; 
        if(this.health == 100) {
            console.log(this.health);
            this.health == 100;
        }
        if(this.lastHitTime == 0) {
            this.lastHitTime = me.timer.getTime();
        }
    },
    
    // manage the enemy movement
    update : function (dt)
    { 
        if (this.inViewport)
        {
            if (this.alive)
            {
                if (this.walkLeft && this.pos.x < playerposx)
                {
                    this.walkLeft = false;
                }
                else if (!this.walkLeft && this.pos.x > playerposx)
                {
                    this.walkLeft = true;
                }
                else if (this.pos.x == playerposx)
                {
                    this.renderable.setCurrentAnimation("jump");
                    if (!this.body.jumping && !this.body.falling) 
                    {
                        // set current vel to the maximum defined value
                        // gravity will then do the rest
                        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                        // set the jumping flag
                        this.body.jumping = true;
                        // play some audio 
                        me.audio.play("jump");
                    }
                }
                this.renderable.flipX(this.walkLeft);
                this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

                /*if (this.pos.y > playerposy)
                {
                    this.renderable.setCurrentAnimation("jump");
                    if (!this.body.jumping && !this.body.falling) 
                    {
                        // set current vel to the maximum defined value
                        // gravity will then do the rest
                        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                        // set the jumping flag
                        this.body.jumping = true;
                        // play some audio 
                        me.audio.play("jump");
                    }
                }
                else
                {
                    this.renderable.setCurrentAnimation("walk");
                }*/

            }
            else 
            {
                me.game.world.removeChild(this);
            }
        }           
        else
        {
            this.body.vel.x = 0;
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
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
                if (other.type === "platform") {
                    if (this.body.falling &&
                        !me.input.isKeyPressed('down') &&
                        // Shortest overlap would move the player upward
                        (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
                        (~~this.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        // Disable collision on the x axis
                        response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
                    }
                    // Do not respond to the platform (pass through)
                    return false;
                }
                break;

            case me.collision.types.ENEMY_OBJECT:
                if (attacking== true){
                    console.log("enemyattack");
                    if ((response.overlapV.y>0) && !this.body.jumping) {
                        // bounce (force jump)
                        this.body.falling = false;
                        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                        // set the jumping flag
                        this.body.jumping = true;
                        // play some audio
                        me.audio.play("stomp");
                    }
                    // update health
                    if(me.timer.getTime() - this.lastHitTime > 1000) {
                        this.lastHitTime = me.timer.getTime();
                        if(this.health > 0){
                            console.log(this.health);
                            this.health -= 10;
                            this.renderable.flicker(1000);
                        } 
                        else {
                            this.alive = false;
                            me.game.world.removeChild(this);
                        }
                    }
                    return false;
                    break;
                }
            case me.collision.types.PAINFUL_TILE:
                if(attacking==true)
                {
                    console.log("playercollision");
                    if(me.timer.getTime() - this.lastHitTime > 1000) {
                        this.lastHitTime = me.timer.getTime();
                        if(this.health > 0){
                            console.log(this.health);
                            this.health -= 10;
                            this.renderable.flicker(1000);
                        } 
                        else {
                            this.alive = false;
                            me.game.world.removeChild(this);
                        }
                    }
                }   
            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }
        
        // Make all other objects solid
        return true;
    }
});

game.PainfulTile = me.Entity.extend({    
    init: function (x, y, settings)
    {
        
          
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 32;
        settings.frameheight = settings.height = 32;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight);
        
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.body.collisionType = me.collision.types.PAINFUL_TILE;
        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.framewidth
        this.pos.x  = x + width - settings.framewidth;

        // to remember which side we were walking
        this.walkLeft = false;

        this.lastHitTime = 0;
        if(this.lastHitTime == 0) {
            this.lastHitTime = me.timer.getTime();
        }

    },
    
    // manage the enemy movement
    update : function (dt)
    {                 
        // handle collisions against other shapes
        me.collision.check(this);
    },
    
    /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        
        // Make all other objects solid
        return true;
    }
});

/**
 * Flying Enemy Entity
 */
game.FlyingEnemyEntity = me.Entity.extend({    
    init: function (x, y, settings)
    {
        
          
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 64;
        settings.frameheight = settings.height = 64;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight);
        
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        
        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.framewidth
        this.pos.x  = x + width - settings.framewidth;

        // to remember which side we were walking
        this.walkLeft = false;

        // walking & jumping speed
        this.body.setVelocity(3, 0);

        // walking animation
        this.renderable.addAnimation("walk",  [0, 1]);

        // define a standing animation
        this.renderable.addAnimation("stand",  [0, 1]);

        this.renderable.setCurrentAnimation("walk"); 
        this.health = 10;
        this.lastHitTime = 0; 
        this.gravity = 0;
        if(this.health == 10) {
            console.log(this.health);
            this.health == 10;
        }
        if(this.lastHitTime == 0) {
            this.lastHitTime = me.timer.getTime();
        }
    },
    
    // manage the enemy movement
    update : function (dt)
    {            
        if (this.alive)
        {
            if (this.walkLeft && this.pos.x <= this.startX)
            {
                this.walkLeft = false;
            }
            else if (!this.walkLeft && this.pos.x >= this.endX)
            {
                this.walkLeft = true;
            }
            
            this.renderable.flipX(this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

        }
        else
        {
            this.body.vel.x = 0;
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
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
                if (other.type === "platform") {
                    if (this.body.falling &&
                        !me.input.isKeyPressed('down') &&
                        // Shortest overlap would move the player upward
                        (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
                        (~~this.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        // Disable collision on the x axis
                        response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
                    }
                    // Do not respond to the platform (pass through)
                    return false;
                }
                break;

            case me.collision.types.ENEMY_OBJECT:
                if (attacking == true){
                    console.log("enemyattack");
                    if ((response.overlapV.y>0) && !this.body.jumping) {
                        // bounce (force jump)
                        this.body.falling = false;
                        this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                        // set the jumping flag
                        this.body.jumping = true;
                        // play some audio
                        me.audio.play("stomp");
                    }
                    // update health
                    if(me.timer.getTime() - this.lastHitTime > 1000) {
                        this.lastHitTime = me.timer.getTime();
                        console.log("hit time");
                        if(this.health > 0){
                            console.log(this.health);
                            this.health -= 10;
                            this.renderable.flicker(1000);
                        } 
                        else {
                            this.alive = false;
                            me.game.world.removeChild(this);
                        }
                    }
                    return false;
                    break;
                }
            case me.collision.types.PAINFUL_TILE:
                if(attacking==true)
                {
                    console.log("playercollision");
                    if(me.timer.getTime() - this.lastHitTime > 1000) {
                        this.lastHitTime = me.timer.getTime();
                        if(this.health > 0){
                            console.log(this.health);
                            this.health -= 10;
                            this.renderable.flicker(1000);
                        } 
                        else {
                            this.alive = false;
                            me.game.world.removeChild(this);
                        }
                    }
                }   
            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }
        
        // Make all other objects solid
        return true;
    }
});

/*----------------
 a Projectile entity
------------------------ */
game.ProjectileEntity = me.Entity.extend({
    init: function(x, y, settings, left) {
    settings.width = 16;
    settings.height = 16;
    // call the parent constructor
    this._super(me.Entity, 'init', [x, y, settings]);

    this.gravity = 0;

    this.left = left;   

    this.body.collisionType = me.collision.types.PROJECTILE_ENTITY;
    console.log("Projectile created");

    },
 
    onCollision : function () {
        console.log("Hit!") 
        // make sure it cannot be collected "again"
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
    },

    update: function (dt) {
        console.log("update function called") 
        this.renderable.flipX(this.left);
        this.body.vel.x += (this.left)? - this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
        if (!this.inViewport) {
            me.game.world.removeChild(this);
            return true;
            console.log("Projectile be gone")
        }
        this.body.update(dt);
        return true;    
    },

    draw: function(renderer) {
        this.image = "Peace_Projectile";
        //this.draw (renderer, this.image, this.pos.x, this.pos.y);
    }
});


