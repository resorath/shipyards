var weapons = {
};


weapons.Weapon = class 
{
    constructor(sceneContext, options)
    {

    }

    get type() { return "weapon"; }

    get x() { return this.origin.x + this.offset.x; }
    get y() { return this.origin.y + this.offset.y; }


};

/** 
Weapon templates 
**/
weapons.Laser = class extends weapons.Weapon
{
    constructor(sceneContext, options)
    {
        super(sceneContext, options);

        this.origin = null; // needs to be set when weapon is mounted
        this.target = null;
        this.sceneContext = sceneContext;

        options = setDefaults(options, {
            range: 300,
            cooldown: 10,
            lifetime: 1000,
            velocity: 600, 
            damage: 5
        });

        if(typeof options.offset === 'undefined')
            options.offset = { x: 0, y: 0 };

        this.range = options.range;
        this.cooldown = options.cooldown;
        this.velocity = options.velocity;
        this.lifetime = options.lifetime;
        this.damage = options.damage;

        this.damageMods = setDefaults(options.damageMods, {
            S: 1,
            M: 1,
            L: 1,
            XL: 1
        });

        this.targetPriority = setDefault(options.targetPriority, ['S', 'M', 'L', 'XL']);

        this.offset = options.offset;
        this.nextFireShot = sceneContext.round;

        this.lasers = sceneContext.physics.add.group();

        this.audio = {
            laserimpact: this.sceneContext.sound.add('laserimpact', { volume: 0.2}),
            laserfire: this.sceneContext.sound.add('laserfire', {volume: 0.6})
        };


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
        //this.timer = this.sceneContext.time.addEvent({ delay: this.cooldown, callback: this.fire, callbackScope: this, repeat: Number.MAX_SAFE_INTEGER});

    }

    stopFire()
    {
        //if(this.timer)
        //    this.timer.destroy();
        this.isFiring = false;
    }

    fire()
    {
    	if(this.target == null || typeof this.target.body === 'undefined')
    		return;

        var laser = this.lasers.create(this.origin.body.x + this.offset.x, this.origin.body.y + this.offset.y, 'laser');

        var angle = Phaser.Math.Angle.Between(
            this.origin.x, 
            this.origin.y, 
            this.target.x,
            this.target.y + rand.realInRange(this.target.body.height / -2, this.target.body.height / 2)
        );// + (rand.realInRange(-0.04, 0.04));

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

        target.data.get('parent').damage(this.damage, this.damageMods);
    }

    update(round)
    {
        // check if attached
        if(this.origin == null)
            return;

        // returns null if no targets are in range
        this.target = this.sceneContext.selectBestTarget(this, this.range, this.targetPriority);

        if(this.target != null && !this.isFiring)
        {
            this.beginFire();
        }
        
        if(this.target == null && this.isFiring)
        {
            this.stopFire();
        }

        if(this.isFiring)
        {
            if(this.nextFireShot <= round)
            {
                this.nextFireShot = round + this.cooldown;
                this.fire();
            }

        }

    }
    

};

weapons.Missile = class extends weapons.Weapon
{
    constructor(sceneContext, options)
    {
        super(sceneContext, options);

        this.origin = null; // needs to be set when weapon is mounted
        this.target = null;
        this.sceneContext = sceneContext;


        options = setDefaults(options, {
            range: 1000,
            cooldown: 300,
            lifetime: 5000,
            velocity: 250, 
            damage: 100
        });


    
        if(typeof options.offset === 'undefined')
            options.offset = { x: 0, y: 0 };

        this.range = options.range;
        this.cooldown = options.cooldown;
        this.velocity = options.velocity;
        this.lifetime = options.lifetime;
        this.damage = options.damage;

        this.damageMods = setDefaults(options.damageMods, {
            S: 1,
            M: 1,
            L: 1,
            XL: 1
        });

        this.targetPriority = setDefault(options.targetPriority, ['M', 'S', 'L', 'XL']);

        this.offset = options.offset;
        this.nextFireShot = sceneContext.round;


        this.missiles = sceneContext.physics.add.group();

        this.audio = {
            laserimpact: this.sceneContext.sound.add('laserimpact', { volume: 0.2}),
            laserfire: this.sceneContext.sound.add('laserfire', {volume: 0.6})
        };

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
        var missile = this.missiles.create(this.origin.body.x + this.offset.x, this.origin.body.y + this.offset.y, 'missile');
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

        target.data.get('parent').damage(this.damage, this.damageMods);
    }

    update(round)
    {
        // check if attached
        if(this.origin == null)
            return;

        // returns null if no targets are in range
        this.target = this.sceneContext.selectBestTarget(this, this.range, this.targetPriority);

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
            if(this.nextFireShot <= round)
            {
                this.nextFireShot = round + this.cooldown;
                this.fire();
            }

        }

        var that = this;
        this.missiles.children.iterate(function(missile) {
            var localtarget = missile.data.get('target');
            if(localtarget != null && !localtarget.active)
            {
                localtarget = that.sceneContext.selectBestTarget(missile.data.get('origin'), that.range, that.targetPriority);
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
        });

    }
    

};

weapons.Beam = class extends weapons.Weapon
{
    constructor(sceneContext, options)
    {
        super(sceneContext, options);

        this.origin = null; // needs to be set when weapon is mounted
        this.target = null;
        this.sceneContext = sceneContext;


        options = setDefaults(options, {
            range: 500,
            cooldown: 400,
            lifetime: 2000,
            velocity: 250, 
            damage: 0.2
        });

        if(typeof options.offset === 'undefined')
            options.offset = { x: 0, y: 0 };

        this.range = options.range;
        this.cooldown = options.cooldown;
        this.velocity = options.velocity;
        this.lifetime = options.lifetime;
        this.damage = options.damage;

        this.damageMods = setDefaults(options.damageMods, {
            S: 0.1,
            M: 0.5,
            L: 1,
            XL: 1
        });

        this.targetPriority = setDefault(options.targetPriority, ['L', 'XL', 'M', 'S']);

        this.offset = options.offset;
        this.nextFireShot = sceneContext.round;//@DISABLERANDOM Phaser.Math.Between(-3, 3)

        this.beams = sceneContext.physics.add.group();

        this.audio = {
            laserimpact: this.sceneContext.sound.add('laserimpact', { volume: 0.2}),
            laserfire: this.sceneContext.sound.add('laserfire', {volume: 0.6})
        };

        this.isFiring = false;



        // add the beamsuck particle emitter, but wait a little bit until the host is created
        this.sceneContext.time.addEvent({delay: 100, callback: function() {
            this.beamsuck = this.sceneContext.add.particles('shapes',  new Function('return ' + this.sceneContext.cache.text.get('beamsuck'))());
            this.beamsuck.emitters.first.on = false;
            this.beamsuck.setScale(0.3);

            this.muzzleglow = this.sceneContext.add.image(20, 20, 'redparticle');
            this.muzzleglow.setScale(0.8);
            this.muzzleglow.setAlpha(0);
            this.muzzleglow.depth = 20;

            emitter.on('update', this.update, this);
        }, callbackScope: this});

    }

    

    createMuzzleGlow(warmup, runtime, cooldown)
    {
        var warmuptween = this.sceneContext.tweens.timeline({
            targets: this.muzzleglow,

            tweens: [
            {
                duration: warmup,
                scaleX: 1,
                scaleY: 1,
                alpha: 1
            },

            ]
        });

        var looptween = null;
        var looptweenevent = this.sceneContext.time.addEvent({delay: warmup, callback: function() {

            looptween = this.sceneContext.tweens.timeline({
                targets: this.muzzleglow,
                loop: 50,

                tweens: [
                {
                    duration: 500,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    alpha: 1
                },
                {
                    duration: 1000,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    alpha: 0.9
                },
                {
                    duration: 500,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    alpha: 1
                },

                ]
            });


        }, callbackScope: this});

        this.sceneContext.time.addEvent({delay: warmup + runtime, callback: function() {
            this.destroymuzzleglows();
        }, callbackScope: this});

        var that = this;
        this.destroymuzzleglows = function()
        {
            warmuptween.stop();
            looptweenevent.remove();
            if(looptween != null)
                looptween.stop();

            that.sceneContext.tweens.timeline({
                targets: that.muzzleglow,
                tweens: [{
                    duration: cooldown,
                    scaleX: 0.1,
                    scaleY: 0.1,
                    alpha: 0
                }]
            });

        };
    }

    destroy()
    {
        emitter.removeListener('update', this.update, this);
        this.stopFire();
        this.beamsuck.destroy();
        if(typeof this.destroymuzzleglows === 'function')
            this.destroymuzzleglows();
        this.beams.children.iterate(function(beam){
            beam.destroy();
        });
        this.origin = null;
    }

    beginFire()
    {
        this.isFiring = true;
    }

    stopFire()
    {
        this.isFiring = false;

    }

    fire()
    {
        // fire up the emitter
        this.beamsuck.emitters.first.on = true;

        // fire up the muzzleglow
        this.muzzleglowanim = this.createMuzzleGlow(2000, this.lifetime + 500, 1000);

        // stop generating particles on muzzle glow 1 second later
        this.sceneContext.time.addEvent({delay: 1000, callback: function() {
            this.beamsuck.emitters.first.on = false;
        }, callbackScope: this});

        // start the firing sequence
        this.sceneContext.time.addEvent({delay: 2500, callback: function() {

            if(this.origin == null || this.target == null)
                return;

            var beam = this.beams.create(this.origin.body.x + this.offset.x, this.origin.body.y + this.offset.y + 1, 'purplebeam');

            beam.setDataEnabled();

            // snapshot the current target
            beam.data.set('target', this.target);
            beam.data.set('origin', this.origin);

            // anchor the beam in the middle of the closest point
            beam.setOrigin(0, 0.5);

            // calculate scale from origin to target, 1 beam pixel texture = 1 distance unit
            // also pick a random spot on the target
            
            beam.data.set('target-offset-x', rand.realInRange(this.target.body.width / -2, this.target.body.width / 2));
            beam.data.set('target-offset-y', rand.realInRange(this.target.body.height / -2, this.target.body.height / 2));
            //beam.data.set('target-offset-x', 0);
            //beam.data.set('target-offset-y', 0);

            var distance = Phaser.Math.Distance.Between(
            	beam.x, 
            	beam.y, 
            	this.target.x + beam.data.get('target-offset-x'), 
            	this.target.y + beam.data.get('target-offset-y'));
            beam.setScale(1, distance);

            var angle = Phaser.Math.Angle.Between(beam.x, beam.y, this.target.x + beam.data.get('target-offset-x'), this.target.y + beam.data.get('target-offset-y'))+ (Math.PI * 0.5);

            beam.setVelocity(this.origin.body.velocity.x, this.origin.body.velocity.y);        

            this.sceneContext.time.addEvent({ delay: this.lifetime, callback: function() {
                beam.destroy();
            }});

            this.audio.laserfire.play();

        }, callbackScope: this});
    }

    impact(beam, target, round)
    {
    	// only generate an explosion at 15 FPS
    	if(round % 4 == 0)
        	particles.fireballGenerator(
        		target.x + beam.data.get('target-offset-x'), 
        		target.y + beam.data.get('target-offset-y'), 
        		target.x + beam.data.get('target-offset-x') + target.body.velocity.x, 
        		target.y + beam.data.get('target-offset-y') + target.body.velocity.y);
        //missile.destroy();
        //this.audio.laserimpact.play();
        target.data.get('parent').damage(this.damage, this.damageMods);
    }

    update(round)
    {
        // check if attached
        if(this.origin == null)
        {
        	// if not attached, destroy all beams
        	 this.beams.children.iterate(function(beam) {
        	 	beam.destroy();
        	 });

            return;
        }

        // returns null if no targets are in range
        this.target = this.sceneContext.selectBestTarget(this, this.range, this.targetPriority);

        // update beam emitter
        if(typeof this.beamsuck !== 'undefined')
            this.beamsuck.setPosition(this.origin.body.x + this.offset.x, this.origin.body.y + this.offset.y, 100);

        // update muzzleglow
        if(typeof this.muzzleglow !== 'undefined')
            this.muzzleglow.setPosition(this.origin.body.x + this.offset.x, this.origin.body.y + this.offset.y, 200);

        if(this.target != null && !this.isFiring)
        {
            this.beginFire();
        }
        
        if(this.target == null && this.isFiring)
        {
            this.stopFire();
        }

        if(this.isFiring)
        {
            if(this.nextFireShot <= round)
            {
                this.nextFireShot = round + this.cooldown;
                this.fire();
            }

        }

        // Update beams
        var that = this;
        this.beams.children.iterate(function(beam) {
        	if(beam == null)
        		return;

            var localtarget = beam.data.get('target');

            // target was destroyed while evaluating
            if(localtarget != null && !localtarget.active)
            {
                beam.destroy();
                that.destroymuzzleglows();
                return;
            }

            // active beam
            if(beam != null && localtarget != null)
            {
            	// update beam facing
                var newangle = Phaser.Math.Angle.Between(beam.x, beam.y, localtarget.x + beam.data.get('target-offset-x'), localtarget.y + beam.data.get('target-offset-y'))+ (Math.PI * 0.5);
                beam.rotation = newangle;

                // update beam length
                var distance = Phaser.Math.Distance.Between(
		        	beam.x, 
		        	beam.y, 
		        	localtarget.x + beam.data.get('target-offset-x'), 
		        	localtarget.y + beam.data.get('target-offset-y'));

        		beam.setScale(1, distance);

        		// update beam speed (to keep it attached)
        		beam.setVelocity(that.origin.body.velocity.x, that.origin.body.velocity.y);

                // manually call impact, since we are point-to-point hitting the ship, not overlapping
                that.impact(beam, localtarget, round);
          
            }
        });


    }
};

