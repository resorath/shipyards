var managerui = new Phaser.Class({


	Extends: Phaser.Scene,

    initialize:

	function managerui()
    {
    	Phaser.Scene.call(this, {key: 'ManagerUI'});
    },

	preload: function()
	{
 	},

	create: function()
	{
		this.linegraphics = this.add.graphics({ lineStyle: { width: 3, color: 0xffffff, alpha: 0.5 } });
		var boxgraphics = this.add.graphics({ fillStyle: { color: 0x000000 } });

		this.lines = [];

		this.add.bitmapText(400, 30, 'nokia', 'Build your fleet!', 32).setTintFill(0xffffff);

		this.shipname = this.add.bitmapText(220, 140, 'nokia', 'Fighter', 22).setTintFill(0xffffff);

		var rect = new Phaser.Geom.Rectangle(400, 190, 600, 220);
		var rect2 = new Phaser.Geom.Rectangle(0, 190, 100, 220);
		boxgraphics.fillRectShape(rect);
		boxgraphics.fillRectShape(rect2);

		this.round = 0;

		this.physics.add.sprite(250, 300, 'fighter');



		var shipselect_left = new Button(this, {
            name: "",
            x: 60,
            y: 300,
            scalex: 1,
            scaley: 1,
            spriteid: 'symbols',
            frameid: {
            	up: "arrowLeft",
            	down: "arrowLeft",
            	hover: "arrowLeft",
            }
        })

       	var shipselect_left = new Button(this, {
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
	},

	update: function()
	{
		this.round++; 

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
	}

});

