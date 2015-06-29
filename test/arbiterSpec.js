var mocha = require('mocha');
var expect = require('chai').expect;

var Arbiter = require('../lib/game/arbiter');
var Piece = require('../lib/game/piece');
var globals = require('../lib/game/globals');

var cc = globals.captureCode;
var pieces = globals.pieces;
var arbiter = new Arbiter();

describe("Arbiter", function(){
    it("should dispute captures", function(){
        expect(arbiter.decideCapture(new Piece(pieces.ARMY_GEN), new Piece(pieces.GEN))).to.equal(cc.CAPTOR_W);
        expect(arbiter.decideCapture(new Piece(pieces.COLONEL), new Piece(pieces.MAJOR_GEN))).to.equal(cc.CAPTIVE_W);
        expect(arbiter.decideCapture(new Piece(pieces.FIRST_LT), new Piece(pieces.SERGEANT))).to.equal(cc.CAPTOR_W);
        expect(arbiter.decideCapture(new Piece(pieces.ARMY_GEN), new Piece(pieces.PRIVATE))).to.equal(cc.CAPTOR_W);
    });

    it("should dispute equal pieces", function(){
        var armyGen = new Piece(pieces.ARMY_GEN);

        expect(arbiter.decideCapture(armyGen, armyGen)).to.equal(cc.DRAW);
    });

    it("should dispute SPY-PRIVATE captures", function(){
        var spy = new Piece(pieces.SPY);
        var priv = new Piece(pieces.PRIVATE);

        expect(arbiter.decideCapture(spy, priv)).to.equal(cc.CAPTIVE_W);
        expect(arbiter.decideCapture(priv, spy)).to.equal(cc.CAPTOR_W);
    });

    it("should dispute SPY-??? captures", function(){
        var spy = new Piece(pieces.SPY);

        expect(arbiter.decideCapture(spy, new Piece(pieces.ARMY_GEN))).to.equal(cc.CAPTOR_W);
        expect(arbiter.decideCapture(new Piece(pieces.MAJOR_GEN), spy)).to.equal(cc.CAPTIVE_W);
        expect(arbiter.decideCapture(spy, new Piece(pieces.CAPTAIN))).to.equal(cc.CAPTOR_W);
    });

    it("should dispute PRIVATE-??? captures", function(){
        var priv = new Piece(pieces.PRIVATE);

        expect(arbiter.decideCapture(priv, new Piece(pieces.ARMY_GEN))).to.equal(cc.CAPTIVE_W);
        expect(arbiter.decideCapture(priv, priv)).to.equal(cc.DRAW);
        expect(arbiter.decideCapture(new Piece(pieces.SERGEANT), priv)).to.equal(cc.CAPTOR_W);
    });

    it("should dispute FLAG captures", function(){
        var flag = new Piece(pieces.FLAG);

        expect(arbiter.decideCapture(new Piece(pieces.PRIVATE), flag)).to.equal(cc.CAPTOR_W_G);
        expect(arbiter.decideCapture(new Piece(pieces.SPY), flag)).to.equal(cc.CAPTOR_W_G);
        expect(arbiter.decideCapture(flag, flag)).to.equal(cc.CAPTOR_W_G);
        expect(arbiter.decideCapture(flag, new Piece(pieces.GEN))).to.equal(cc.CAPTIVE_W_G);
    });
});