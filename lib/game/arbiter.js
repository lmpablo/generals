var Piece = require('../game/piece');
var globals = require('../game/globals');
var cc = globals.captureCode;
var pieces = globals.pieces;
var Arbiter = function(){};

Arbiter.prototype.decideCapture = function(captor, captive) {
    if (typeof captor === 'undefined' || !(captor instanceof Piece)) throw TypeError("Captor is not a valid piece");
    if (typeof captive === 'undefined' || !(captive instanceof Piece)) throw TypeError("Captive is not a valid piece");

    // FIXME: Simplify this logic
    if (captor.pieceType === captive.pieceType) {
        if (captor.pieceType === pieces.FLAG) {
            return cc.CAPTOR_W_G;
        }
        return cc.DRAW
    } else if (captor.pieceType === pieces.SPY) {
        if (captive.pieceType === pieces.PRIVATE) {
            return cc.CAPTIVE_W;
        } else if (captive.pieceType === pieces.FLAG) {
            return cc.CAPTOR_W_G;
        } else {
            return cc.CAPTOR_W;
        }
    } else if (captor.pieceType === pieces.PRIVATE) {
        if (captive.pieceType === pieces.SPY) {
            return cc.CAPTOR_W;
        } else if (captive.pieceType === pieces.FLAG) {
            return cc.CAPTOR_W_G;
        } else {
            return cc.CAPTIVE_W;
        }
    } else {
        if (captor.pieceType < captive.pieceType) {
            if (captor.pieceType === pieces.FLAG) {
                return cc.CAPTIVE_W_G;
            }
            return cc.CAPTIVE_W;
        } else {
            if (captive.pieceType === pieces.FLAG) {
                return cc.CAPTOR_W_G;
            }
            return cc.CAPTOR_W;
        }
    }
};

module.exports = Arbiter;