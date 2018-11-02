class Button
{
	static get BUTTON_DOWN() { return 2; }
	static get BUTTON_HOVER() { return 0; }
	static get BUTTON_UP() { return 1; }

	constructor(sceneContext, options)
	{
		setDefaults(options, {
			x: 0,
			y: 0,
			name: "untitled",
			sceneContext: 'undefined'
		})

		if(typeof options.leaveCallback === 'undefined')
			options.leaveCallback = function() {}

		if(typeof options.clickCallback === 'undefined')
			options.clickCallback = function() {}

		this.x = options.x;
		this.y = options.y;
		this.name = "Hello"

		this.clickCallback = options.clickCallback;
		this.leaveCallback = options.leaveCallback;

		this.sceneContext = sceneContext;
		
		this.sprite = sceneContext.add.image(this.x, this.y, 'button', Button.BUTTON_UP).setInteractive();

		this.sprite.setScale(2, 1.5);

		this.text = this.sceneContext.add.bitmapText(this.x - 40, this.y - 8, 'nokia', this.name, 16);
        this.text.x += (this.sprite.width - this.text.width) / 2;

        // events
        this.sceneContext.input.on('gameobjectover', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(Button.BUTTON_HOVER);
        }, this);
        this.sceneContext.input.on('gameobjectout', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(Button.BUTTON_UP);

            this.leaveCallback(this);

        }, this);
        this.sceneContext.input.on('gameobjectdown', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(Button.BUTTON_DOWN);
            
            this.clickCallback(this);

        }, this);
        this.sceneContext.input.on('gameobjectup', function (pointer, button)
        {
        	if(button != this.sprite)
        		return;

            this.setButtonFrame(Button.BUTTON_HOVER);
        }, this);

	}

	setButtonFrame(frame)
	{
		this.sprite.frame = this.sceneContext.textures.getFrame('button', frame);
	}

}