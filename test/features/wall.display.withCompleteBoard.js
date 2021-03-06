var chai = require('chai');
var should = chai.should();
var fixture = require('../fixtures/BasicWall.WithMultipleViews.FirstWithTwoRegions');

var wall, view, regions, cards;

function features() {
  beforeEach(function( done ) {
    var interface = this.interface;
    var ui = this.ui;

    fixture( this, 'display wall' )
      .then(function( storage ) {
        wall = storage.wall;
        views = storage.views;
        view = storage.view;
        regions = storage.regions;
        cards = storage.cards;

        ui.reset();

        done();
      })
      .catch( done );
  });

  it('Selecting a Wall for display will also display the first associated View of a Wall\n', function(done) {
    var queue = this.queue;
    var interface = this.interface;
    var ui = this.ui;

    queue.subscribe( '#.fail', done ).once();

    interface.displayWall( wall.getId() )
      .then(function() {
        ui.called.should.deep.equal( [ 'displayWall', 'displayViewSelector', 'displayView', 'enableControls', 'displayRegion', 'displayRegion', 'displayCard', 'displayCard' ] );
        ui.calledWith.should.deep.equal( [ wall, wall, view, view, regions[0], regions[1], cards[0], cards[1] ] );

        done();
      })
      .catch( done );
  });
}

features.title = 'Displaying a Wall with multiple Views containing Cards and Regions';

module.exports = features;
