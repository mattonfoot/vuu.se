var chai = require('chai');
var should = chai.should();
var fixture = require('../fixtures/BasicWall.WithMultipleViews.FirstWithTwoRegions');

var wallid, card;

function features() {
  beforeEach(function( done ) {
    fixture( this, 'board for region editing' )
      .then(function( storage ) {
        region = storage.region;

        done();
      })
      .catch( done );
  });

  it('Updating the label property of an existing Region\n', function(done) {
    var queue = this.queue;
    var interface = this.interface;

    queue.subscribe( '#.fail', done ).once();

    var subscription = queue.subscribe( 'region.updated', function( updated ) {
      should.exist( updated );
      updated.should.have.property( 'region', update.region );
      updated.should.have.property( 'label', update.label );

      region.getLabel().should.equal( update.label );

      done();
    })
    .catch( done )
    .once();

    var update = {
      region: region.getId(),
      label: 'edited region label'
    };

    interface.updateRegion( update );
  });

  it('Updating the value property of an existing Region\n', function(done) {
    var queue = this.queue;
    var interface = this.interface;

    queue.subscribe( '#.fail', done ).once();

    var subscription = queue.subscribe( 'region.updated', function( updated ) {
      should.exist( updated );
      updated.should.have.property( 'region', update.region );
      updated.should.have.property( 'value',update.value );

      region.getValue().should.equal( update.value );

      done();
    })
    .catch( done )
    .once();

    var update = {
      region: region.getId(),
      value: 'edited region value'
    };

    interface.updateRegion( update );
  });

  it('Updating the color property of an existing Region\n', function(done) {
    var queue = this.queue;
    var interface = this.interface;

    queue.subscribe( '#.fail', done ).once();

    var subscription = queue.subscribe( 'region.updated', function( updated ) {
      should.exist( updated );
      updated.should.have.property( 'region', update.region );
      updated.should.have.property( 'color', update.color );

      region.getColor().should.equal( update.color );

      done();
    })
    .catch( done )
    .once();

    var update = {
      region: region.getId(),
      color: 'magenta'
    };

    interface.updateRegion( update );
  });

}

features.title = 'Updating Regions';

module.exports = features;
