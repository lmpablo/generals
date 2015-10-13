var uuid = require('node-uuid');

var Piece = function(type, x_loc, y_loc) {
    this._id = uuid.v4();
    this.pieceType = type;
    this.x_loc = x_loc || -1;
    this.y_loc = y_loc || -1;
};

module.exports = Piece;