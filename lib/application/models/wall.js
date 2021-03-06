var uuid = require('uuid');

function Wall( data, queue ) {
  if ( !data.name || data.name === '' ) {
    throw new Error( 'Name is required' );
  }

  this.id = data.wall;
  this.name = data.name;

  this.views = [];
  this.cards = [];
  this.regions = {};

  this.constructor = Wall;
  this.queue = queue;

  this.queue.subscribe( 'wall.updated', Wall.prototype.updated.bind( this ) );

  this.queue.subscribe( 'view.created', Wall.prototype.addView.bind( this ) );
  this.queue.subscribe( 'card.created', Wall.prototype.addCard.bind( this ) );
  this.queue.subscribe( 'region.created', Wall.prototype.addRegion.bind( this ) );
}

Wall.constructor = function( data, queue ) {
  var create = {
    wall: uuid.v4(),
    name: data.name
  }

  var wall = new Wall( create, queue );

  queue.publish( 'wall.created', create );

  return wall;
};

Wall.eventsource = function( queue, events ) {
  var wall;

  events.forEach(function( event ) {
    if ( !wall ) {
      if ( event.topic === 'wall.created' ) {
        wall = new Wall( event.data, queue );

        return;
      }

      throw new Error( 'No created event found for resource' );
    }

    if ( event.topic !== 'wall.created' ) {
      switch( event.topic ) {
        case 'wall.updated':
          wall.updated( event.data );
          break;

        case 'view.added':
          wall.viewAdded( event.data );
          break;

        case 'card.added':
          wall.cardAdded( event.data );
          break;

        case 'region.added':
          wall.regionAdded( event.data );
          break;
      }

      return;
    }

    throw new Error( 'Created event encountered for resource that was already created' );
  });

  return wall;
};

Wall.prototype.getId = function() {
    return this.id;
};

Wall.prototype.getName = function() {
    return this.name;
};

Wall.prototype.update = function( data ) {
  if ( data.wall && data.wall !== this.getId() ) return;

  var update = {
    wall: this.getId(),
    name: data.name
  }

  var result = this.updated( update );

  if ( result ) {
    if ( result === true ) {
      this.queue.publish( 'wall.updated', update );

      return;
    }

    return result;
  }
};

Wall.prototype.updated = function( data ) {
  if ( data.wall !== this.getId() ) return;

  if ( this.getName() !== data.name ) {
    this.name = data.name;

    return true;
  }
};

Wall.prototype.getViews = function() {
    return this.views;
};

Wall.prototype.addView = function( data ) {
  if ( data.wall && data.wall !== this.getId() ) return;

  var add = {
    wall: this.getId(),
    view: data.view
  }

  var result = this.viewAdded( add );

  if ( result ) {
    if ( result === true ) {
      this.queue.publish( 'view.added', add );

      return;
    }

    return result;
  }
};

Wall.prototype.viewAdded = function( data ) {
  if ( data.wall !== this.getId() ) return;

  if ( !~this.views.indexOf( data.view ) ) {
    this.views.push( data.view );
    this.regions[ data.view ] = [];

    return true;
  }
};

Wall.prototype.getCards = function() {
    return this.cards;
};

Wall.prototype.addCard = function( data ) {
  if ( data.wall && data.wall !== this.getId() ) return;

  var add = {
    wall: this.getId(),
    card: data.card
  }

  var result = this.cardAdded( add );

  if ( result ) {
    if ( result === true ) {
      this.queue.publish( 'card.added', add );

      return;
    }

    return result;
  }
};

Wall.prototype.cardAdded = function( data ) {
  if ( data.wall !== this.getId() ) return;

  if ( !~this.cards.indexOf( data.card ) ) {
    this.cards.push( data.card );

    return true;
  }
};

Wall.prototype.getRegions = function( view ) {
  if ( !view ) throw new Error( 'A valid View ID is required' );

  if ( !~this.views.indexOf( view ) ) throw new Error( 'View ID Unknown to Wall ' + this.getId() );

  return this.regions[ view ] || [];
};

Wall.prototype.addRegion = function( data ) {
  if ( data.view && !~this.views.indexOf( data.view ) ) return;

  var add = {
    wall: this.getId(),
    view: data.view,
    region: data.region
  }

  var result = this.regionAdded( add );

  if ( result ) {
    if ( result === true ) {
      this.queue.publish( 'region.added', add );

      return;
    }

    return result;
  }
};

Wall.prototype.regionAdded = function( data ) {
  if ( data.wall !== this.getId() ) return;

  if ( data.view && ~this.views.indexOf( data.view ) ) {
    if ( data.region && !~this.regions[ data.view ].indexOf( data.region ) ) {
      this.regions[ data.view ].push( data.region );

      return true;
    }
  }
};

module.exports = Wall;
