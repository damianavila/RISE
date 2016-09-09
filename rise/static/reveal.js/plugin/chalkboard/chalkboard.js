/*****************************************************************
** Author: Asvin Goel, goel@telematique.eu
**
** A plugin for reveal.js adding a chalkboard.
**
** Version: 0.3
**
** License: MIT license (see LICENSE.md)
**
** Credits:
** Chalkboard effect by Mohamed Moustafa https://github.com/mmoustafa/Chalkboard
******************************************************************/

var RevealChalkboard = window.RevealChalkboard || (function(){
	var path = scriptPath();
	function scriptPath() {
		// obtain plugin path from the script element
		var src;
		if (document.currentScript) {
			src = document.currentScript.src;
		} else {
			var sel = document.querySelector('script[src$="/chalkboard.js"]')
			if (sel) {
				src = sel.src;
			}
		}

		var path = typeof src === undefined ? src
			: src.slice(0, src.lastIndexOf("/") + 1);
//console.log("Path: " + path);
		return path;
	}

/*****************************************************************
** Configuration
******************************************************************/
	var config = Reveal.getConfig().chalkboard || {};

	var background, pen, draw, color;
	var theme = config.theme || "chalkboard";
	switch ( theme ) {
		case "whiteboard":
			background = [ 'rgba(127,127,127,.1)' , path + 'img/whiteboard.png' ];
			pen = [ path + 'img/boardmarker.png', path + 'img/boardmarker.png' ];
			draw = [ drawWithPen , drawWithPen ];
			color = [ 'rgba(0,0,255,1)', 'rgba(0,0,255,1)' ];
			break;
		default:
			background = [ 'rgba(127,127,127,.1)' , path + 'img/blackboard.png' ];
			pen = [ path + 'img/boardmarker.png', path + 'img/chalk.png' ];
			draw = [ drawWithPen , drawWithChalk ];
			color = [ 'rgba(0,0,255,1)', 'rgba(255,255,255,0.5)'  ];
	}

	if ( config.background ) background = config.background;
	if ( config.pen ) pen = config.pen;
	if ( config.draw ) draw = config.draw;
	if ( config.color ) color = config.color;

	var toggleChalkboardButton = config.toggleChalkboardButton == undefined ? true : config.toggleChalkboardButton;
	var toggleNotesButton = config.toggleNotesButton == undefined ? true : config.toggleNotesButton;
	var transition = config.transition  || 800;

	var readOnly = config.readOnly;

/*****************************************************************
** Setup
******************************************************************/

	var eraserDiameter = 20;

    function setup() {
        if ( toggleChalkboardButton ) {
    //console.log("toggleChalkboardButton")
            var button = document.createElement( 'div' );
            button.id = "toggle-chalkboard";
            button.style.visibility = "visible";
            button.style.position = "absolute";
            button.style.zIndex = 30;
            button.style.cursor = "pointer";

            button.style.left = toggleChalkboardButton.left || "30px";
            button.style.bottom = toggleChalkboardButton.bottom ||  "30px";
            button.style.top = toggleChalkboardButton.top ||  "auto";
            button.style.right = toggleChalkboardButton.right ||  "auto";

            button.innerHTML = '<i onclick="RevealChalkboard.toggleChalkboard(); return false;" class="fa fa-2x fa-pencil-square-o"></i>'
            document.querySelector(".reveal").appendChild( button );
        }
        if ( toggleNotesButton ) {
    //console.log("toggleNotesButton")
            var button = document.createElement( 'div' );
            button.id = "toggle-notes"
            button.style.position = "absolute";
            button.style.zIndex = 30;
            button.style.cursor = "pointer";

            button.style.left = toggleNotesButton.left || "70px";
            button.style.bottom = toggleNotesButton.bottom ||  "30px";
            button.style.top = toggleNotesButton.top ||  "auto";
            button.style.right = toggleNotesButton.right ||  "auto";

            button.innerHTML = '<i onclick="RevealChalkboard.toggleNotesCanvas(); return false;" class="fa fa-pencil fa-2x"></i>'
            document.querySelector(".reveal").appendChild( button );
        }
    //alert("Buttons");

        setupDrawingCanvas(0);
        setupDrawingCanvas(1);
    }

    var drawingCanvas = [ {id: "notescanvas" }, {id: "chalkboard" } ];

    setup();

	var mode = 0; // 0: notes canvas, 1: chalkboard

	var mouseX = 0;
	var mouseY = 0;
	var xLast = null;
	var yLast = null;

	var slideStart = Date.now();
	var slideIndices =  { h:0, v:0 };
        var event = null;
        var timeouts = [ [], [] ];
	var touchTimeout = null;
	var slidechangeTimeout = null;
	var playback = false;

	function setupDrawingCanvas( id ) {
		var container = document.createElement( 'div' );
		container.id = drawingCanvas[id].id;
		container.classList.add( 'overlay' );
		container.setAttribute( 'data-prevent-swipe', '' );
		container.oncontextmenu = function() { return false; }
		container.style.cursor = 'url("' + pen[ id ] + '"), auto';

		drawingCanvas[id].width = window.innerWidth;
		drawingCanvas[id].height = window.innerHeight;
		drawingCanvas[id].scale = 1;
		drawingCanvas[id].xOffset = 0;
		drawingCanvas[id].yOffset = 0;


		if ( id == "0" ) {
			container.style.background = 'rgba(0,0,0,0)';
			container.style.zIndex = "24";
			container.classList.add( 'visible' )
			container.style.pointerEvents = "none";

			var slides = document.querySelector(".slides");
			var aspectRatio = Reveal.getConfig().width / Reveal.getConfig().height;
			if ( drawingCanvas[id].width > drawingCanvas[id].height*aspectRatio ) {
				drawingCanvas[id].xOffset = (drawingCanvas[id].width - drawingCanvas[id].height*aspectRatio) / 2;
			}
			else if ( drawingCanvas[id].height > drawingCanvas[id].width/aspectRatio ) {
				drawingCanvas[id].yOffset = ( drawingCanvas[id].height - drawingCanvas[id].width/aspectRatio ) / 2;
			}
		}
		else {
			container.style.background = 'url("' + background[id] + '") repeat';
			container.style.zIndex = "26";
		}

		var sponge = document.createElement( 'img' );
		sponge.src = path + 'img/sponge.png';
		sponge.id = "sponge";
		sponge.style.visibility = "hidden";
		sponge.style.position = "absolute";
		container.appendChild( sponge );
		drawingCanvas[id].sponge = sponge;

		var canvas = document.createElement( 'canvas' );
		canvas.width = drawingCanvas[id].width;
		canvas.height = drawingCanvas[id].height;
		canvas.setAttribute( 'data-chalkboard', id );
		canvas.style.cursor = 'url("' + pen[ id ] + '"), auto';
		container.appendChild( canvas );
		drawingCanvas[id].canvas = canvas;

		drawingCanvas[id].context = canvas.getContext("2d");


		document.querySelector( '.reveal' ).appendChild( container );
		drawingCanvas[id].container = container;
	}


/*****************************************************************
** Storage
******************************************************************/
	var storage = [
			{ width: drawingCanvas[0].width - 2 * drawingCanvas[0].xOffset, height: drawingCanvas[0].height - 2 * drawingCanvas[0].yOffset, data: []},
			{ width: drawingCanvas[1].width, height: drawingCanvas[1].height, data: []}
		];
//console.log( JSON.stringify(storage));

	if ( config.src != null ) {
		loadData( config.src );
	}


	/**
	 * Load data.
	 */
	function loadData( filename ) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (xhr.readyState === 4) {
				storage = JSON.parse(xhr.responseText);
				for (var id = 0; id < storage.length; id++) {
					if ( drawingCanvas[id].width != storage[id].width || drawingCanvas[id].height != storage[id].height ) {
						drawingCanvas[id].scale = Math.min( drawingCanvas[id].width/storage[id].width, drawingCanvas[id].height/storage[id].height);
						drawingCanvas[id].xOffset = (drawingCanvas[id].width - storage[id].width * drawingCanvas[id].scale)/2;
						drawingCanvas[id].yOffset = (drawingCanvas[id].height - storage[id].height * drawingCanvas[id].scale)/2;
					}
					if ( config.readOnly ) {
						drawingCanvas[id].container.style.cursor = 'default';
						drawingCanvas[id].canvas.style.cursor = 'default';
					}
				}
			}
			else {
				config.readOnly = undefined;
				readOnly = undefined;
				console.warn( 'Failed to get file ' + filename +". ReadyState: " + xhr.readyState + ", Status: " + xhr.status);
			}
		};

		xhr.open( 'GET', filename, true );
		try {
			xhr.send();
		}
		catch ( error ) {
			config.readOnly = undefined;
			readOnly = undefined;
			console.warn( 'Failed to get file ' + filename + '. Make sure that the presentation and the file are served by a HTTP server and the file can be found there. ' + error );
		}
	}

	/**
	 * Download data.
	 */
	function downloadData() {
		var a = document.createElement('a');
		document.body.appendChild(a);
		try {
			a.download = "chalkboard.json";
			var blob = new Blob( [ JSON.stringify( storage ) ], { type: "application/json"} );
			a.href = window.URL.createObjectURL( blob );
		} catch( error ) {
			a.innerHTML += " (" + error + ")";
		}
		a.click();
		document.body.removeChild(a);
	}

	/**
	 * Returns data object for the slide with the given indices.
	 */
	function getSlideData( indices, id ) {
		if ( id == undefined ) id = mode;
//console.log("ID: " + id + "/" + mode );
		if (!indices) indices = slideIndices;
		for (var i = 0; i < storage[id].data.length; i++) {
			if (storage[id].data[i].slide.h === indices.h && storage[id].data[i].slide.v === indices.v && storage[id].data[i].slide.f === indices.f ) {
				return storage[id].data[i];
			}
		}
		storage[id].data.push( { slide: indices, events: [], duration: 0 } );
		return storage[id].data[storage[id].data.length-1];
	}

	/**
	 * Returns maximum duration of slide playback for both modes
	 */
	function getSlideDuration( indices ) {
		if (!indices) indices = slideIndices;
		var duration = 0;
		for (var id = 0; id < 2; id++) {
			for (var i = 0; i < storage[id].data.length; i++) {
				if (storage[id].data[i].slide.h === indices.h && storage[id].data[i].slide.v === indices.v && storage[id].data[i].slide.f === indices.f ) {
					duration = Math.max( duration, storage[id].data[i].duration );
					break;
				}
			}
		}
//console.log( duration );
		return duration;
	}

/*****************************************************************
** Print
******************************************************************/
	var printMode = ( /print-pdf/gi ).test( window.location.search );

	function createPrintout( ) {
		drawingCanvas[0].container.classList.remove( 'visible' ); // do not print notes canvas

		var patImg = new Image();
		patImg.onload = function () {
			var nextSlide = [];
			var width = Reveal.getConfig().width;
			var height = Reveal.getConfig().height;
			var scale = 1;
			var xOffset = 0;
			var yOffset = 0;
			if ( width != storage[1].width || height != storage[1].height ) {
				scale = Math.min( width/storage[1].width, height/storage[1].height);
				xOffset = (width - storage[1].width * scale)/2;
				yOffset = (height - storage[1].height * scale)/2;
			}

			for (var i = 0; i < storage[1].data.length; i++) {
				var slide = Reveal.getSlide( storage[1].data[i].slide.h, storage[1].data[i].slide.v );
				nextSlide.push( slide.nextSibling );
			}
			for (var i = 0; i < storage[1].data.length; i++) {
				var slideData = getSlideData( storage[1].data[i].slide, 1 );

				var imgCanvas = document.createElement('canvas');
				imgCanvas.width = width;
				imgCanvas.height = height;

				var imgCtx = imgCanvas.getContext("2d");
				imgCtx.fillStyle = imgCtx.createPattern( patImg ,'repeat');
				imgCtx.rect(0,0,imgCanvas.width,imgCanvas.height);
				imgCtx.fill();

				for (var j = 0; j < slideData.events.length; j++) {
					switch ( slideData.events[j].type ) {
						case "draw":
							for (var k = 1; k < slideData.events[j].curve.length; k++) {
								draw[1]( imgCtx,
									xOffset + slideData.events[j].curve[k-1].x*scale,
									yOffset + slideData.events[j].curve[k-1].y*scale,
									xOffset + slideData.events[j].curve[k].x*scale,
									yOffset + slideData.events[j].curve[k].y*scale
								);
							}
							break;
						case "erase":
							for (var k = 0; k < slideData.events[j].curve.length; k++) {
								erase[1]( imgCtx,
									xOffset + slideData.events[j].curve[k].x*scale,
									yOffset + slideData.events[j].curve[k].y*scale
								);
							}
							break;
						case "clear":
							var newSlide = document.createElement( 'section' );
							newSlide.classList.add( 'future' );
							newSlide.innerHTML = '<h1 style="visibility:hidden">Drawing</h1>';
							newSlide.setAttribute("data-background", 'url("' + imgCanvas.toDataURL("image/png") +'")' );
							slide.parentElement.insertBefore( newSlide, nextSlide[i] );

							var imgCanvas = document.createElement('canvas');
							imgCanvas.width = width;
							imgCanvas.height = height;
							var imgCtx = imgCanvas.getContext("2d");
							imgCtx.fillStyle = imgCtx.createPattern( patImg ,'repeat');
							imgCtx.rect(0,0,imgCanvas.width,imgCanvas.height);
							imgCtx.fill();
							break;
						default:
							break;
					}
				}
				var newSlide = document.createElement( 'section' );
				newSlide.classList.add( 'future' );
				newSlide.innerHTML = '<h1 style="visibility:hidden">Drawing</h1>';
				newSlide.setAttribute("data-background", 'url("' + imgCanvas.toDataURL("image/png") +'")' );
				slide.parentElement.insertBefore( newSlide, nextSlide[i] );

			}
			Reveal.sync();
		};
		patImg.src = background[1];
	}



/*****************************************************************
** Drawings
******************************************************************/

	function drawWithPen(context,fromX,fromY,toX,toY){
		context.lineWidth = 3;
		context.lineCap = 'round';
		context.strokeStyle = color[0];
		context.beginPath();
  		context.moveTo(fromX, fromY);
  		context.lineTo(toX, toY);
  		context.stroke();
	}

	function drawWithChalk(context,fromX,fromY,toX,toY){
		var brushDiameter = 7;
		context.lineWidth = brushDiameter;
		context.lineCap = 'round';
		context.fillStyle = color[1]; // 'rgba(255,255,255,0.5)';
		context.strokeStyle = color[1];
		var opacity = Math.min(0.8, Math.max(0,color[1].replace(/^.*,(.+)\)/,'$1') - 0.1)) + Math.random()*0.2;
		context.strokeStyle = context.strokeStyle.replace(/[\d\.]+\)$/g, opacity + ')');
		context.beginPath();
  		context.moveTo(fromX, fromY);
  		context.lineTo(toX, toY);
  		context.stroke();
  		// Chalk Effect
		var length = Math.round(Math.sqrt(Math.pow(toX-fromX,2)+Math.pow(toY-fromY,2))/(5/brushDiameter));
		var xUnit = (toX-fromX)/length;
		var yUnit = (toY-fromY)/length;
		for(var i=0; i<length; i++ ){
			var xCurrent = fromX+(i*xUnit);
			var yCurrent = fromY+(i*yUnit);
			var xRandom = xCurrent+(Math.random()-0.5)*brushDiameter*1.2;
			var yRandom = yCurrent+(Math.random()-0.5)*brushDiameter*1.2;
	    		context.clearRect( xRandom, yRandom, Math.random()*2+2, Math.random()+1);
		}
	}
	function erase(context,x,y){
		context.save();
		context.beginPath();
		context.arc(x, y, eraserDiameter, 0, 2 * Math.PI, false);
		context.clip();
		context.clearRect(x - eraserDiameter - 1, y - eraserDiameter - 1, eraserDiameter * 2 + 2, eraserDiameter * 2 + 2);
		context.restore();

	}


	/**
	 * Opens an overlay for the chalkboard.
	 */
	function showChalkboard() {
//console.log("showChalkboard");
		clearTimeout(touchTimeout);
		touchTimeout = null;
		drawingCanvas[0].sponge.style.visibility = "hidden"; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].sponge.style.visibility = "hidden"; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].container.classList.add( 'visible' );
		mode = 1;
	}


	/**
	 * Closes open chalkboard.
	 */
	function closeChalkboard() {
		clearTimeout(touchTimeout);
		touchTimeout = null;
		drawingCanvas[0].sponge.style.visibility = "hidden"; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].sponge.style.visibility = "hidden"; // make sure that the sponge from touch events is hidden
		drawingCanvas[1].container.classList.remove( 'visible' );
		xLast = null;
		yLast = null;
		event = null;
		mode = 0;
	}

	/**
	 * Clear current canvas.
	 */
	function clearCanvas( id ) {
		if ( id == 0 ) clearTimeout( slidechangeTimeout );
		drawingCanvas[id].context.clearRect(0,0,drawingCanvas[id].width,drawingCanvas[id].height);
	}

/*****************************************************************
** Playback
******************************************************************/

	document.addEventListener('seekplayback', function( event ) {
//console.log('event seekplayback ' + event.timestamp);
		stopPlayback();
		if ( !playback || event.timestamp == 0) {
			// in other cases startplayback fires after seeked
			startPlayback( event.timestamp );
		}
//console.log('seeked');
	});


	document.addEventListener('startplayback', function( event ) {
//console.log('event startplayback ' + event.timestamp);
		stopPlayback();
		playback = true;
		startPlayback( event.timestamp );
	});

	document.addEventListener('stopplayback', function( event ) {
//console.log('event stopplayback ' + (Date.now() - slideStart) );
		playback = false;
		stopPlayback();
	});

	function recordEvent( event ) {
		var slideData = getSlideData();
		var i = slideData.events.length;
		while ( i > 0 && event.begin < slideData.events[i-1].begin ) {
			i--;
		}
		slideData.events.splice( i, 0, event);
		slideData.duration = Math.max( slideData.duration, Date.now() - slideStart ) + 1;
	}

	function startPlayback( timestamp, finalMode ) {
		updateReadOnlyMode();

//console.log("playback " + timestamp );
		slideStart = Date.now() - timestamp;
		closeChalkboard();
		mode = 0;
		for ( var id = 0; id < 2; id++ ) {
			clearCanvas( id );
			var slideData = getSlideData( slideIndices, id );
//console.log( timestamp +" / " + JSON.stringify(slideData));
			var index = 0;
			while ( index < slideData.events.length && slideData.events[index].begin < (Date.now() - slideStart) ) {
				playEvent( id, slideData.events[index], timestamp );
				index++;
			}

			while ( playback && index < slideData.events.length ) {
				timeouts[id].push( setTimeout( playEvent, slideData.events[index].begin - (Date.now() - slideStart), id, slideData.events[index], timestamp ) );
				index++;
			}
		}
//console.log("Mode: " + finalMode + "/" + mode );
		if ( finalMode != undefined ) {
			mode = finalMode;
		}
		if( mode == 1 ) showChalkboard();
//console.log("playback (ok)");

	};

	function stopPlayback() {
//console.log("stopPlayback");
//console.log("Timeouts: " + timeouts[0].length + "/"+ timeouts[1].length);
		for ( var id = 0; id < 2; id++ ) {
			for (var i = 0; i < timeouts[id].length; i++) {
 				clearTimeout(timeouts[id][i]);
			}
			timeouts[id] = [];
		}
	};

	function playEvent( id, event, timestamp ) {
//console.log( timestamp +" / " + JSON.stringify(event));
//console.log( id + ": " + timestamp +" / " +  event.begin +" / " + event.type +" / " + mode );
		switch ( event.type ) {
			case "open":
				if ( timestamp <= event.begin ) {
					showChalkboard();
				}
				else {
					mode = 1;
				}

				break;
			case "close":
				if ( timestamp < event.begin ) {
					closeChalkboard();
				}
				else {
					mode = 0;
				}
				break;
			case "clear":
				clearCanvas( id );
				break;
			case "draw":
				drawCurve( id, event, timestamp );
				break;
			case "erase":
				eraseCurve( id, event, timestamp );
				break;

		}
	};

	function drawCurve( id, event, timestamp ) {
		if  ( event.curve.length > 1 ) {
			var ctx = drawingCanvas[id].context;
			var scale = drawingCanvas[id].scale;
			var xOffset = drawingCanvas[id].xOffset;
			var yOffset = drawingCanvas[id].yOffset;

			var stepDuration = ( event.end - event.begin )/ ( event.curve.length - 1 );
//console.log("---");
			for (var i = 1; i < event.curve.length; i++) {
				if (event.begin + i * stepDuration <= (Date.now() - slideStart)) {
//console.log( "Draw " + timestamp +" / " + event.begin + " + " + i + " * " + stepDuration );
					draw[id](ctx, xOffset + event.curve[i-1].x*scale, yOffset + event.curve[i-1].y*scale, xOffset + event.curve[i].x*scale, yOffset + event.curve[i].y*scale);
				}
				else if ( playback ) {
//console.log( "Cue " + timestamp +" / " + (Date.now() - slideStart) +" / " + event.begin + " + " + i + " * " + stepDuration + " = " + Math.max(0,event.begin + i * stepDuration - timestamp) );
					timeouts.push( setTimeout(
						draw[id], Math.max(0,event.begin + i * stepDuration - (Date.now() - slideStart)), ctx,
							xOffset + event.curve[i-1].x*scale,
							yOffset + event.curve[i-1].y*scale,
							xOffset + event.curve[i].x*scale,
							yOffset + event.curve[i].y*scale
						)
					);
				}
			}
		}

	};

	function eraseCurve( id, event, timestamp ) {
		if  ( event.curve.length > 1 ) {
			var ctx = drawingCanvas[id].context;
			var scale = drawingCanvas[id].scale;
			var xOffset = drawingCanvas[id].xOffset;
			var yOffset = drawingCanvas[id].yOffset;

			var stepDuration = ( event.end - event.begin )/ event.curve.length;
			for (var i = 0; i < event.curve.length; i++) {
				if (event.begin + i * stepDuration <= (Date.now() - slideStart)) {
					erase(ctx, xOffset + event.curve[i].x*scale, yOffset + event.curve[i].y*scale);
				}
				else if ( playback ) {
					timeouts.push( setTimeout(
						erase, Math.max(0,event.begin + i * stepDuration - (Date.now() - slideStart)), ctx,
							xOffset + event.curve[i].x * scale,
							yOffset + event.curve[i].y * scale
						)
					);
				}
			}
		}

	};

/*****************************************************************
** User interface
******************************************************************/


// TODO: check all touchevents
	document.addEventListener('touchstart', function(evt) {
		if ( !readOnly && evt.target.getAttribute('data-chalkboard') == mode ) {
			var ctx = drawingCanvas[mode].context;
			var scale = drawingCanvas[mode].scale;
			var xOffset = drawingCanvas[mode].xOffset;
			var yOffset = drawingCanvas[mode].yOffset;

			evt.preventDefault();
		        var touch = evt.touches[0];
		        mouseX = touch.pageX;
		        mouseY = touch.pageY;
			xLast = mouseX;
			yLast = mouseY;
			event = { type: "draw", begin: Date.now() - slideStart, end: null, curve: [{x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale}] };
			touchTimeout = setTimeout( showSponge, 500, mouseX, mouseY );
		}
	}, false);

	document.addEventListener('touchmove', function(evt) {
		clearTimeout( touchTimeout );
		touchTimeout = null;
		if ( event ) {
			var ctx = drawingCanvas[mode].context;
			var scale = drawingCanvas[mode].scale;
			var xOffset = drawingCanvas[mode].xOffset;
			var yOffset = drawingCanvas[mode].yOffset;

		        var touch = evt.touches[0];
        		mouseX = touch.pageX;
        		mouseY = touch.pageY;
        		if (mouseY < drawingCanvas[mode].height && mouseX < drawingCanvas[mode].width) {
        		    evt.preventDefault();
				event.curve.push({x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale});
				if ( event.type == "erase" ) {
					drawingCanvas[mode].sponge.style.left = (mouseX - eraserDiameter) +"px" ;
					drawingCanvas[mode].sponge.style.top = (mouseY - eraserDiameter) +"px" ;
			                erase(ctx, mouseX, mouseY);
				}
				else {
			                draw[mode](ctx, xLast, yLast, mouseX, mouseY);
				}
				xLast = mouseX;
				yLast = mouseY;
			}
		}
	}, false);

	document.addEventListener('touchend', function(evt) {
		clearTimeout( touchTimeout );
		touchTimeout = null;
		if ( event ) {
			// hide sponge image
			drawingCanvas[mode].sponge.style.visibility = "hidden";
			event.end = Date.now() - slideStart;
			if ( event.type == "erase" || event.curve.length > 1 ) {
				// do not save a line with a single point only
				recordEvent( event );
			}
			event = null;
		}
	}, false);

	function showSponge(x,y) {
		if ( event ) {
			event.type = "erase";
			event.begin = Date.now() - slideStart;
			// show sponge image
			drawingCanvas[mode].sponge.style.left = (x - eraserDiameter) +"px" ;
			drawingCanvas[mode].sponge.style.top = (y - eraserDiameter) +"px" ;
			drawingCanvas[mode].sponge.style.visibility = "visible";
			erase(drawingCanvas[mode].context,x,y);
		}
	}

	document.addEventListener( 'mousedown', function( evt ) {
		if ( !readOnly && evt.target.getAttribute('data-chalkboard') == mode ) {
//console.log( "mousedown: " + evt.target.getAttribute('data-chalkboard') );
			var ctx = drawingCanvas[mode].context;
			var scale = drawingCanvas[mode].scale;
			var xOffset = drawingCanvas[mode].xOffset;
			var yOffset = drawingCanvas[mode].yOffset;

			mouseX = evt.pageX;
			mouseY = evt.pageY;
			xLast = mouseX;
			yLast = mouseY;
			if ( evt.button == 2) {
				event = { type: "erase", begin: Date.now() - slideStart, end: null, curve: [{x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale}]};
				drawingCanvas[mode].canvas.style.cursor = 'url("' + path + 'img/sponge.png") ' + eraserDiameter + ' ' + eraserDiameter + ', auto';
				erase(ctx,mouseX,mouseY);
			}
			else {
				event = { type: "draw", begin: Date.now() - slideStart, end: null, curve: [{x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale}] };
			}
		}
	} );

	document.addEventListener( 'mousemove', function( evt ) {
		if ( event ) {
			var ctx = drawingCanvas[mode].context;
			var scale = drawingCanvas[mode].scale;
			var xOffset = drawingCanvas[mode].xOffset;
			var yOffset = drawingCanvas[mode].yOffset;

			mouseX = evt.pageX;
			mouseY = evt.pageY;
			event.curve.push({x: (mouseX - xOffset)/scale, y: (mouseY-yOffset)/scale});
			if(mouseY < drawingCanvas[mode].height && mouseX < drawingCanvas[mode].width) {
				if ( event.type == "erase" ) {
					erase(ctx,mouseX,mouseY);
				}
				else {
					draw[mode](ctx, xLast, yLast, mouseX,mouseY);
				}
				xLast = mouseX;
				yLast = mouseY;
			}
		}
	} );

	document.addEventListener( 'mouseup', function( evt ) {
		if ( event ) {
			if(evt.button == 2){
				drawingCanvas[mode].canvas.style.cursor = 'url("' + pen[mode] + '"), auto';
			}
			event.end = Date.now() - slideStart;
			if ( event.type == "erase" || event.curve.length > 1 ) {
				// do not save a line with a single point only
				recordEvent( event );
			}
			event = null;
		}
	} );

	window.addEventListener( "resize", function() {
//console.log("resize");
		// Resize the canvas and draw everything again
		var timestamp = Date.now() - slideStart;
	        if ( !playback ) {
			timestamp = getSlideDuration();
		}

//console.log( drawingCanvas[0].scale + "/" + drawingCanvas[0].xOffset + "/" +drawingCanvas[0].yOffset );
		for (var id = 0; id < 2; id++ ) {
			drawingCanvas[id].width  = window.innerWidth;
			drawingCanvas[id].height = window.innerHeight;
			drawingCanvas[id].canvas.width  = drawingCanvas[id].width;
			drawingCanvas[id].canvas.height = drawingCanvas[id].height;
			drawingCanvas[id].context.canvas.width  = drawingCanvas[id].width;
			drawingCanvas[id].context.canvas.height = drawingCanvas[id].height;

			drawingCanvas[id].scale = Math.min( drawingCanvas[id].width/storage[id].width, drawingCanvas[id].height/storage[id].height );
			drawingCanvas[id].xOffset = (drawingCanvas[id].width - storage[id].width * drawingCanvas[id].scale)/2;
			drawingCanvas[id].yOffset = (drawingCanvas[id].height - storage[id].height * drawingCanvas[id].scale)/2;
//console.log( drawingCanvas[id].scale + "/" + drawingCanvas[id].xOffset + "/" +drawingCanvas[id].yOffset );
		}
//console.log( window.innerWidth + "/" + window.innerHeight);
		startPlayback( timestamp, mode );

	} );

	function updateReadOnlyMode() {
		if ( config.readOnly == undefined ) {
			readOnly = ( getSlideDuration() > 0 );
			if ( readOnly ) {
				drawingCanvas[0].container.style.cursor = 'default';
				drawingCanvas[1].container.style.cursor = 'default';
				drawingCanvas[0].canvas.style.cursor = 'default';
				drawingCanvas[1].canvas.style.cursor = 'default';
				if ( notescanvas.style.pointerEvents != "none" ) {
					event = null;
					notescanvas.style.background = 'rgba(0,0,0,0)';
					notescanvas.style.pointerEvents = "none";
				}

			}
			else {
				drawingCanvas[0].container.style.cursor = 'url("' + pen[0] + '"), auto';;
				drawingCanvas[1].container.style.cursor = 'url("' + pen[1] + '"), auto';;
				drawingCanvas[0].canvas.style.cursor = 'url("' + pen[0] + '"), auto';;
				drawingCanvas[1].canvas.style.cursor = 'url("' + pen[1] + '"), auto';;
			}
		}
	}

	Reveal.addEventListener( 'ready', function( evt ) {
//console.log('ready');
		if ( !printMode ) {
			slideStart = Date.now();
			slideIndices = Reveal.getIndices();
			if ( !playback ) {
				startPlayback( getSlideDuration(), 0 );
			}
			if ( Reveal.isAutoSliding() ) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent( event );
			}
			updateReadOnlyMode();
		}
		else {
			createPrintout();
		}
	});
	Reveal.addEventListener( 'slidechanged', function( evt ) {
//		clearTimeout( slidechangeTimeout );
//console.log('slidechanged');
		if ( !printMode ) {
			slideStart = Date.now();
			slideIndices = Reveal.getIndices();
			closeChalkboard();
			clearCanvas( 0 );
			clearCanvas( 1 );
			if ( !playback ) {
				slidechangeTimeout = setTimeout( startPlayback, transition, getSlideDuration(), 0 );
			}
			if ( Reveal.isAutoSliding() ) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent( event );
			}

			updateReadOnlyMode();
		}
	});
	Reveal.addEventListener( 'fragmentshown', function( evt ) {
//		clearTimeout( slidechangeTimeout );
//console.log('fragmentshown');
		if ( !printMode ) {
			slideStart = Date.now();
			slideIndices = Reveal.getIndices();
			closeChalkboard();
			clearCanvas( 0 );
			clearCanvas( 1 );
			if ( Reveal.isAutoSliding() ) {
				var event = new CustomEvent('startplayback');
				event.timestamp = 0;
				document.dispatchEvent( event );
			}
			else if ( !playback ) {
				//
				startPlayback( getSlideDuration(), 0 );
//				closeChalkboard();
			}
			updateReadOnlyMode();
		}
	});
	Reveal.addEventListener( 'fragmenthidden', function( evt ) {
//		clearTimeout( slidechangeTimeout );
//console.log('fragmenthidden');
		if ( !printMode ) {
			slideStart = Date.now();
			slideIndices = Reveal.getIndices();
			closeChalkboard();
			clearCanvas( 0 );
			clearCanvas( 1 );
			if ( Reveal.isAutoSliding() ) {
				document.dispatchEvent( new CustomEvent('stopplayback') );
			}
			else if ( !playback ) {
				startPlayback( getSlideDuration() );
				closeChalkboard();
			}
			updateReadOnlyMode();
		}
	});

	Reveal.addEventListener( 'autoslideresumed', function( evt ) {
//console.log('autoslideresumed');
		var event = new CustomEvent('startplayback');
		event.timestamp = 0;
		document.dispatchEvent( event );
	});
	Reveal.addEventListener( 'autoslidepaused', function( evt ) {
//console.log('autoslidepaused');
		document.dispatchEvent( new CustomEvent('stopplayback') );

		// advance to end of slide
//		closeChalkboard();
		startPlayback( getSlideDuration(), 0 );
	});

	function toggleNotesCanvas() {
		if ( !readOnly ) {
			if ( mode == 1 ) {
				toggleChalkboard();
				notescanvas.style.background = background[0]; //'rgba(255,0,0,0.5)';
				notescanvas.style.pointerEvents = "auto";
			}
			else {
				if ( notescanvas.style.pointerEvents != "none" ) {
					event = null;
					notescanvas.style.background = 'rgba(0,0,0,0)';
					notescanvas.style.pointerEvents = "none";
				}
				else {
					notescanvas.style.background = background[0]; //'rgba(255,0,0,0.5)';
					notescanvas.style.pointerEvents = "auto";
				}
			}
		}
	};

	function toggleChalkboard() {
//console.log("toggleChalkboard " + mode);
		if ( mode == 1 ) {
			event = null;
			if ( !readOnly ) recordEvent( { type:"close", begin: Date.now() - slideStart } );
			closeChalkboard();
		}
		else {
			showChalkboard();
			if ( !readOnly ) recordEvent( { type:"open", begin: Date.now() - slideStart } );
		}
	};

	function clear() {
		if ( !readOnly ) {
			recordEvent( { type:"clear", begin: Date.now() - slideStart } );
			clearCanvas( mode );
		}
	};

	function resetSlide( force ) {
		var ok = force || confirm("Please confirm to delete chalkboard drawings on this slide!");
		if ( ok ) {
			stopPlayback();
			slideStart = Date.now();
			event = null;
			closeChalkboard();

			clearCanvas( 0 );
			clearCanvas( 1 );

			mode = 1;
			var slideData = getSlideData();
			slideData.duration = 0;
			slideData.events = [];
			mode = 0;
			var slideData = getSlideData();
			slideData.duration = 0;
			slideData.events = [];

			updateReadOnlyMode();
		}
	};

	function resetStorage( force ) {
		var ok = force || confirm("Please confirm to delete all chalkboard drawings!");
		if ( ok ) {
			stopPlayback();
			slideStart = Date.now();
			clearCanvas( 0 );
			clearCanvas( 1 );
			if ( mode == 1 ) {
				event = null;
				closeChalkboard();
			}
			storage = [
					{ width: drawingCanvas[0].width - 2 * drawingCanvas[0].xOffset, height: drawingCanvas[0].height - 2 * drawingCanvas[0].yOffset, data: []},
					{ width: drawingCanvas[1].width, height: drawingCanvas[1].height, data: []}
				];

			updateReadOnlyMode();
		}
	};

    this.setup = setup;
	this.drawWithPen = drawWithPen;
	this.drawWithChalk = drawWithChalk;
	this.toggleNotesCanvas = toggleNotesCanvas;
	this.toggleChalkboard = toggleChalkboard;
	this.clear = clear;
	this.reset = resetSlide;
	this.resetAll = resetStorage;
	this.download = downloadData;

	return this;
})();
