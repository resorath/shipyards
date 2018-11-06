var managerui = new Phaser.Scene('ManagerUI');

managerui.addBar = function(barContainer, x, y, maximum)
{
	if(barContainer.length > maximum - 1)
		return;

	var newx = x + 36 * barContainer.length + 5;

	var bar = this.add.image(newx, y, 'symbols', 'barsVertical');

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

managerui.changeWeapon = function(team, shipIndex, weaponIndex, weapon)
{
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

	this.shipname.text = config.name;
	this.shipdescription.text = config.description;

	if(this.sprite != null)
		this.sprite.destroy();


	this.sprite = this.physics.add.sprite(250, 300, config.sprite);

	this.sprite.setScale(config.scalesprite);

	for(var i = 0; i < config.shields; i++)
		this.addBar(this.shieldLevels, 760, 480, 10);

	for(i = 0; i < config.energy; i++)
		this.addBar(this.energyLevels, 760, 580, 10);

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
					spriteid: aw.icon
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
	this.add.bitmapText(800, 530, 'nokia', 'Energy', 24).setTintFill(0xffffff);

	// dynamic text
	this.shipname = this.add.bitmapText(220, 140, 'nokia', 'Fighter', 22).setTintFill(0xffffff);
	this.shipdescription = this.add.bitmapText(30, 500, 'nokia', 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\n', 16).setTintFill(0xffffff);


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
        x: 700,
        y: 480,
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
        x: 1150,
        y: 480,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.addBar(managerui.shieldLevels, 760, 480, 10);
        	if(managerui.shieldLevels.length < 10)
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
        x: 700,
        y: 580,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
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
        x: 1150,
        y: 580,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.addBar(managerui.energyLevels, 760, 580, 10);

        	if(managerui.energyLevels.length < 10)
				bayBuildConfig[managerui.currentTeam][managerui.currentShipIndex].energy++;
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

			// bind weapons to hardpoints
			for(var i = 0; i < config.weapons.length; i++)
			{
				if(config.weapons[i] != null)
				{
					// clone it, so its a unique copy of the weapon template
					config.weapons[i] = clone(config.weapons[i]);

					// assign hardpoints
					config.weapons[i].options.offset = config.weaponHardpoints[i];
				}
			}

			// load config into bay
			bays[managerui.currentTeam][bayid].available.push(config);
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

