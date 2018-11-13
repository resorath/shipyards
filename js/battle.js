var battle = new Phaser.Scene('Battle');

battle.preload = function()
{
    battleui.scene.start();
}



battle.create = function()
{
    ships.red = this.physics.add.group();
    ships.blue = this.physics.add.group();

    particles.redburst = this.add.particles('redparticle');


    particles.rt = this.make.renderTexture({x:0, y:0, width: 50, height: 40}).setOrigin(0,0);

    shipyards.red.shipyard = new craft.Shipyard(this, "red", 250);
    shipyards.blue.shipyard = new craft.Shipyard(this, "blue", 250);


}

battle.round = 0;
battle.update = function()
{  
    battle.round++;
    emitter.emit('update', battle.round);

    shipyards.red.shipyard.sprite.rotation += 0.001;
    shipyards.blue.shipyard.sprite.rotation -= 0.001;

    for(var team in bays)
    {
        for(var bay in bays[team])
        {
            var bayinfo = bays[team][bay];
            if(bayinfo.selected != null)
            {
                /*
                bayinfo.selected.BuildTime = the build time (bigger = slower)
                bayinfo.buildMultipler = the build time multiplyer penalty of the bay (bigger = slower)
                gamerules.buildTimeFactor = The global relationship between update speed and build times
                */

                var spawntime = bayinfo.buildMultiplyer * bayinfo.selected.craft.BuildTime * gamerules.buildTimeFactor;   
    
                if(battle.round % spawntime == 0)
                {
                    var weapons = [];

                    // create the weapons
                    bayinfo.selected.weapons.forEach( function(item) {
                        if(item == null)
                            return;

                        var options = clone(item.options);

                        weapons.push(new item.weapon(this, options));
                    }, this);

                    // spawn the ship
                    var ship = new bayinfo.selected.craft(
                        this, 
                        team, 
                        Phaser.Math.Between(bayinfo.xRange.min, bayinfo.xRange.max),
                        {
                            weapons
                        }
                    );

                    // invert weapon position if needed
                    if(teammodifiers[team].weaponInversionFlag)
                    {
                        if(ship.weapons != null)
                        {
                            var shipwidth = ship.sprite.body.width * ship.spriteScale;

                            ship.weapons.forEach(function(weapon){
                                weapon.offset.x = shipwidth - weapon.offset.x;
                            })
                        }
                    }



                }
            }

        }
    }
}


battle.getTeam = function(target)
{
    var result = null;
    for(var team in ships) 
    {
        if(typeof ships[team] !== 'undefined')
        {
            ships[team].children.iterate(function(ship){
                if(ship == target)
                {
                    result = team;
                    return;
                }

            })
        }
    };
    return result;

}

battle.getHostileTeams = function(target)
{
    var result = [];
    var friendlyteam = this.getTeam(target);

    for(var team in ships)
    {
        if(friendlyteam != team)
            result.push(team);
    }

    return result;
}

battle.selectBestTarget = function(origin, range)
{
    var hostileTeams = this.getHostileTeams(origin);

    var closestship_distance = range;
    var closestship_ship = null;

    hostileTeams.forEach(function(team) {
        ships[team].children.iterate(function(ship) {
            
            // pick best ship in range?
            // for now just pick closest ship in range
            var distance = Phaser.Math.Distance.Between(origin.x, origin.y, ship.x, ship.y);

            // check if distance is less than either 1) the range of the weapon or 2) the previous closest ship which must be closer than range
            if(distance < closestship_distance)
            {
                closestship_distance = distance;
                closestship_ship = ship;
            }

        })

    })

    return closestship_ship;
}



battle.applyAcceleration = function(sprite, triggerSprite, slowestSpeed, topSpeed, acceleration)
{
    // make sure bodies are still in play
    if(sprite != null && typeof sprite.body !== 'undefined')
    {
        // there is a target in range (not null)
        if(triggerSprite != null)
        {
            // slow down to half speed

            // Sprite is moving right
            if(sprite.body.velocity.x > 0)
            {
                if(sprite.body.velocity.x > slowestSpeed)
                    sprite.body.velocity.x -= acceleration;
            }
            // sprite is moving left
            if(sprite.body.velocity.x < 0)
            {
                if(sprite.body.velocity.x < slowestSpeed)
                    sprite.body.velocity.x += acceleration;
            }
        }
        else
        {
            // speed up to full speed

            // Sprite is moving right
            if(sprite.body.velocity.x > 0)
            {
                if(sprite.body.velocity.x < topSpeed)
                    sprite.body.velocity.x += acceleration;
            }
            // sprite is moving left
            if(sprite.body.velocity.x < 0)
            {
                if(sprite.body.velocity.x > topSpeed)
                    sprite.body.velocity.x -= acceleration;
            }
        }
    }

}