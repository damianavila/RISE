RISE 
====

a.k.a. Reveal.js - IPython Slideshow Extension.

Project to implement a "LIVE" reveal.js-based version for the IPython notebook.

As you now... I like IPython and Reveal.js.

Previously, I developed an "converter" for the IPython.nbconvert library to export `ipynbs` to a STATIC html slideshow based in Reveal.js library.

But now, here you have a non-STATIC version, a LIVE version... I mean, a notebook rendered as a Reveal.js-based slideshow, where you can execute code... (or show to the audience whatever you can do inside the notebook, but in a nicer way).

NOTE_1: This is the first version (0.2) presented as an extension, but my aim is to integrate it to the IPython project in the future, so probably the codebase will change a lot with the report of bugs and recommendations from you to make it better.

NOTE_2: I am learning JS to do that, so probably the code is very ugly... I will try to improve it... the good notice is: it works ;-)

NOTE_3: In the custom.js you have the possibility to configure (for more details check the source, it is easy):

  * theme
  * transition
 
NOTE_4: You have an ipynb presentation as a gist: https://gist.github.com/damianavila/6345426. You can test the extension with it or use it as a template... or make your own ;-)

NOTE_5: I am touching your ipynb in a "dirty" way... so, for now, make a backup of your ipynb to prevent any damage to it (I tested with no problems for several weeks, but who knows... it is better to prevent problems).

NOTE_6: I am assuming that you know how to install the extension... if not, probably is better for you to wait a little, but if you want to try it anyway... follow this steps with the appropriate changes: http://nbviewer.ipython.org/urls/raw.github.com/fperez/nb-slideshow-template/master/install-support.ipynb
Those steps will install the extension in a specific-profile way. If you are using the default one, it would be that one... but you can also install in another profile. 

Right now, you can also install this extension as a nbextension. Just throw it in the nbextension folder in your .ipython profile and use the custom.js but pointing to the extension inside the nbextension folder:

```javascript
    ...
     require(['nbextensions/livereveal/main'],function(livereveal){
    ...
```

This last way to install the extension is more "extended" I mean, you have the extension in the nbextension folder and you can link it from different profiles, and not worry about installing the extension in eaxh profile.

NOTE_7: Use spacebar to go forward and shift+spacebar to go backward (or the controller in the bottom right corner). Up and Down arrows are reserved to interact with notebook cells. You can know more about the reveal-specific shortcuts just press teh help button.
 
NOTE_8: There are some issues in firefox (if you use it, please report me any issue because I want to support both browsers), so I recommend to use Chromium/Chrome during your talks ;-) 

OK, we will keep in touch.

Damián.
