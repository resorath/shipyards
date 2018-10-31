var craft = {}

/** 
Craft templates 
**/
craft.Ship = class
{
    constructor(sceneContext, team, startY, options)
    {
        this.team = team;
        this.Y = startY;
        this.sceneContext = sceneContext;

    }

    static get Name() { return "Generic Ship" }
    static get BuildTime() { return 10 }

    applyOptions(options)
    {
        // generic attributes
        this.health = options.health;
        this.baseVelocity = options.velocity;
        this.weapons = options.weapons;

        // team specific modifiers
        options.direction = teammodifiers[this.team].direction;
        options.X = teammodifiers[this.team].X;
        options.velocity = options.velocity * teammodifiers[this.team].velocityMod;

        // sprite options
        this.sprite.setScale(options.scale);
        this.sprite.name = options.name;
        this.sprite.x = options.X;
        this.sprite.y = this.Y

        this.sprite.rotation += options.direction;
        this.sprite.setVelocityX(options.velocity);

        this.sprite.setDataEnabled();
        this.sprite.data.set('parent', this);

        var that = this;
        this.weapons.forEach(function(weapon){
            weapon.origin = that.sprite
        })
        
    }


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

    }

    destroy()
    {

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



craft.Shipyard = class extends craft.Ship
{

    constructor(sceneContext, team, startY, options)
    {
        super(sceneContext, team, startY, options);


        options = setDefaults(options, {
            scale: 1,
            velocity: 0,
            direction: 0,
            name: '',
            weapons: [],
            X: 1200, 
            health: 10000
        })

        this.sprite = ships[this.team].create(0, 0, 'shipyard');

        super.applyOptions(options);

        //this.sprite = ships[this.team].create(options.X, this.Y, 'shipyard');
        //this.sprite.body.setCircle(72);
        this.sprite.body.setCircle(60);


    }

    static get Name() { return "Shipyard" }
    static get BuildTime() { return 10000 }

    destroy()
    {

        //@todo redo death animation
        if(this.weapons != null)
        {
            this.weapons.forEach(function(weapon){
                weapon.destroy();
            })
        }
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


craft.Fighter = class extends craft.Ship
{
    constructor(sceneContext, team, startY, options)
    {
        super(sceneContext, team, startY, options);

        options = setDefaults(options, {
            scale: 0.3,
            velocity: 50,
            direction: 0,
            name: '',
            weapons: [ 
                new weapons.Laser(sceneContext, { range: 400, cooldown: 15, lifetime: 1000 })
            ],
            X: 1200, 
            health: 30
        })

        this.sprite = ships[this.team].create(0, 0, 'fighter');

        super.applyOptions(options);

        emitter.on('update', this.update, this);
    }

    static get Name() { return "Fighter" }
    static get BuildTime() { return 1 }

    update(round)
    {
        super.update(round);

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

craft.Corvette = class extends craft.Ship
{
    constructor(sceneContext, team, startY, options)
    {
        super(sceneContext, team, startY, options);

        this.closestTarget = null;

        options = setDefaults(options, {
            scale: 0.3,
            velocity: 40,
            direction: 0,
            name: '',
            weapons: [ 
                new weapons.Beam(sceneContext),
                new weapons.Laser(sceneContext, { range: 300, cooldown: 15, lifetime: 1000, offset: {x: -40, y: 0} }),
                new weapons.Laser(sceneContext, { range: 300, cooldown: 15, lifetime: 1000, offset: {x: -10, y: 0} }),
                new weapons.Laser(sceneContext, { range: 300, cooldown: 15, lifetime: 1000, offset: {x: 20, y: 0} }),
                new weapons.Missile(sceneContext, {})
            ],
            X: 1200, 
            health: 500
        })

        this.sprite = ships[this.team].create(0, 0, 'corvette');

        super.applyOptions(options);

        emitter.on('update', this.update, this);

    }

    static get Name() { return "Corvette" }
    static get BuildTime() { return 5 }

    update(round)
    {
        super.update(round);

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