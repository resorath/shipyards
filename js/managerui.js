var managerui = new Phaser.Scene('ManagerUI');

managerui.addBar = function(barContainer, x, y, maximum)
{
	if(barContainer.length > maximum - 1)
		return;

	var newx = x + 36 * barContainer.length + 5;

	var bar = this.add.image(newx, y, 'symbols', 'barsVertical');

	barContainer.push(bar);

},


managerui.removeBar = function(barContainer)
{
	if(barContainer.length == 0)
		return;

	var bar = barContainer.pop();
	bar.destroy();

},

managerui.preload = function()
{
},

managerui.loadship = function(team, index)
{
	var config = bayBuildConfig[team][index];


	this.shipname.text = config.name;
	this.shipdescription.text = config.description;

	for(var i = 0; i < config.shields; i++)
		this.addBar(this.shieldLevels, 660, 450, 8);

	for(i = 0; i < config.energy; i++)
		this.addBar(this.energyLevels, 660, 550, 8);

	config.weapons.forEach(function(weapon)
	{
		for(var availableweapon in weaponConfig)
		{
			var aw = weaponConfig[availableweapon];

			// current active weapon
			if(aw == weapon)
			{
				console.log("active found")
			}

			// check if weapon is eligible
			if(aw.fits.includes(config.craft))
				continue;

			// show weapon as option
			console.log("non-active found")

		}

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
	this.add.bitmapText(400, 30, 'nokia', 'Shipyard Manager', 32).setTintFill(0xffffff);
	this.add.bitmapText(700, 120, 'nokia', 'Weapons', 24).setTintFill(0xffffff);
	this.add.bitmapText(700, 400, 'nokia', 'Shields', 24).setTintFill(0xffffff);
	this.add.bitmapText(700, 500, 'nokia', 'Energy', 24).setTintFill(0xffffff);

	// dynamic text
	this.shipname = this.add.bitmapText(220, 140, 'nokia', 'Fighter', 22).setTintFill(0xffffff);
	this.shipdescription = this.add.bitmapText(30, 500, 'nokia', 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\nLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum\n', 16).setTintFill(0xffffff);


	this.round = 0;

	this.physics.add.sprite(250, 300, 'fighter');

	this.shieldLevels = []
	this.energyLevels = []




	// buttons
	this.shipselect_left = new Button(this, {
        name: "",
        x: 60,
        y: 300,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	console.log("yo yo left");
        },
        frameid: {
        	up: "arrowLeft",
        	down: "arrowLeft",
        	hover: "arrowLeft",
        }
    })

   	this.shipselect_left = new Button(this, {
        name: "",
        x: 435,
        y: 300,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        frameid: {
        	up: "arrowRight",
        	down: "arrowRight",
        	hover: "arrowRight",
        }
    })

    this.shields_decrease = new Button(this, {
        name: "",
        x: 600,
        y: 450,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.removeBar(managerui.shieldLevels);
        },
        frameid: {
        	up: "minus",
        	down: "minus",
        	hover: "minus",
        }
    })

    this.shields_increase = new Button(this, {
        name: "",
        x: 980,
        y: 450,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.addBar(managerui.shieldLevels, 660, 450, 8);
        },
        frameid: {
        	up: "plus",
        	down: "plus",
        	hover: "plus",
        }
    })

    this.energy_decrease = new Button(this, {
        name: "",
        x: 600,
        y: 550,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.removeBar(managerui.energyLevels);
        },
        frameid: {
        	up: "minus",
        	down: "minus",
        	hover: "minus",
        }
    })

    this.energy_increase = new Button(this, {
        name: "",
        x: 980,
        y: 550,
        scalex: 1,
        scaley: 1,
        spriteid: 'symbols',
        clickCallback: function() {
        	managerui.addBar(managerui.energyLevels, 660, 550, 8);
        },
        frameid: {
        	up: "plus",
        	down: "plus",
        	hover: "plus",
        }
    })
},


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

