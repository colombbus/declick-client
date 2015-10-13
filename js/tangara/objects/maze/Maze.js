define(['objects/platform/Platform', 'TUtils'], function( Platform, TUtils) {
    /**
     * Defines Maze, inherited from Platform.
     * Creates a platform with some basic tiles.
     * @exports Maze
     */
    var Maze = function() {
        Platform.call(this);
        this.addTile("brick.png", this.getResource("brick.png"));
        this.addTile("entrance.png", this.getResource("wall.png"));
        this.addTile("exit.png", this.getResource("entrance.png"));
        this.addTile("wall.png", this.getResource("exit.png"));
        this.setCollidableTile(Maze.ENTRANCE, false);
        this.setCollidableTile(Maze.EXIT, false);
        this._build();
    };

    Maze.prototype = Object.create(Platform.prototype);
    Maze.prototype.constructor = Maze;
    Maze.prototype.className = "Maze";
    Maze.GROUND = 0x01;
    Maze.WALL = 0x02;
    Maze.ENTRANCE = 0x03;
    Maze.EXIT = 0x04;

    /*
     * Put a ground at given location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildGround = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.GROUND);
    };
    

    /*
     * Build a entrance at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildEntrance = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.ENTRANCE);
        this.setEntranceLocation(x,y);
    };

    /*
     * Build an exit at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildExit = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.EXIT);
        this.setExitLocation(x,y);
    };
    
    /*
     * Build an wall at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildWall = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTile(x,y,Maze.WALL);
    };

    Maze.prototype._setRow = function(x, y, row) {
        for (var i=0; i<row.length; i++){
            if (row[i] === Maze.ENTRANCE) {
                this.setEntranceLocation(x+i,y);
            } else if (row[i] === Maze.EXIT) {
                this.setExitLocation(x+i,y);
            }
        }
        Platform.prototype._setRow.call(this,x,y,row);
    };
    
    return Maze;
});



