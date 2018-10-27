var weapons = {
}


/** 
Weapon templates 
**/
weapons.Laser = class
{
    constructor(sceneContext, options)
    {
        this.origin = null; // needs to be set when weapon is mounted
        this.target = null;
        this.sceneContext = sceneContext;

        options = setDefaults(options, {
            range: 300,
            cooldown: 500,
            lifetime: 1000,
            velocity: 600, 
            damage: 5, 
            offset: {x: 0, y: 0}
        });

        this.range = options.range;
        this.cooldown = options.cooldown;
        this.velocity = options.velocity;
        this.lifetime = options.lifetime;
        this.damage = options.damage;
        this.offset = options.offset;

        this.audio = {
            laserimpact: this.sceneContext.sound.add('laserimpact', { volume: 0.2}),
            laserfire: this.sceneContext.sound.add('laserfire', {volume: 0.6})
        }

        this.isFiring = false;

        emitter.on('update', this.update, this);

    }

    destroy()
    {
        emitter.removeListener('update', this.update, this);
        this.stopFire();
        this.origin = null;
    }

    beginFire()
    {
        this.isFiring = true;
        this.timer = this.sceneContext.time.addEvent({ delay: this.cooldown, callback: this.fire, callbackScope: this, repeat: Number.MAX_SAFE_INTEGER});

    }

    stopFire()
    {
        if(this.timer)
            this.timer.destroy();
        this.isFiring = false;
    }

    fire()
    {
        var laser = weapons.lasers.create(this.origin.x + this.offset.x, this.origin.y + this.offset.y, 'laser');

        var angle = Phaser.Math.Angle.Between(
            this.origin.x, 
            this.origin.y, 
            this.target.x,
            this.target.y + rand.realInRange(this.target.body.height / -2, this.target.body.height / 2)
        )// + (rand.realInRange(-0.04, 0.04));

        //var angle = Phaser.Math.Angle.BetweenPoints(this.origin, this.target) + (rand.realInRange(-0.04, 0.04));
        laser.rotation = angle;
        laser.setScale(0.4);
        var velocity = this.sceneContext.physics.velocityFromRotation(angle, this.velocity);
        laser.setVelocity(velocity.x, velocity.y);

        this.sceneContext.time.addEvent({ delay: this.lifetime, callback: function() {
            laser.destroy();
        }});

        // single target:
        //this.sceneContext.physics.add.overlap(laser, this.target, this.impact, null, this);

        // any target on the enemy team
        var that = this;
        this.sceneContext.getHostileTeams(this.origin).forEach(function(team) {
            that.sceneContext.physics.add.overlap(laser, ships[team], that.impact, null, that);
        });
        

        this.audio.laserfire.play();
    }

    impact(laser, target)
    {
        particles.fireballGenerator(laser.x, laser.y, target.x, target.y, 0.6);

        laser.destroy();

        this.audio.laserimpact.play();

        target.data.get('parent').damage(this.damage);
    }

    update()
    {
        // check if attached
        if(this.origin == null)
            return;

        // returns null if no targets are in range
        this.target = this.sceneContext.selectBestTarget(this.origin, this.range);

        if(this.target != null && !this.isFiring)
        {
            this.beginFire();
        }
        
        if(this.target == null && this.isFiring)
        {
            this.stopFire();
        }

    }
    

}

weapons.Missile = class
{
    constructor(sceneContext, options)
    {
        this.origin = null; // needs to be set when weapon is mounted
        this.target = null;
        this.sceneContext = sceneContext;


        options = setDefaults(options, {
            range: 1000,
            cooldown: 20000,
            lifetime: 5000,
            velocity: 250, 
            damage: 100, 
            offset: {x: 0, y: -30}
        });

        this.range = options.range;
        this.cooldown = options.cooldown;
        this.velocity = options.velocity;
        this.lifetime = options.lifetime;
        this.damage = options.damage;
        this.offset = options.offset;
        this.fireTimeOffset = 0//@DISABLERANDOM Phaser.Math.Between(-3, 3)

        this.audio = {
            laserimpact: this.sceneContext.sound.add('laserimpact', { volume: 0.2}),
            laserfire: this.sceneContext.sound.add('laserfire', {volume: 0.6})
        }

        this.isFiring = false;

        emitter.on('update', this.update, this);

    }

    destroy()
    {
        emitter.removeListener('update', this.update, this);
        this.stopFire();
        this.origin = null;
    }

    beginFire()
    {
        this.isFiring = true;
    }

    stopFire()
    {
        if(this.timer)
            this.timer.destroy();
        this.isFiring = false;
    }

    fire()
    {
        var missile = weapons.missiles.create(this.origin.x + this.offset.x, this.origin.y + this.offset.y, 'missile');
        missile.setDataEnabled();

        // snapshot the current target
        missile.data.set('target', this.target);
        missile.data.set('origin', this.origin);


        var angle = -0.5 * Math.PI;
        missile.rotation = angle;
        missile.setScale(0.4);
        var velocity = this.sceneContext.physics.velocityFromRotation(angle, this.velocity);
        missile.setVelocity(velocity.x + this.origin.body.velocity.x, velocity.y);

        

        this.sceneContext.time.addEvent({ delay: this.lifetime, callback: function() {
            missile.destroy();
        }});

        // single target:
        //this.sceneContext.physics.add.overlap(laser, this.target, this.impact, null, this);

        // any target on the enemy team
        var that = this;
        this.sceneContext.getHostileTeams(this.origin).forEach(function(team) {
            that.sceneContext.physics.add.overlap(missile, ships[team], that.impact, null, that);
        });
        

        this.audio.laserfire.play();
    }

    impact(missile, target)
    {
        particles.fireballGenerator(missile.x, missile.y, missile.x + missile.body.velocity.x, missile.y + missile.body.velocity.y);
        missile.destroy();
        this.audio.laserimpact.play();

        target.data.get('parent').damage(this.damage);
    }

    update(round)
    {
        // check if attached
        if(this.origin == null)
            return;

        // returns null if no targets are in range
        this.target = this.sceneContext.selectBestTarget(this.origin, this.range);

        if(this.target != null && !this.isFiring)
        {
            this.beginFire(round);
        }
        
        if(this.target == null && this.isFiring)
        {
            this.stopFire();
        }

        if(this.isFiring)
        {
            var whenspawn = Math.round(this.cooldown / gamerules.buildTimeFactor) + this.fireTimeOffset;   
            
            if(round % whenspawn == 0)
            {
                this.fire();
            }
        }

        var that = this;
        weapons.missiles.children.iterate(function(missile) {
            var localtarget = missile.data.get('target');
            if(localtarget != null && !localtarget.active)
            {
                localtarget = that.sceneContext.selectBestTarget(missile.data.get('origin'), that.range)
                missile.data.set('target', localtarget);
            }
            else if(missile != null && localtarget != null)
            {
                var newangle = Phaser.Math.Angle.BetweenPoints(missile, localtarget);
                var oldangle = missile.rotation;
                missile.rotation = Phaser.Math.Angle.RotateTo(oldangle, newangle, 0.03);
                var newvelocity = that.sceneContext.physics.velocityFromRotation(missile.rotation, that.velocity, missile.body.velocity);
               
                //missile.setVelocity(newvelocity)
                //that.sceneContext.physics.accelerateTo(missile, localtarget.x, localtarget.y, 60, 300, 300);
            }
        })

    }
    

}


weapons.Beam = class
{
    constructor(sceneContext, options)
    {
        this.origin = null; // needs to be set when weapon is mounted
        this.target = null;
        this.sceneContext = sceneContext;


        options = setDefaults(options, {
            range: 5000,
            cooldown: 20000,
            lifetime: 2000,
            velocity: 250, 
            damage: 0.2, 
            offset: {x: 0, y: 0}
        });

        this.range = options.range;
        this.cooldown = options.cooldown;
        this.velocity = options.velocity;
        this.lifetime = options.lifetime;
        this.damage = options.damage;
        this.offset = options.offset;
        this.fireTimeOffset = 0//@DISABLERANDOM Phaser.Math.Between(-3, 3)

        this.beams = sceneContext.physics.add.group();

        this.audio = {
            laserimpact: this.sceneContext.sound.add('laserimpact', { volume: 0.2}),
            laserfire: this.sceneContext.sound.add('laserfire', {volume: 0.6})
        }

        this.isFiring = false;

        emitter.on('update', this.update, this);

    }

    destroy()
    {
        emitter.removeListener('update', this.update, this);
        this.stopFire();
        this.origin = null;
    }

    beginFire()
    {
        this.isFiring = true;
    }

    stopFire()
    {
        if(this.timer)
            this.timer.destroy();
        this.isFiring = false;
    }

    fire()
    {
        var beam = this.beams.create(this.origin.x + this.offset.x, this.origin.y + this.offset.y, 'purplebeam');

        beam.setDataEnabled();

        // snapshot the current target
        beam.data.set('target', this.target);
        beam.data.set('origin', this.origin);
        beam.data.set('target-offset-x', rand.realInRange(this.target.body.width / -2, this.target.body.width / 2));
        beam.data.set('target-offset-y', rand.realInRange(this.target.body.height / -2, this.target.body.height / 2));

        // anchor the beam in the middle of the closest point
        beam.setOrigin(0, 0.5);

        // calculate scale from origin to target, 1 beam pixel texture = 1 distance unit
        // also pick a random spot on the target
        var distance = Phaser.Math.Distance.Between(
        	beam.x, 
        	beam.y, 
        	this.target.x + beam.data.get('target-offset-x'), 
        	this.target.y + beam.data.get('target-offset-y'));
        beam.setScale(1, distance);

        var angle = Phaser.Math.Angle.BetweenPoints(beam, this.target) + (Math.PI * 0.5);
        beam.rotation = angle;

        beam.setVelocity(this.origin.body.velocity.x, this.origin.body.velocity.y);

        

        this.sceneContext.time.addEvent({ delay: this.lifetime, callback: function() {
            beam.destroy();
        }});

        // single target:
        //this.sceneContext.physics.add.overlap(laser, this.target, this.impact, null, this);

        

        this.audio.laserfire.play();
    }

    impact(beam, target, round)
    {

    	if(round % 4 == 0)
        	particles.fireballGenerator(
        		target.x + beam.data.get('target-offset-x') + rand.realInRange(-1, 1), 
        		target.y + beam.data.get('target-offset-y') + rand.realInRange(-1, 1), 
        		target.x + target.body.velocity.x, 
        		target.y + target.body.velocity.y);
        //missile.destroy();
        //this.audio.laserimpact.play();
        target.data.get('parent').damage(this.damage);
    }

    update(round)
    {
        // check if attached
        if(this.origin == null)
        {
        	// if not attached, destroy all beams
        	 this.beams.children.iterate(function(beam) {
        	 	beam.destroy();
        	 })

            return;
        }

        // returns null if no targets are in range
        this.target = this.sceneContext.selectBestTarget(this.origin, this.range);

        if(this.target != null && !this.isFiring)
        {
            this.beginFire(round);
        }
        
        if(this.target == null && this.isFiring)
        {
            this.stopFire();
        }

        if(this.isFiring)
        {
            var whenspawn = Math.round(this.cooldown / gamerules.buildTimeFactor) + this.fireTimeOffset;   
            
            if(round % whenspawn == 0)
            {
                this.fire();
            }
        }

        var that = this;
        this.beams.children.iterate(function(beam) {
        	if(beam == null)
        		return;

            var localtarget = beam.data.get('target');

            // target was destroyed while evaluating
            if(localtarget != null && !localtarget.active)
            {
                beam.destroy();
                return;
            }

            // active beam
            if(beam != null && localtarget != null)
            {
            	// update beam facing
                var newangle = Phaser.Math.Angle.BetweenPoints(beam, localtarget)+ (Math.PI * 0.5);;
                beam.rotation = newangle;

                // update beam length
                var distance = Phaser.Math.Distance.Between(
		        	beam.x, 
		        	beam.y, 
		        	that.target.x + beam.data.get('target-offset-x'), 
		        	that.target.y + beam.data.get('target-offset-y'));

        		beam.setScale(1, distance);

        		// update beam speed (to keep it attached)
        		beam.setVelocity(that.origin.body.velocity.x, that.origin.body.velocity.y);

                // manually call impact, since we are point-to-point hitting the ship, not overlapping
                that.impact(beam, beam.data.get('target'), round);
          
            }
        })


    }
    

}

