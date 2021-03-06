var uuid = require('uuid');

const addBoundSubcription = ( l, x ) => ( e, h ) => l.subscribe( e, h.bind( x ) );

const attachCardEvents = (card) => {
  var addQueueSubscription = addBoundSubcription( card.queue, card );

  addQueueSubscription( 'card.moved', Card.prototype.moved );
  addQueueSubscription( 'card.updated', Card.prototype.updated );
  addQueueSubscription( 'card.transformed', Card.prototype.transformed );
  addQueueSubscription( 'card.regionentered', Card.prototype.regionEntered );
  addQueueSubscription( 'card.regionexited', Card.prototype.regionExited );

  return card;
};

const initializeWithData = ( card, data ) => {
  card.id = data.card;
  card.wall = data.wall;

  if ( data.title ) {
    card.title = data.title;
  }

  card.width = data.width || 100;
  card.height = data.height || 65;
};

function Card( data, queue ) {
  if ( !data.wall || data.wall === '' ) {
    throw new Error( 'Wall is required' );
  }

  initializeWithData( this, data );

  this.locations = {};
  this.regions = [];
  this.metadata = {};

  this.constructor = Card;
  this.queue = queue;

  return attachCardEvents( this );
}

Card.constructor = function( data, queue ) {
  var create = {
    card: uuid.v4(),
    wall: data.wall
  };

  var card = new Card( create, queue );

  queue.publish( 'card.created', create );

  if ( data.title && data.title !== '' ) {
    var update = {
      card: card.getId(),
      title: data.title,
      content: data.content
    };

    card.update( update );
  }

  if ( data.view && typeof data.x === 'number' && typeof data.y === 'number' ) {
    var move = {
      card: card.getId(),
      view: data.view,
      x: data.x,
      y: data.y
    };

    card.move( move );
  }

  return card;
};

Card.eventsource = function( queue, events ) {
  var card;

  events.forEach(function( event ) {
    if ( !card ) {
      if ( event.topic === 'card.created' ) {
        card = new Card( event.data, queue );

        return;
      }

      throw new Error( 'No created event found for resource' );
    }

    if ( event.topic !== 'card.created' ) {
      switch ( event.topic ) {
        case 'card.updated':
          card.updated( event.data );
          break;
        case 'card.moved':
          card.moved( event.data );
          break;
        case 'card.transformed':
          card.transformed( event.data );
          break;
        case 'card.regionentered':
          card.regionEntered( event.data );
          break;
        case 'card.regionexited':
          card.regionExited( event.data );
          break;
      }

      return;
    }

    throw new Error( 'Created event encountered for resource that was already created' );
  });

  return card;
};

Card.prototype.getId = function() {
    return this.id;
};

Card.prototype.getTitle = function() {
    return this.title;
};

Card.prototype.getContent = function() {
    return this.content;
};

Card.prototype.update = function( data ) {
  if ( data.card && data.card !== this.getId() ) {
    return;
  }

  var update = {
    card: this.getId(),
    title: data.title,
    content: data.content
  };

  var errors = this.updated( update );

  if ( errors ) {
    return errors;
  }

  this.queue.publish( 'card.updated', update );
};

Card.prototype.updated = function( data ) {
  if ( data.card === this.getId() ) {
    this.title = data.title;
    this.content = data.content;
  }
};

Card.prototype.transform = function( data ) {
  if ( data.card && data.card !== this.getId() ) {
    return;
  }

  var patch = {
    card: this.getId(),
    view: data.view,
    op: data.op,
    property: data.property,
    value: data.value
  };

  var errors = this.transformed( patch );

  if ( errors ) {
    return errors;
  }

  this.queue.publish( 'card.transformed', patch );
};

Card.prototype.transformed = function( patch ) {
  if ( patch.card !== this.getId() ) {
    return;
  }
  var metadata = this.metadata[ patch.view ] = this.metadata[ patch.view ] || {};

  switch ( patch.op ) {
    case 'set':
      if ( metadata[ patch.property ] !== patch.value ) {
        metadata[ patch.property ] = patch.value;
      }
    break;

    case 'unset':
      if ( metadata[ patch.property ] === patch.value ) {
        delete metadata[ patch.property ];
      }
    break;
  }
};

Card.prototype.getCardnumber = function() {
    return this.cardnumber;
};

Card.prototype.getMetadata = function( viewid ) {
  if (!(viewid in this.metadata)) {
    return {};
  }

  return this.metadata[ viewid ] || {};
};

Card.prototype.getWall = function() {
    return this.wall;
};

Card.prototype.getRegions = function() {
    return this.regions;
};

Card.prototype.regionEntered = function( data ) {
  if ( data.card !== this.getId() ) {
    return;
  }

  if ( !~this.regions.indexOf( data.region ) ) {
    this.regions.push( data.region );

    return true;
  }
};

Card.prototype.regionExited = function( data ) {
  if ( data.card !== this.getId() ) {
    return;
  }

  var loc = this.regions.indexOf( data.region );

  if ( ~loc ) {
    this.regions.splice( loc, 1 );

    return true;
  }
};

Card.prototype.getPosition = function( view ) {
  var pos = this.locations[ view ];

  return {
    view: view,
    x: pos && pos.x || 0,
    y: pos && pos.y || 0
  };
};

Card.prototype.getSize = function() {
  return {
    width: this.width,
    height: this.height
  };
};

Card.prototype.getCentre = function( view ) {
  var pos = this.locations[ view ];
  var size = this.getSize();

  return {
    view: view,
    x: pos && (pos.x + (size.width / 2)) || 0,
    y: pos && (pos.y + (size.height / 2)) || 0
  };
};

Card.prototype.move = function( data ) {
  if ( data.card && data.card !== this.getId() ) {
    return;
  }

  var update = {
    card: this.getId(),
    view: data.view,
    x: data.x,
    y: data.y
  };

  var errors = this.moved( update );

  if ( errors ) {
    return errors;
  }

  this.queue.publish( 'card.moved', update );
};

Card.prototype.moved = function( data ) {
  if ( data.card !== this.getId() ) {
    return;
  }

  var pos = this.getPosition( data.view );

  if ( !pos || ( pos.x !== data.x || pos.y !== data.y ) ) {
    this.locations[ data.view ] = { x: data.x, y: data.y };
  }
};

module.exports = Card;
