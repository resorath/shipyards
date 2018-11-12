var battleui = new Phaser.Scene('BattleUI');

battleui.preload = function() 
{
    this.load.spritesheet('button', 'assets/flixel-button.png', { frameWidth: 80, frameHeight: 20 });
    this.load.bitmapFont('nokia', 'assets/nokia16black.png', 'https://labs.phaser.io/assets/fonts/bitmap/nokia16black.xml');
}

battleui.create = function() {

    var x = 100;
    for(var bay in bays[playercolour])
    {
        //bays[playercolour][bay].button = this.makeButton(bay, x, 650, this.topLevelClick);
        bays[playercolour][bay].button = new Button(this, {
            name: bay,
            x, 
            y: 650,
            clickCallback: this.topLevelClick
        })
        x += 160;
    }

}

battleui.activeSubMenu = [];

battleui.topLevelClick = function(button){
    battle.scene.pause();
    
    var x = button.x + 20;
    var y = 620;


    bays[playercolour][button.name].available.forEach(function(availablecraft) {
        var buttonset;
        if(availablecraft == null)
            buttonset = new Button(battleui, {
                name: "Empty",
                x, 
                y, 
                clickCallback: battleui.secondLevelClick});
        else
            buttonset = new Button(battleui, {
                name: availablecraft.craft.Name, 
                x, 
                y, 
                clickCallback: battleui.secondLevelClick});

        buttonset.availablecraft = availablecraft;
        buttonset.parent = button.name;
        
        battleui.activeSubMenu.push(buttonset);

        y -= 30;
    })

}

var last;
battleui.secondLevelClick = function(button)
{
    battle.scene.resume();

    var parentname = button.parent;
    var parent = bays[playercolour][parentname].button;
    var availablecraft = button.availablecraft;

    if(availablecraft == null)
        parent.text.setText("Empty");
    else
        parent.text.setText(availablecraft.craft.Name);

    bays[playercolour][parentname].selected = availablecraft;

    battleui.activeSubMenu.forEach(function(subelement) {
        subelement.destroy();  
    })

    battleui.activeSubMenu = [];

}