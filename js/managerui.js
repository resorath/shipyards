class managerui extends Phaser.Scene 
{


	preload()
	{
		this.load.spritesheet('button', 'assets/flixel-button.png', { frameWidth: 80, frameHeight: 20 });
        this.load.bitmapFont('nokia', 'assets/nokia16black.png', 'https://labs.phaser.io/assets/fonts/bitmap/nokia16black.xml');

	}

	create()
	{
		this.linegraphics = this.add.graphics({ lineStyle: { width: 3, color: 0xffffff, alpha: 0.5 } });
		var boxgraphics = this.add.graphics({ fillStyle: { color: 0x000000 } });

		this.lines = [];

		this.add.bitmapText(400, 30, 'nokia', 'Build your fleet!', 32).setTintFill(0xffffff);

		var rect = new Phaser.Geom.Rectangle(600, 190, 400, 220);
		boxgraphics.fillRectShape(rect);

		this.round = 0;

		/*new Button(this, {
            name: "cats",
            x: 400,
            y: 400,
            scalex: 3,
            scaley: 5
        })*/
	}

	update()
	{
		this.round ++ 

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

};

