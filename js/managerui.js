var managerui = new Phaser.Scene('ManagerUI');

managerui.constants = {

	shieldbar: { x: 760, y: 480 },
	energybar: { x: 760, y: 580 },
	maxshields: 10,
	maxenergy: 10,

}

managerui.addBar = function(barContainer, x, y, maximum)
{
	if(barContainer.length > maximum - 1)
		return;

	var newx = x + 36 * barContainer.length + 5;

	var bar = this.add.image(newx, y, 'symbols', 'stop');

	barContainer.push(bar);

}


managerui.removeBar = function(barContainer)
{
	if(barContainer.length == 0)
		return;

	var bar = barContainer.pop();
	bar.destroy();

}

managerui.removeBarAll = function(barContainer)
{
	var bar;
	var l = barContainer.length;
	for(var i = 0; i < l; i++)
	{
		bar = barContainer.pop();
		bar.destroy();
	}

}

managerui.getUsedEnergy = function(team, shipIndex)
{
	var weapons = bayBuildConfig[team][shipIndex].weapons;
	var totalenergy = 0;
	for(var i = 0; i < weapons.length; i++)
	{
		if(weapons[i] == null)
			continue;
		totalenergy += weapons[i].energy;
	}

	return totalenergy;
}

managerui.updateEnergyBar = function(team, shipIndex)
{
	var energybar = managerui.energyLevels.length;
	var usedenergy = this.getUsedEnergy(team, shipIndex);

	if(usedenergy > energybar)
	{
		console.warn("Energy exceeds maximum for ship");
		return false;
	}

	for(var i = 0; i < usedenergy; i++)
	{
		managerui.energyLevels[i].setTint(0x7ec0ee);
	}

	for(var i = usedenergy; i < energybar; i++)
	{
		managerui.energyLevels[i].setTint(0xffffff);
	}

	return true;
}

managerui.showWeaponDescription = function(weapon)
{
	this.weaponbox.text.text = weapon.name + "\n\nEnergy cost: " + weapon.energy + "\n\n" + weapon.description;

	this.weaponbox.graphics.setVisible(true);
	this.weaponbox.text.setVisible(true);
}

managerui.hideWeaponDescription = function()
{
	this.weaponbox.graphics.setVisible(false);
	this.weaponbox.text.setVisible(false);
}

managerui.changeWeapon = function(team, shipIndex, weaponIndex, weapon)
{
	var oldweapon = bayBuildConfig[team][shipIndex].weapons[weaponIndex];
	if(oldweapon == null)
		oldweapon = { energy: 0 };

	if(weapon != null && weapon.energy - oldweapon.energy + this.getUsedEnergy(team, shipIndex) > bayBuildConfig[team][shipIndex].energy)
	{
		this.energyText.setTintFill(0xff0000);

		var that = this;
		that.time.addEvent({ delay: 500, callback: function() {
            that.energyText.setTintFill(0xffffff);
        }});
		return;
	}

	bayBuildConfig[team][shipIndex].weapons[weaponIndex] = weapon;
	this.loadship(team, shipIndex);
}

managerui.preload = function()
{
}

managerui.loadship = function(team, index)
{
	var config = bayBuildConfig[team][index];

	// remove existing bars
	this.removeBarAll(this.shieldLevels);
	this.removeBarAll(this.energyLevels);

	// show name and description
	this.shipname.text = config.name;
	this.shipdescription.text = config.description;

	// show sprite
	if(this.sprite != null)
		this.sprite.destroy();

	this.sprite = this.physics.add.sprite(250, 300, config.sprite);

	this.sprite.setScale(config.scalesprite);

	// set shield and energy levels.
	for(var i = 0; i < config.shields; i++)
		this.addBar(
			this.shieldLevels, 
			this.constants.shieldbar.x, 
			this.constants.shieldbar.y, 
			this.constants.maxshields);

	for(i = 0; i < config.energy; i++)
				this.addBar(
			this.energyLevels, 
			this.constants.energybar.x, 
			this.constants.energybar.y, 
			this.constants.maxenergy);

	var x = 670;
	var y = 190;
	var weaponIndex = 0;

	// delete old sprites
	this.weaponSprites.forEach(function(b) {
		b.destroy();
	});
	this.weaponSprites = [];

	config.weapons.forEach(function(weapon)
	{

		// add null option
		b = new Button(this, {
			name: "",
			x,
			y,
			scalex: 1,
			scaley: 1,
	        spriteid: 'symbols',
	        frameid: {
	        	up: "cross",
	        	down: "cross",
	        	hover: "cross",
	        },
	        clickCallback: function() {
	        	managerui.changeWeapon(team, index, this.weaponIndex, null)
	        }
		})
		b.weaponIndex = weaponIndex;

		if(weapon == null)
			b.sprite.setTint(0xff0000);

		this.weaponSprites.push(b);

		x += 50;


		for(var availableweapon in weaponConfig)
		{
			var aw = weaponConfig[availableweapon];
			var b;

			// current active weapon
			if(aw == weapon)
			{
				b = new Button(this, {
					name: "",
					x,
					y,
					scalex: 0.08,
					scaley: 0.08,
					spriteid: aw.icon,
					hoverCallback: function() {
	        			managerui.showWeaponDescription(weapon);
	        		},
	        		leaveCallback: function() {
	        			managerui.hideWeaponDescription()
	        		}	
				})

				b.sprite.setTint(0x00ff00);

				this.weaponSprites.push(b);
			}

			// check if weapon is eligible
			else if(!aw.fits.includes(config.craft))
				continue;

			else
			{
				// show weapon as option
				b = new Button(this, {
					name: "",
					x,
					y,
					scalex: 0.08,
					scaley: 0.08,
					spriteid: aw.icon,
					clickCallback: function() {
	        			managerui.changeWeapon(team, index, this.weaponIndex, this.weapon)
	        		},
	        		hoverCallback: function() {
	        			managerui.showWeaponDescription(this.weapon);
	        		},
	        		leaveCallback: function() {
	        			managerui.hideWeaponDescription()
	        		}	
				})
				b.weaponIndex = weaponIndex;
				b.weapon = aw;

				this.weaponSprites.push(b);
			}

			x += 50;

		}

		x = 670;
		y += 50;
		weaponIndex++;

	}, this);

	this.updateEnergyBar(team, index);	


}

managerui.create = function()
{

	// visuals
	this.linegraphics = this.add.graphics({ lineStyle: { width: 3, color: 0xffffff, alpha: 0.5 } });
	var boxgraphics = this.add.graphics({ fillStyle: { color: 0x000000 } });

	this.lines = [];
	var rect = new Phaser.Geom.Rectangle(400, 190, 600, 220);
	var rect2 = new Phaser.Geom.Rectangle(0, 190, 100, 220);
	boxgraphics.fillRectShape(rect);
	boxgraphics.fillRectShape(rect2);

	// static text
	this.add.bitmapText(500, 30, 'nokia', 'Shipyard Manager', 32).setTintFill(0xffffff);
	this.add.bitmapText(800, 120, 'nokia', 'Weapons', 24).setTintFill(0xffffff);
	this.add.bitmapText(800, 430, 'nokia', 'Shields', 24).setTintFill(0xffffff);
	this.energyText = this.add.bitmapText(800, 530, 'nokia', 'Energy', 24).setTintFill(0xffffff);

	// dynamic text
	this.shipname = this.add.bitmapText(220, 140, 'nokia', 'Fighter', 22).setTintFill(0xffffff);
	this.shipdescription = this.add.bitmapText(30, 500, 'nokia', 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\n', 16).setTintFill(0xffffff);

	// weaponbox 
	this.weaponbox = {};
	this.weaponbox.graphics = this.add.graphics({ lineStyle: { width: 5, color: 0xffffff }, fillStyle: { color: 0x0000ff} });
	this.weaponbox.graphics.fillRect(10, 100, 600, 550);
	this.weaponbox.graphics.strokeRect(10, 100, 600, 550);
	this.weaponbox.graphics.depth = 100;
	this.weaponbox.graphics.setVisible(false);

	this.weaponbox.text = this.add.bitmapText(20, 110, 'nokia', 'Placeholder', 20).setTintFill(0xffffff);
	this.weaponbox.text.depth = 101;
	this.weaponbox.text.setVisible(false);

	this.round = 0;

	this.sprite = null;

	this.shieldLevels = [];
	this.energyLevels = [];
	this.weaponSprites = [];

	this.currentShipIndex = 0;
	this.currentTeam = "red"


	// buttons

	this.commitbutton = new Button(this, {
		name: "Commit",
		x: 1200, 
		y: 45, 
		clickCallback: function() {
			managerui.commit();
		}
	})

	this.shipselect_left = new Button(this, {
        name: "",
        x: 60,
        y: 300,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	if(managerui.currentShipIndex > 0)
        	{
        		managerui.currentShipIndex--;
        		managerui.loadship(managerui.currentTeam, managerui.currentShipIndex);
        	}
        },
        frameid: {
        	up: "arrowLeft",
        	down: "arrowLeft",
        	hover: "arrowLeft",
        }
    })

   	this.shipselect_right = new Button(this, {
        name: "",
        x: 435,
        y: 300,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {

        	if(bayBuildConfig[managerui.currentTeam].length - 1 > managerui.currentShipIndex)
        	{
        		managerui.currentShipIndex++;
        		managerui.loadship(managerui.currentTeam, managerui.currentShipIndex);

        	}
        },
        frameid: {
        	up: "arrowRight",
        	down: "arrowRight",
        	hover: "arrowRight",
        }
    })

    this.shields_decrease = new Button(this, {
        name: "",
        x: managerui.constants.shieldbar.x - 60,
        y: managerui.constants.shieldbar.y,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.removeBar(managerui.shieldLevels);

        	if(managerui.shieldLevels.length > 0)
				bayBuildConfig[managerui.currentTeam][managerui.currentShipIndex].shields--;
        },
        frameid: {
        	up: "minus",
        	down: "minus",
        	hover: "minus",
        }
    })

    this.shields_increase = new Button(this, {
        name: "",
        x: managerui.constants.shieldbar.x + 390,
        y: managerui.constants.shieldbar.y,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.addBar(managerui.shieldLevels, managerui.constants.shieldbar.x, managerui.constants.shieldbar.y, managerui.constants.maxshields);
        	if(managerui.shieldLevels.length < managerui.constants.maxshields)
				bayBuildConfig[managerui.currentTeam][managerui.currentShipIndex].shields++;
        },
        frameid: {
        	up: "plus",
        	down: "plus",
        	hover: "plus",
        }
    })

    this.energy_decrease = new Button(this, {
        name: "",
        x: managerui.constants.energybar.x - 60,
        y: managerui.constants.energybar.y,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {

        	if(managerui.getUsedEnergy(managerui.currentTeam, managerui.currentShipIndex) == bayBuildConfig[managerui.currentTeam][managerui.currentShipIndex].energy)
        		return;

        	managerui.removeBar(managerui.energyLevels);

        	if(managerui.energyLevels.length > 0)
				bayBuildConfig[managerui.currentTeam][managerui.currentShipIndex].energy--;
        },
        frameid: {
        	up: "minus",
        	down: "minus",
        	hover: "minus",
        }
    })

    this.energy_increase = new Button(this, {
        name: "",
        x: managerui.constants.energybar.x + 390,
        y: managerui.constants.energybar.y,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {

        	if(managerui.energyLevels.length < managerui.constants.maxenergy)
        	{
        		managerui.addBar(managerui.energyLevels, managerui.constants.energybar.x, managerui.constants.energybar.y, managerui.constants.maxenergy);
				bayBuildConfig[managerui.currentTeam][managerui.currentShipIndex].energy++;
			}
        },
        frameid: {
        	up: "plus",
        	down: "plus",
        	hover: "plus",
        }
    })


    this.loadship(this.currentTeam, this.currentShipIndex);



},

managerui.commit = function() {
	// load bayBuildConfig into bays:
	for(bayid in bays[managerui.currentTeam])
	{
		bays[managerui.currentTeam][bayid].available = [ null ];

		bayBuildConfig[managerui.currentTeam].forEach(function(config) {

			var configclone = clone(config);

			// bind weapons to hardpoints
			for(var i = 0; i < configclone.weapons.length; i++)
			{
				if(configclone.weapons[i] != null)
				{
					// assign hardpoints
					configclone.weapons[i].options.offset = configclone.weaponHardpoints[i];
				}
			}

			// load config into bay
			bays[managerui.currentTeam][bayid].available.push(configclone);
		})
		
	}		

	managerui.scene.sleep();
	battle.scene.start();
}

managerui.update = function()
{
	this.round++; 

	/* Line visuals */
	if(this.round % 10 == 0)
	{
		var y = Phaser.Math.Between(200, 400);
		var cline = new Phaser.Geom.Line(-120, y, 0, y);

		this.lines.push(cline);


		this.linegraphics.strokeLineShape(cline);
	}

	this.linegraphics.clear();

	for(var i = 0; i < this.lines.length; i++)
	{
		Phaser.Geom.Line.Offset(this.lines[i], 3, 0);

		if(this.lines[i].left > 800)
			this.lines.splice(i--, 1);
		else
			this.linegraphics.strokeLineShape(this.lines[i]);
	}
	/* ENDS Line visuals */
}

