var Piece = require('../game/piece');
var globals = require('../game/globals');
var cc = globals.captureCode;
var pieces = globals.pieces;
var Arbiter = function(){};

Arbiter.prototype.decideCapture = function(captor, captive) {
    if (typeof captor === 'undefined' || !(captor instanceof Piece)) throw TypeError("Captor is not a valid piece");
    if (typeof captive === 'undefined' || !(captive instanceof Piece)) throw TypeError("Captive is not a valid piece");

    var isCaptorFlag = captor.pieceType === pieces.FLAG,
        isCaptiveFlag = captive.pieceType === pieces.FLAG;

    if (captor.pieceType === captive.pieceType) {
        if (isCaptorFlag) {
            return cc.CAPTOR_W_G;
        }
        return cc.DRAW;
    } else {
        if (isCaptorFlag) {
            return cc.CAPTIVE_W_G;
        } else if (isCaptiveFlag) {
            return cc.CAPTOR_W_G;
        } else if (captor.pieceType === pieces.SPY) {
            if (captive.pieceType === pieces.PRIVATE) {
                return cc.CAPTIVE_W;
            }
            return cc.CAPTOR_W;
        } else if (captor.pieceType === pieces.PRIVATE) {
            if (captive.pieceType === pieces.SPY) {
                return cc.CAPTOR_W;
            }
            return cc.CAPTIVE_W;
        } else {
            if (captor.pieceType < captive.pieceType) {
                return cc.CAPTIVE_W;
            }
            return cc.CAPTOR_W;
        }
    }
};

module.exports = Arbiter;