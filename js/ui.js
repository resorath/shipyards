class Button
{
	constructor(sceneContext, options)
	{
		options = setDefaults(options, {
			x: 0,
			y: 0,
			scalex: 2,
			scaley: 1.5,
			name: "untitled",
			sceneContext: 'undefined',
			spriteid: 'button',
			frameid: {
				up: 1,
				down: 2,
				hover: 0
			}
		})

		if(typeof options.leaveCallback === 'undefined')
			options.leaveCallback = function() {}

		if(typeof options.clickCallback === 'undefined')
			options.clickCallback = function() {}

		if(typeof options.hoverCallback === 'undefined')
			options.hoverCallback = function() {}

		this.x = options.x;
		this.y = options.y;
		this.scalex = options.scalex;
		this.scaley = options.scaley;
		this.name = options.name;
		this.spriteid = options.spriteid;
		this.frameid = options.frameid;

		this.clickCallback = options.clickCallback;
		this.leaveCallback = options.leaveCallback;
		this.hoverCallback = options.hoverCallback;

		this.sceneContext = sceneContext;
		
		this.sprite = sceneContext.add.sprite(this.x, this.y, this.spriteid, this.frameid.up).setInteractive( { useHandCursor: true });
		this.sprite.setScale(this.scalex, this.scaley);

		this.text = this.sceneContext.add.bitmapText(this.x - 40, this.y - 8, 'nokia', this.name, 16);
        this.text.x += (this.sprite.width - this.text.width) / 2;

        // events
        this.sceneContext.input.on('gameobjectover', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(this.frameid.hover);

            this.hoverCallback(this);

        }, this);
        this.sceneContext.input.on('gameobjectout', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(this.frameid.up);

            this.leaveCallback(this);

        }, this);
        this.sceneContext.input.on('gameobjectdown', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(this.frameid.down);
            
            this.clickCallback(this);

        }, this);
        this.sceneContext.input.on('gameobjectup', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(this.frameid.hover);
        }, this);

	}

	setButtonFrame(frame)
	{
		this.sprite.frame = this.sceneContext.textures.getFrame(this.spriteid, frame);
	}

	destroy()
	{
		this.text.destroy();
		this.sprite.destroy();

	}

}