#!/bin/sh
patch export/reveal.js/plugin/chalkboard/chalkboard.js <<EOF
--- chalkboard.js.orig	2020-10-24 15:02:34.000000000 +0200
+++ chalkboard.js	2020-10-24 15:02:41.000000000 +0200
@@ -75,6 +75,7 @@
 	var toggleChalkboardButton = true;
 	var toggleNotesButton = true;
 	var transition = 800;
+	var pens = undefined;

 	var readOnly = undefined;
 
@@ -152,7 +153,7 @@
 		button.style.top = toggleChalkboardButton.top ||  "auto";
 		button.style.right = toggleChalkboardButton.right ||  "auto";
 
-		button.innerHTML = '<a href="#" onclick="RevealChalkboard.toggleChalkboard(); return false;"><i class="fa fa-pen-square"></i></a>'
+		button.innerHTML = '<a href="#" onclick="RevealChalkboard.toggleChalkboard(); return false;"><i class="fa fa-pencil-square"></i></a>'
 		document.querySelector(".reveal").appendChild( button );
 	}
 	if ( toggleNotesButton ) {
@@ -169,7 +170,7 @@
 		button.style.top = toggleNotesButton.top ||  "auto";
 		button.style.right = toggleNotesButton.right ||  "auto";
 
-		button.innerHTML = '<a href="#" onclick="RevealChalkboard.toggleNotesCanvas(); return false;"><i class="fa fa-pen"></i></a>'
+		button.innerHTML = '<a href="#" onclick="RevealChalkboard.toggleNotesCanvas(); return false;"><i class="fa fa-pencil"></i></a>'
 		document.querySelector(".reveal").appendChild( button );
 	}
 //alert("Buttons");
@@ -259,10 +260,11 @@
 ** Storage
 ******************************************************************/
 
-	var storage = [
-		{ width: Reveal.getConfig().width, height: Reveal.getConfig().height, data: []},
-		{ width: Reveal.getConfig().width, height: Reveal.getConfig().height, data: []}
-	];
+	var storage = [
+		{ width: drawingCanvas[0].width - 2 * drawingCanvas[0].xOffset, height: drawingCanvas[0].height - 2 * drawingCanvas[0].yOffset, data: []},
+		{ width: drawingCanvas[1].width, height: drawingCanvas[1].height, data: []}
+	];
+
 //console.log( JSON.stringify(storage));
 
 	var loaded = null;
@@ -1497,18 +1498,20 @@
 		}
 	};
 
-	this.drawWithBoardmarker = drawWithBoardmarker;
-	this.drawWithChalk = drawWithChalk;
-	this.toggleNotesCanvas = toggleNotesCanvas;
-	this.toggleChalkboard = toggleChalkboard;
-	this.startRecording = startRecording;
-	this.clear = clear;
-	this.colorNext = colorNext;
-	this.colorPrev = colorPrev;
-	this.reset = resetSlide;
-	this.resetAll = resetStorage;
-	this.download = downloadData;
-	this.configure = configure;
-
-	return this;
+	return {
+		drawWithBoardmarker: drawWithBoardmarker,
+		drawWithChalk: drawWithChalk,
+		toggleNotesCanvas: toggleNotesCanvas,
+		toggleChalkboard: toggleChalkboard,
+		startRecording: startRecording,
+		clear: clear,
+		colorNext: colorNext,
+		colorPrev: colorPrev,
+		reset: resetSlide,
+		resetAll: resetStorage,
+		download: downloadData,
+		configure: configure
+	};
 })();
+
+export default RevealChalkboard;
EOF
