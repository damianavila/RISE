live_reveal
===========

Project to implement a "LIVE" reveal version for the IPython notebook.

As you now... I like IPython and Reveal.js.

Previously, I developed an "converter" for the IPython.nbconvert lib to export ipynb to STATIC html slideshow based in Reveal.js library.

Now, you a have a non-STATIC version, instead a LIVE version... I mean, a notebook rendered as a Reveal.js-based slideshow, where you can execute code... (or show to the audience whatever you can do inside the notebook, but in a nicer way).

NOTE_1: This is the first version (0.1) presented as an extension, but my aim is to integrate it to the IPython project, so probably the codebase will change a lot with the report of bugs and recommendations from you to make it better...

NOTE_2: I am learning JS to do that, so probably the code is very ugly... I will try to improve it... the good notice is that: it works ;-)

NOTE_3: In the custom.js you have the possibility to configure (for more details check the source, it is easy...):

  * theme
  * transition
  * back-ground image url (optional)
 

NOTE_4: You have an ipynb presentation as a gist: https://gist.github.com/damianavila/6345426. You can test the extension with it or use it as a template... or make your own ;-)

NOTE_5: I am touching your ipynb in a "dirty" way... so, for now, make a backup of your ipynb to prevent any damage to it (I tested with no problems for several days, but who knows... it is better to prevent problems).

NOTE_6: I am assuming that you know how to install the extension... if not, look at the [INSTALL.md] (INSTALL.md) file for detailed steps to install this live_reveal extension / plugin inside your IPython.

NOTE_7: Use spacebar to go forward and shift+spacebar to go backward (or the controller in the bottom right corner). Up and Down arrows are reserved to interact with notebook cells.
 
NOTE_8: Use shift+Plus operator (keys shit+) to go to or jump into next code cell by showing all fragments which are all presented in between two code cells.

NOTE_9: Use `#hideme` tag inside code cell as starting line to hide code cell or [In] alone, but it shows its correspoding outputs [Out] only. This will work when you click on live slide / presentation mode. This is useful when you load image by using Image. For eg,

<pre>
#hideme
from IPython.core.display import Image 
Image(filename='img/hello-python.png') </pre>


The above code cell will show only its output image during the live presentation and it will not show python code.
Once you come out of live presentation mode, then all `#hideme` code will be visible in nbviewer.
PS : `#hideme` tag works only in firefox browser. For chrome, need to test/work out.

NOTE_10: There are some issues in firefox (if you use it, please report me any issue because I want to support both browsers), so I recommend to use Chromium/Chrome during your talks ;-) 

OK, we will keep in touch.

Damián.

Arulalan.T
