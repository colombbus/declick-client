define(['objects/platform/Platform', 'TUtils'], function( Platform, TUtils) {
    /**
     * Defines Maze, inherited from Platform.
     * Creates a platform with some basic tiles.
     * @exports Maze
     */
    var Maze = function() {
        Platform.call(this);
        this._build();
    };

    Maze.prototype = Object.create(Platform.prototype);
    Maze.prototype.constructor = Maze;
    Maze.prototype.className = "Maze";

    /**
     * Change the value of the tile [x,y] in structure to the value "number".
     * Checks if there is an Entrance or an Exit.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} number
     */
    Maze.prototype._setTileMaze = function(x, y, number) {
        this._setTile(x, y, number);
    };

    /*
     * Put a ground at given location
     * @param {Integer} x
     * @param {Integer} y
     */
    Maze.prototype._buildGround = function(x,y) {
        x = TUtils.getInteger(x);
        y = TUtils.getInteger(y);
        this._setTileMaze(x,y,Platform.GROUND);
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
        this._setTileMaze(x,y,Platform.ENTRANCE);
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
        this._setTileMaze(x,y,Platform.EXIT);
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
        this._setTileMaze(x,y,Platform.WALL);
    };

    Maze.prototype._setRow = function(x, y, row) {
        for (var i=0; i<row.length; i++){
            if (row[i] === Platform.ENTRANCE) {
                this.setEntranceLocation(x+i,y);
            } else if (row[i] === Platform.EXIT) {
                this.addExitLocation(x+i,y);
            }
        }
        Platform.prototype._setRow.call(this,x,y,row);
    };

    Maze.prototype._loadStructure = function(structure) {
        Platform.prototype._loadStructure.call(this, structure);
        for (var i=0; i<this.nbRows; i++) {
            for (var j=0; j<this.nbCols; j++) {
                if (this.rows[i][j] === Platform.ENTRANCE) {
                    this.setEntranceLocation(j,i);
                } else if (this.rows[i][j] === Platform.EXIT) {
                    this.addExitLocation(j,i);
                }
            }
        }
    };

    return Maze;
});



