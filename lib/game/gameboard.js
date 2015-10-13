var globals = require('../game/globals');
var Piece = require('../game/piece');

var GameBoard = function(_sizeX, _sizeY) {
    this.sizeX = _sizeX || 9;
    this.sizeY = _sizeY || 8;

    this.board = [];
    this.clear();
};

GameBoard.prototype.clear = function() {
    for (var i = 0; i < this.sizeX; i++) {
        this.board[i] = [];
        for (var j = 0; j < this.sizeY; j++) {
            this.board[i][j] = null;
        }
    }
};

GameBoard.prototype.clearPos = function(loc_x, loc_y) {
    this.board[loc_x][loc_y] = null;
};

GameBoard.prototype.movePiece = function(piece, target_x, target_y){
    if (typeof piece === 'undefined' || !(piece instanceof Piece)) throw new TypeError("Piece is not valid");
    if (typeof target_x === 'undefined') throw new TypeError("Target location X is not valid");
    if (typeof target_y === 'undefined') throw new TypeError("Target location Y is not valid");

    this.board[piece.x_loc][piece.y_loc] = null;
    this.board[target_x][target_y] = piece._id;
    piece.x_loc = target_x;
    piece.y_loc = target_y;
};

module.exports = GameBoard;