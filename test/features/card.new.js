var chai = require('chai');
var should = chai.should();
var fixture = require('../fixtures/BasicWall');

var storedWall;

function features() {
  beforeEach(function( done ) {
    fixture( this, 'Wall for card' )
      .then(function( storage ) {
        storedWall = storage.wall;

        done();
      })
      .catch( done );
  });

  it('Emit a <pocket:new> event passing a valid board id to access an input control allowing you to enter details required to create a new Card\n', function(done) {
    var queue = this.queue;

    queue.subscribe( '#:fail', done ).once();
    queue.subscribe( '#.fail', done ).once();

    queue.when([
      'pocket:new',
      'pocketcreator:displayed'
    ],
    function( a, b ) {
      should.exist( a );
      a.should.equal( storedWall.getId() );

      b.should.be.instanceOf( queue.nodata );

      done();
    },
    done,
    { once: true });

    queue.trigger( 'pocket:new', storedWall.getId() );
  });
}

features.title = 'Accessing the card creator input control';

module.exports = features;
