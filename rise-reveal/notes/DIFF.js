10a11,13
>  *
>  * Modified version from 3.5.0 notes plugin used by RISE
>  *
17c20
< 			var jsFileLocation = document.querySelector('script[src$="notes.js"]').src;  // this js file path
---
> 			var jsFileLocation = document.querySelector('script[src*="notes.js"]').src;  // this js file path
142c145
< 			if( event.keyCode === 83 ) {
---
> 			if( event.keyCode === 84 ) {
