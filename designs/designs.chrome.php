<!DOCTYPE HTML>
<html>
  <head>
    <title>VUU.SE UI Prototype</title>
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Bootstrap -->
    <link href="../css/vendor/bootstrap.min.css" rel="stylesheet" media="screen">
    <link href="../css/vendor/bootstrap-theme.min.css" rel="stylesheet" media="screen">
  </head>
  <body>
    <div id="container" style="text-align:center;margin: 10px;"></div>
    
    <script src="../lib/vendor/kinetic-v4.6.0.min.js"></script>
    <script src="../lib/vendor/gator.js"></script>
    <script src="../lib/vendor/store+json2.min.js"></script>
    
    <script src="../lib/vuu.se.eventqueue.js"></script>
    <script src="../lib/vuu.se.card.js"></script>
    <script src="../lib/vuu.se.board.js"></script>
    
    <script defer="defer">
    
    // event queue setup
      
      var queue = new EventQueue();
      
    // stage setup
      
      var stage = new Kinetic.Stage({
        container: 'container',
        width: 800,
        height: 600
      });
      
    // visual chrome
      
      var chromeLayer = new Kinetic.Layer();

      var cardMenuChrome = new Kinetic.Rect({
        name: 'cardMenuChrome',
        id: 'cardMenuChrome',
        x: 1,
        y: 500,
        width: 798,
        height: 99,
        stroke: 'black',
        strokeWidth: 1
      });

      var boardMenuChrome = new Kinetic.Rect({
        name: 'boardMenuChrome',
        id: 'boardMenuChrome',
        x: 1,
        y: 1,
        width: 798,
        height: 50,
        stroke: 'black',
        strokeWidth: 1
      });
      
      chromeLayer.add( boardMenuChrome ).add( cardMenuChrome );
      
    // card menu

      var cardMenuLayer = new Kinetic.Layer({
        x: 101,
        y: 500,
        clip: [0, 0, 697, 100]
      });
      
      var cardMenu = new Kinetic.Group({
        draggable: true,
        dragBoundFunc: function(pos) {
          return {
            x: pos.x,
            y: this.getAbsolutePosition().y
          }
        }
      });
      
      for (var i = 1; i <= 10; i++) {
      
        var card = new Card('card' + i, queue, {
          cardid: 'card' + i,
          title: 'Card [' + i + '] added by vuu.se',
          x: (i * 120) - 100,
          y: 17,
          w: 100,
          h: 65
        });
        
        card.disallowDrag();
        
        // add the shape to the layer
        cardMenu.add( card.shape );
        
      }
      
      cardMenuLayer.add( cardMenu );
      
    // board menu

      var boardMenuLayer = new Kinetic.Layer({
        x: 2,
        y: 2,
        clip: [0, 0, 796, 48]
      });
      
      var boardMenu = new Kinetic.Group({
        draggable: true,
        dragBoundFunc: function(pos) {
          return {
            x: pos.x,
            y: this.getAbsolutePosition().y
          }
        }
      });

      var boardLayer = new Kinetic.Layer({
        x: 1,
        y: 53,
        clip: [0, 0, 796, 444]
      });
      
      var boards = new Kinetic.Group();
      
      var boardColors = [ '', 'lightgrey', 'red', 'green', 'blue'  ];
      
      for (var i = 1; i <= 4; i++) {
      
        var board = new Kinetic.Rect({
          name: 'board' + i,
          id: 'board' + i,
          x: (i * 796) - 796 + 1,
          y: 0,
          width: 796,
          height: 444,
          fill: boardColors[i]
        });
      
        var boardTab = new Kinetic.Rect({
          name: 'boardTab' + i,
          id: 'boardTab' + i,
          x: (i * 110) - 100,
          y: 4,
          width: 100,
          height: 50,
          fill: boardColors[i],
          stroke: 'lightgrey',
          strokeWidth: 1
        });
        
        boardTab.setDraggable( false );
        boardTab.board = board;
        
        // add the shape to the layer
        boardMenu.add( boardTab );
        boards.add( board );
        
      }

      boardMenu.on('click', function(evt) {
        var boardTab = evt.targetNode;
        
        boards.setX( boardTab.board.getX() * -1 );
        boards.parent.batchDraw();
      });
      
      boardLayer.add( boards );
      boardMenuLayer.add( boardMenu );
      
    // add card control

      var addCardMenuLayer = new Kinetic.Layer({
        x: 1,
        y: 501,
      });
      
      var addCardCardMenuButton = new Kinetic.Text({
        x: 0,
        y: 0,
        text: 'Add Card',
        fontSize: 30,
        fontFamily: 'Calibri',
        fill: 'grey',
        width: 100,
        padding: 20,
        align: 'center'
      });
      
      addCardMenuLayer.add( addCardCardMenuButton );
    

    // add everything to the stage
    
      stage.add( chromeLayer ).add( cardMenuLayer ).add( boardMenuLayer ).add( boardLayer ).add( addCardMenuLayer );
      
    </script>
  </body>
</html>