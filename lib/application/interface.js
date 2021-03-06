const addBoundListener = ( l, x ) => ( e, h ) => l.addListener( e, h.bind( x ) );
const addBoundSubcription = ( l, x ) => ( e, h ) => l.subscribe( e, h.bind( x ) );

const attachInterfaceEvents = (iface)  => {
  if ( !iface.ui ) {
    return;
  }

  var addUIListener = addBoundListener( iface.ui, iface );
  var addQueueSubscription = addBoundSubcription( iface.queue, iface );

  addUIListener( 'wall.select',     Interface.prototype.displayWallSelector );
  addUIListener( 'wall.create',     Interface.prototype.createWall );
  addUIListener( 'wall.display',    Interface.prototype.displayWall );
  addUIListener( 'wall.edit',       Interface.prototype.editWall );
  addUIListener( 'wall.update',     Interface.prototype.updateWall );

  addUIListener( 'view.new',        Interface.prototype.newView );
  addUIListener( 'view.create',     Interface.prototype.createView );
  addUIListener( 'view.display',    Interface.prototype.displayView );
  addUIListener( 'view.edit',       Interface.prototype.editView );
  addUIListener( 'view.update',     Interface.prototype.updateView );
  addQueueSubscription( 'view.added',   Interface.prototype.postCreateView );

  addUIListener( 'region.new',      Interface.prototype.newRegion );
  addUIListener( 'region.create',   Interface.prototype.createRegion );
  addUIListener( 'region.display',  Interface.prototype.displayRegion );
  addUIListener( 'region.edit',     Interface.prototype.editRegion );
  addUIListener( 'region.update',   Interface.prototype.updateRegion );
  addQueueSubscription( 'region.added', Interface.prototype.postCreateRegion );

  addUIListener( 'card.new',          Interface.prototype.newCard );
  addUIListener( 'card.create',       Interface.prototype.createCard );
  addUIListener( 'card.display',      Interface.prototype.displayCard );
  addUIListener( 'card.edit',         Interface.prototype.editCard );
  addUIListener( 'card.update',       Interface.prototype.updateCard );
  addQueueSubscription( 'card.added',   Interface.prototype.postCreateCard );

  addUIListener( 'transform.new',     Interface.prototype.newTransform );
  addUIListener( 'transform.create',  Interface.prototype.createTransform );
  addUIListener( 'transform.edit',    Interface.prototype.editTransform );
  addUIListener( 'transform.update',  Interface.prototype.updateTransform );

  addUIListener( 'login.auth',        Interface.prototype.authLogin );
};

function Interface( queue, repository, ui ) {
  this.queue = queue;
  this.repository = repository;
  this.ui = ui;

  attachInterfaceEvents( this );
}

Interface.prototype.newWall = function newWall() {
  var ui = this.ui;

  return new Promise(function( resolve ) {
    if ( ui ) {
      ui.displayWallCreator();
    }

    resolve();
  })
  .catch(function( error ) {
    queue.publish( 'wall.new.fail', error );
  });
};

Interface.prototype.createWall = function createWall( data ) {
  var interface = this;
  var repository = this.repository;

  var queue = this.queue;

  return repository.createWall( data )
    .catch(function( error ) {
      queue.publish( 'wall.create.fail', error );
    })
    .then(function( wall ) {
      return interface.displayWall( wall.getId() );
    });
};

Interface.prototype.displayWallSelector = function displayWallSelector() {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getAllWalls()
    .then(function( walls ) {
      if ( ui ) {
        ui.displayWallSelector( walls );
      }

      return walls;
    })
    .catch(function( error ) {
      queue.publish( 'wallselector.display.fail', error );
    });
};

Interface.prototype.displayWall = function displayWall( wallid ) {
  var interface = this;
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  var wall;
  return repository.getWall( wallid )
    .then(function( resource ) {
      wall = resource;

      interface._wall = wall;
      interface._regions = [];
      interface._cards = [];

      delete interface._view;

      if ( ui ) {
        ui.displayWall( wall );

        return interface.displayViewSelector( wall.getId() );
      }
    })
    .then(function() {
      return repository.getViews( wall.getViews() );
    })
    .then(function( views ) {
      if ( !views.length ) {
        return interface.newView( wallid );
      }

      return interface.displayView( views[ 0 ].getId() );
    })
    .then(function() {
      return wall;
    })
    .catch(function( error ) {
      queue.publish( 'wall.display.fail', error );
    });
};

Interface.prototype.editWall = function editWall( wallid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getWall( wallid )
    .then(function( wall ) {
      if ( ui ) {
        ui.displayWallEditor( wall );
      }

      return wall;
    })
    .catch(function( error ) {
      queue.publish( 'wall.edit.fail', error );
    });
};

Interface.prototype.updateWall = function updateWall( data ) {
  var repository = this.repository;
  var queue = this.queue;

  return repository.getWall( data.wall )
    .then(function( resource ) {
      resource.update( data );

      return resource;
    })
    .catch(function( error ) {
      queue.publish( 'wall.update.fail', error );
    });
};

Interface.prototype.newView = function newView( wallid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getWall( wallid )
    .then(function( wall ) {
      if ( ui ) {
        ui.displayViewCreator( wall );
      }

      return wall;
    })
    .catch(function( error ) {
      queue.publish( 'view.new.fail', error );
    });
};

Interface.prototype.createView = function createView( data ) {
  var interface = this;
  var repository = this.repository;
  var queue = this.queue;

  var view;
  return repository.createView( data )
    .then(function( resource ) {
      view = resource;

      return interface.displayView( view.getId() );
    })
    .then(function() {
      return view;
    })
    .catch(function( error ) {
      queue.publish( 'view.create.fail', error );
    });
};

Interface.prototype.postCreateView = function postCreateView( data ) {
  var interface = this;
  var repository = this.repository;
  var queue = this.queue;

  var view;
  return repository.getView( data.view )
    .then(function( resource ) {
      view = resource;

      return interface.addView( view.getId() );
    })
    .then(function() {
      return view;
    })
    .catch(function( error ) {
      queue.publish( 'view.clone.fail', error );
    });
};

Interface.prototype.displayViewSelector = function displayViewSelector( wallid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  var wall;
  return repository.getWall( wallid )
    .then(function( resource ) {
      wall = resource;

      return repository.getViews( wall.getViews() );
    })
    .then(function( views ) {
      if ( ui ) {
        ui.displayViewSelector( wall, views );
      }

      return wall;
    })
    .catch(function( error ) {
      queue.publish( 'viewselector.display.fail', error );
    });
};

Interface.prototype.addView = function addView( viewid ) {
  var iface = this;
  var repository = this.repository;
  var ui = this.ui;

  return repository.getView( viewid )
    .then(function( view ) {
      if ( ui && iface._wall && iface._wall.getId() === view.getWall() ) {
        ui.updateViewSelector( view );
      }

      return view;
    })
    .catch(function( error ) {
      queue.publish( 'view.add.fail', error );
    });
};

Interface.prototype.displayView = function displayView( viewid ) {
  var iface = this;
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  var view;
  return repository.getView( viewid )
    .then(function( resource ) {
      view = resource;

      if ( !iface._wall || view.getWall() !== iface._wall.getId() ) {
        return;
      }

      iface._regions = [];
      iface._cards = [];

      iface._view = view;

      if ( ui) {
        ui.displayView( view );

        ui.enableControls( view );

        var promises = [];
        promises.push( iface.displayRegions( view ) );
        promises.push( iface.displayCards( view ) );

        return Promise.all( promises );
      }
    })
    .then(function() {
      return view;
    })
    .catch(function( error ) {
      queue.publish( 'view.display.fail', error );
    });
};

Interface.prototype.editView = function editView( viewid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  var view;
  return repository.getView( viewid )
    .then(function( resource ) {
      view = resource;

      return repository.getTransforms( view.getTransforms() );
    })
    .then(function( transforms ) {
      if ( ui ) {
        ui.displayViewEditor( view, transforms );
      }

      return view;
    })
    .catch(function( error ) {
      queue.publish( 'view.edit.fail', error );
    });
};

Interface.prototype.updateView = function updateView( data ) {
  var iface = this;
  var repository = this.repository;
  var queue = this.queue;

  return repository.getView( data.view )
    .then(function( resource ) {
      resource.update( data );

      return resource;
    })
    .then(function( view ) {
      return iface.displayViewSelector( view.getWall() );
    })
    .catch(function( error ) {
      queue.publish( 'view.update.fail', error );
    });
};

Interface.prototype.newCard = function newCard( wallid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getWall( wallid )
    .then(function( wall ) {
      if ( ui ) {
        ui.displayCardCreator( wall );
      }

      return wall;
    })
    .catch(function( error ) {
      queue.publish( 'card.new.fail', error );
    });
};

Interface.prototype.createCard = function createCard( data ) {
  var repository = this.repository;
  var queue = this.queue;

  return repository.createCard( data )
    .catch(function( error ) {
      queue.publish( 'card.create.fail', error );
    });
};

Interface.prototype.postCreateCard = function postCreateCard( data ) {
  var iface = this;
  var repository = this.repository;
  var queue = this.queue;

  var card;
  return repository.getCard( data.card )
    .then(function( resource ) {
      card = resource;

      return iface.displayCard( card.getId() );
    })
    .then(function() {
      return card;
    })
    .catch(function( error ) {
      queue.publish( 'card.create.fail', error );
    });
};

Interface.prototype.displayCards = function displayCards( view ) {
  var iface = this;
  var repository = this.repository;

  var queue = this.queue;

  return repository.getWall( view.getWall() )
    .then(function( wall ) {
      var ids = wall.getCards();

      var promises = ids.map(function( id ) {
        return iface.displayCard( id );
      });

      return Promise.all( promises );
    })
    .catch(function( error ) {
      queue.publish( 'cards.display.fail', error );
    });
};

Interface.prototype.displayCard = function displayCard( cardid ) {
  var iface = this;
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getCard( cardid )
    .then(function( card ) {

      if ( !iface._view || card.getWall() !== iface._wall.getId() || ~iface._cards.indexOf( card.getId() )) {
        return false;
      }

      iface._cards.push( card.getId() );

      if ( ui ) {
        ui.displayCard( iface._view, card );
      }

      return card;
    })
    .catch(function( error ) {
      queue.publish( 'card.display.fail', error );
    });
};

Interface.prototype.editCard = function editCard( cardid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getCard( cardid )
    .then(function( card ) {
      if ( ui ) {
        ui.displayCardEditor( card );
      }

      return card;
    })
    .catch(function( error ) {
      queue.publish( 'card.edit.fail', error );
    });
};

Interface.prototype.updateCard = function updateCard( data ) {
  var repository = this.repository;
  var queue = this.queue;

  return repository.getCard( data.card )
    .then(function( card ) {
      card.update( data );

      return card;
    })
    .catch(function( error ) {
      queue.publish( 'card.update.fail', error );
    });
};

Interface.prototype.newTransform = function newTransform( viewid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  var view;
  return repository.getView( viewid )
    .then(function( resource ){
      view = resource;

      return repository.getWall( view.getWall() );
    })
    .then(function( wall ) {
      return repository.getViews( wall.getViews() );
    })
    .then(function( views ) {
      if ( ui ) {
        ui.displayTransformCreator( view, views );
      }

      return view;
    })
    .catch(function( error ) {
      queue.publish( 'transform.new.fail', error );
    });
};

Interface.prototype.createTransform = function createTransform( form ) {
  var repository = this.repository;
  var queue = this.queue;

  var data = {
    view: form.view
  };

  data.phrase = [ 'get ', form.rules_attr,
                  ' from ', form.rules_from_attr, ' of ', form.rules_from_node, ' on view #', form.rules_from_selector,
                  ' when ', form.rules_when_relationship, ' ', form.rules_when_node ].join( '' );

  return repository.createTransform( data )
    .catch(function( error ) {
      queue.publish( 'transform.create.fail', error );
    });
};

Interface.prototype.editTransform = function editTransform( transformid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getTransform( transformid )
    .then(function( transform ) {
      if ( ui ) {
        ui.displayTransfromEditor( transform );
      }

      return transform;
    })
    .catch(function( error ) {
      queue.publish( 'transform.edit.fail', error );
    });
};

Interface.prototype.updateTransform = function updateTransform( data ) {
  var repository = this.repository;
  var queue = this.queue;

  return repository.getTransform( data.transform )
    .then(function( transform ) {
      transform.update( data );

      return transform;
    })
    .catch(function( error ) {
      queue.publish( 'transform.update.fail', error );
    });
};

Interface.prototype.newRegion = function newRegion( viewid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getView( viewid )
    .then(function( view ) {
      if ( ui ) {
        ui.displayRegionCreator( view );
      }

      return view;
    })
    .catch(function( error ) {
      queue.publish( 'region.new.fail', error );
    });
};

Interface.prototype.createRegion = function createRegion( data ) {
  var repository = this.repository;
  var queue = this.queue;

  return repository.createRegion( data )
    .catch(function( error ) {
      queue.publish( 'region.create.fail', error );
    });
};

Interface.prototype.postCreateRegion = function postCreateRegion( data ) {
  var iface = this;
  var repository = this.repository;
  var queue = this.queue;

  var region;
  return repository.getRegion( data.region )
    .then(function( resource ) {
      region = resource;

      return iface.displayRegion( region.getId() );
    })
    .then(function() {
      return region;
    })
    .catch(function( error ) {
      queue.publish( 'region.create.fail', error );
    });
};

Interface.prototype.displayRegions = function displayRegions( view ) {
  var iface = this;
  var repository = this.repository;

  var queue = this.queue;

  return repository.getWall( view.getWall() )
    .then(function( wall ) {
      var ids = wall.getRegions( view.getId() );

      var promises = ids.map(function( id ) {
        return iface.displayRegion( id );
      });

      return Promise.all( promises );
    })
    .catch(function( error ) {
      queue.publish( 'regions.display.fail', error );
    });
};

Interface.prototype.displayRegion = function displayRegion( regionid ) {
  var iface = this;
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getRegion( regionid )
    .then(function( region ) {
      if ( !iface._view || region.getView() !== iface._view.getId() || ~iface._regions.indexOf( region.getId() )) {
        return;
      }

      iface._regions.push( region.getId() );

      if ( ui && ui.displayRegion( region ) ) {
        queue.publish( 'region.displayed', region );
      }

      return region;
    })
    .catch(function( error ) {
      queue.publish( 'region.display.fail', error );
    });
};

Interface.prototype.editRegion = function editRegion( regionid ) {
  var repository = this.repository;
  var ui = this.ui;

  var queue = this.queue;

  return repository.getRegion( regionid )
    .then(function( region ) {
      if ( ui ) {
        ui.displayRegionEditor( region );
      }

      return region;
    })
    .catch(function( error ) {
      queue.publish( 'region.edit.fail', error );
    });
};

Interface.prototype.updateRegion = function updateRegion( data ) {
  var repository = this.repository;
  var queue = this.queue;

  return repository.getRegion( data.region )
    .then(function( region ) {
      region.update( data );

      return region;
    })
    .catch(function( error ) {
      queue.publish( 'region.update.fail', error );
    });
};

Interface.prototype.authLogin = function authLogin( /* data */ ) {
  var ui = this.ui;

  if ( ui ) {
    ui.displayLogin();
  }
};

module.exports = Interface;
