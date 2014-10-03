RJSE/RISE 
=========
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/damianavila/live_reveal?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

a.k.a. Reveal.js - Jupyter/IPython Slideshow Extension.

Project to implement a "LIVE" reveal.js-based version for the Jupyter/IPython notebook.

## Installation

To install this notebook extension, simply run ``python setup.py install`` from the live_reveal repository.

## Live reveal live demo

My talk about RJSE/RISE at SciPy 2014 (click on the image to see it):

[![RJSE/RISE video](http://img.youtube.com/vi/sZBKruEh0jI/0.jpg)](https://www.youtube.com/watch?v=sZBKruEh0jI)

## About

As you now... I love IPython and I like Reveal.js.

Previously, I developed a "converter" for the IPython.nbconvert library to export `ipynb` to a STATIC html slideshow based in Reveal.js library.

But now, here you have a non-STATIC version, a LIVE version... 

I mean, a notebook rendered as a Reveal.js-based slideshow, where you can execute code... (or show to the audience whatever you can do inside the notebook, but in a nicer way).

NOTE_1: This is the version 2.x presented as an nbextension.

NOTE_2: I am still learning JS to do that, so probably the code is very ugly... 
I will try to improve it... the good notice is: "this it working" ;-)

NOTE_3: In the custom.js you have the possibility to configure (for more details check the source, it is easy):

  * theme
  * transition
 
NOTE_4: You have an `ipynb` presentation as a gist: https://gist.github.com/damianavila/6345426. You can test the extension with it or use it as a template... or make your own ;-)

NOTE_5: I am touching your ipynb in a "dirty" way... so, for now, make sure to have a backup of your ipynb to prevent any damage to it (I tested with no problems for several months, but who knows... it is better to prevent the problem than to pay the cost).


NOTE_6: You can know more about the reveal-specific shortcuts just pressing the help button at the bottom left of your slideshow.
 
NOTE_7: There are some issues in firefox (if you use it, please report me any issue because I want to support both browsers), so I recommend to use Chromium/Chrome during your talks ;-) 


## Manual installation

If you're not using the setup.py (which has a --develop mode to symlink from the repository instead of taking a copy), it is assumed that you know how to install a nbextension... if not, I have included, in the repo, an IPython notebook to do it automatically (you can see it [here](http://nbviewer.ipython.org/github/damianavila/live_reveal/blob/master/Install_RJSE.ipynb) too).


A short explanation for a manual installation:

Just throw the extension in the nbextension folder in your `.ipython` profile and use the custom.js but pointing to the extension inside the nbextension folder, as follow:

```javascript
    ...
     require(['nbextensions/livereveal/main'],function(livereveal){
    ...
```

I have added a custom.js in the repo to show you how to do it.

## Feedback

If you have any feedback, or find any bugs, please let me know on the mailing list or by opening an issue.

Thanks!

Damián.

