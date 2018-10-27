var craft = {}

/** 
Craft templates 
**/
craft.Shipyard = class
{
    constructor(sceneContext, team, startY, options)
    {
        this.team = team;
        this.Y = startY;
        this.sceneContext = sceneContext;

        options = setDefaults(options, {
            scale: 1,
            velocity: 0,
            direction: 0,
            name: '',
            weapons: [],
            X: 1200, 
            health: 10000
        })

        if(this.team == "blue")
        {
            options.X = 100
        }
        if(this.team == "red")
        {
        }

        this.sprite = ships[this.team].create(options.X, this.Y, 'shipyard');
        //this.sprite.body.setCircle(72);
        this.sprite.body.setCircle(60);
        this.sprite.setScale(options.scale);
        this.sprite.name = options.name;
        this.sprite.setDataEnabled();

        this.sprite.data.set('parent', this);

        this.health = options.health;

        this.weapons = options.weapons;

        var that = this;
        this.weapons.forEach(function(weapon){
            weapon.origin = that.sprite
        })
    }

    static get Name() { return "Shipyard" }
    static get BuildTime() { return 10000 }

    damage(amount)
    {
        this.health -= amount;

        if(this.health <= 0)
        {
            this.destroy();
        }
    }

    destroy()
    {

        //@todo redo death animation
        this.weapons.forEach(function(weapon){
            weapon.destroy();
        })
        this.weapons = null;

        battle.cameras.main.pan(this.sprite.x, this.sprite.y, 2000)
        battle.cameras.main.zoomTo(3, 3000);

        //this.sprite.disableBody(true, true);

        // slice out the ship;
        ships[this.team].remove(this.sprite);

        this.emitters = [];

        this.sceneContext.time.addEvent({delay: 3000, callback: function() {

            this.emitters.push(particles.redburst.createEmitter({
                speed: 100,
                scale: { start: 0.3, end: 0 }, 
                x: this.sprite.x - 50,
                y: this.sprite.y + 40,
                blendMode: 'ADD',
                maxParticles: 50
            }));


            this.sceneContext.sound.add('smallshipexplode').play();

        }, callbackScope: this});

        this.sceneContext.time.addEvent({delay: 3500, callback: function() {

            this.emitters.push(particles.redburst.createEmitter({
                speed: 100,
                scale: { start: 0.3, end: 0 }, 
                x: this.sprite.x + 50,
                y: this.sprite.y - 40,
                blendMode: 'ADD',
                maxParticles: 50
            }));

            this.sceneContext.sound.add('smallshipexplode').play();

        }, callbackScope: this});

        this.sceneContext.time.addEvent({delay: 4000, callback: function() {

            this.emitters.push(particles.redburst.createEmitter({
                speed: 100,
                scale: { start: 0.3, end: 0 }, 
                x: this.sprite.x + 30,
                y: this.sprite.y + 20,
                blendMode: 'ADD',
                maxParticles: 50
            }));

            this.sceneContext.sound.add('smallshipexplode').play();

        }, callbackScope: this});


        this.sceneContext.time.addEvent({delay: 5000, callback: function() {

            var emitter = particles.redburst.createEmitter({
                speed: 100,
                scale: { start: 0.3, end: 0 }, 
                x: this.sprite.x,
                y: this.sprite.y,
                blendMode: 'ADD',
                maxParticles: 50
            });

            this.sceneContext.sound.add('smallshipexplode').play();
            emitter.explode(500, this.sprite.x, this.sprite.y);

            var that = this;
            this.emitters.forEach(function(e) {
                e.explode(500, e.x.propertyValue, e.y.propertyValue);
            })

            this.sprite.disableBody(true, true);


        }, callbackScope: this});

    }

}

var teammodifiers = {
    red: {
        direction: 0,
        X: 1350,
        velocityMod: -1
    },

    blue: {
        direction: Math.PI,
        X: 50,
        velocityMod: 1
    }
}

craft.Fighter = class
{
    constructor(sceneContext, team, startY, options)
    {
        this.team = team;
        this.Y = startY;
        this.sceneContext = sceneContext;

        options = setDefaults(options, {
            scale: 0.3,
            velocity: 50,
            direction: 0,
            name: '',
            weapons: [ 
                new weapons.Laser(sceneContext, { range: 400, cooldown: 200, lifetime: 1000 })
            ],
            X: 1200, 
            health: 30
        })

        // team specific modifiers
        options.direction = teammodifiers[this.team].direction;
        options.X = teammodifiers[this.team].X;
        options.velocity = options.velocity * teammodifiers[this.team].velocityMod;


        this.sprite = ships[this.team].create(options.X, this.Y, 'fighter');
        this.sprite.setScale(options.scale);
        this.sprite.rotation += options.direction;
        this.sprite.setVelocityX(options.velocity);
        this.sprite.name = options.name;
        this.sprite.setDataEnabled();

        this.sprite.data.set('parent', this);


        this.health = options.health;
        this.baseVelocity = options.velocity;
        this.weapons = options.weapons;

        var that = this;
        this.weapons.forEach(function(weapon){
            weapon.origin = that.sprite
        })

        emitter.on('update', this.update, this);
    }

    static get Name() { return "Fighter" }
    static get BuildTime() { return 1 }

    damage(amount)
    {
        this.health -= amount;

        if(this.health <= 0)
        {
            this.destroy();
        }
    }

    update(round)
    {
        // remove ships that wander out of bounds
        if(this.sprite.x < -50 || this.sprite.y < -50 || this.sprite.x > config.width + 50 || this.sprite.y > config.height + 50)
        {
            this.remove();
        }

    }

    remove()
    {
        if(this.weapons != null)
        {
            this.weapons.forEach(function(weapon){
                weapon.destroy();
            })
        }
        this.weapons = null;

        // slice out the ship;
        ships[this.team].remove(this.sprite);

        this.sprite.destroy();

        emitter.removeListener('update', this.update, this);
    }

    destroy()
    {
        this.remove();

        this.sceneContext.sound.add('smallshipexplode').play();

        var emitter = particles.redburst.createEmitter({
            speed: 100,
            scale: { start: 0.3, end: 0 }, 
            follow: this.sprite,
            maxParticles: 50
        });

        var that = this;
        this.sceneContext.time.addEvent({delay: 500, callback: function() {
            emitter.explode(100, that.sprite.x, that.sprite.y)
        }});

    }

}

craft.Corvette = class
{
    constructor(sceneContext, team, startY, options)
    {
        this.team = team;
        this.Y = startY;
        this.sceneContext = sceneContext;

        this.closestTarget = null;

        options = setDefaults(options, {
            scale: 0.3,
            velocity: 40,
            direction: 0,
            name: '',
            weapons: [ 
                new weapons.Beam(sceneContext),
                new weapons.Laser(sceneContext, { range: 300, cooldown: 200, lifetime: 1000, offset: {x: -40, y: 0} }),
                new weapons.Laser(sceneContext, { range: 300, cooldown: 200, lifetime: 1000, offset: {x: -10, y: 0} }),
                new weapons.Laser(sceneContext, { range: 300, cooldown: 200, lifetime: 1000, offset: {x: 20, y: 0} }),
                new weapons.Missile(sceneContext, {})
            ],
            X: 1200, 
            health: 500
        })

        // team specific modifiers
        options.direction = teammodifiers[this.team].direction;
        options.X = teammodifiers[this.team].X;
        options.velocity = options.velocity * teammodifiers[this.team].velocityMod;

        this.sprite = ships[this.team].create(options.X, this.Y, 'corvette');
        this.sprite.setScale(options.scale);
        this.sprite.rotation += options.direction;
        this.sprite.setVelocityX(options.velocity);

        this.sprite.name = options.name;
        this.sprite.setDataEnabled();

        this.sprite.data.set('parent', this);

        this.health = options.health;
        this.baseVelocity = options.velocity;
        this.weapons = options.weapons;

        var that = this;
        this.weapons.forEach(function(weapon){
            weapon.origin = that.sprite
        })

        emitter.on('update', this.update, this);

    }

    static get Name() { return "Corvette" }
    static get BuildTime() { return 5 }

    damage(amount)
    {
        this.health -= amount;

        if(this.health <= 0)
        {
            this.destroy();
        }
    }

    update(round)
    {
        // remove ships that wander out of bounds
        if(this.sprite.x < -50 || this.sprite.y < -50 || this.sprite.x > config.width + 50 || this.sprite.y > config.height + 50)
        {
            this.remove();
        }

        this.closestTarget = this.sceneContext.selectBestTarget(this.sprite, 500);

        this.sceneContext.applyAcceleration(this.sprite, this.closestTarget, this.baseVelocity / 3, this.baseVelocity, 0.2);

    }

    remove()
    {
        if(this.weapons != null)
        {
            this.weapons.forEach(function(weapon){
                weapon.destroy();
            })
        }
        this.weapons = null;

        // slice out the ship;
        ships[this.team].remove(this.sprite);

        this.sprite.destroy();

        emitter.removeListener('update', this.update, this);
    }

    destroy()
    {
        this.remove();

        this.sceneContext.sound.add('smallshipexplode').play();

        var emitter = particles.redburst.createEmitter({
            speed: 100,
            scale: { start: 0.3, end: 0 }, 
            follow: this.sprite,
            maxParticles: 50
        });

        var that = this;
        this.sceneContext.time.addEvent({delay: 500, callback: function() {
            emitter.explode(100, that.sprite.x, that.sprite.y)
        }});

    }

}