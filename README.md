#RISE

[![Join the chat at https://gitter.im/damianavila/RISE](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/damianavila/RISE?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**Reveal.js - Jupyter/IPython Slideshow Extension**, also known as *live_reveal*

## Installation

To install this nbextension, simply run ``python setup.py install`` from the
*live_reveal* repository.

You also have some interesting optional arguments, such as:

```bash
  --develop          Install livereveal as a symlink to the source.
  --profile PROFILE  The name of the profile to use.
```

## RISE live demo

My talk about **RISE** at *SciPy 2014* (click on the image to see it):

[![RJSE/RISE video](http://img.youtube.com/vi/sZBKruEh0jI/0.jpg)](https://www.youtube.com/watch?v=sZBKruEh0jI)

## About

As you now... I love **Jupyter/IPython** and I like **Reveal.js** a lot.

Previously, I developed a "converter" for the `IPython.nbconvert` library to
export `ipynb` to a *STATIC* html slideshow based in **Reveal.js** library.

But now, here, you don't have a *STATIC* version anymore, you have a **LIVE**
version... I mean, a notebook **rendered** as a **Reveal.js**-based slideshow,
where you can **execute** code or show to the audience whatever you can show/do
inside the plain notebook (but in a nicer way).

**NOTES**

1- **RISE** master branch will be following the **Jupyter/IPython** master codebase.
There is also a released **RISE** 2.x version compatible with the **IPython** 2.x
series, but this version will be not mainteined after **IPython** 3.0 release.

2- I am still learning JS to do that, so probably the code is ugly. I will try
to improve it, the good notice: it is working!!

3- Tweak the autogenerated `custom.js` to configure the *theme* and *transition*.
More configurable options and a real UI is planned for the future.
 
4- You have an example presentation as a gist here:
https://gist.github.com/damianavila/6345426. You can test the extension with it
or use it as a template... or make your own presentaion ;-)

5: I tested the extension without losing any `ipynb` for more than one year now,
but I am touching your `ipynb` in a *complex* way... so, make sure you have a
backup of your `ipynb` to prevent any possible loss.

6: You can know more about the reveal-specific shortcuts just pressing the help
button at the bottom left of your slideshow.
 
7: There are some issues in **Firefox** (if you use it, please report me any issue
because I want to support both browsers), so I recommend to use **Chromium/Chrome**
during your talks).


## Manual installation

I strongly encourage you to use the python-based installation (see above), but
if you insist about doing it manually, just copy the extension (the
*live_reveal* folder in this repo) in the nbextension folder of your `.ipython`
directory and then, throw the `custom.js` I have added to the repo inside
`your_profile/static/custom` directory.

## Usage with leap motion.

**Reveal.js** support the [leap motion](leapmotion.com). You can use RISE with
the leap motion if your local computer have a leap motion installed. Simply
pass the [reveal leap plugin options](https://github.com/hakimel/reveal.js#leap-motion)
as a third parameter of your reveal js parameters, for example in `custom.js`:

```javascript
livereveal.parameters('simple', 'linear', 
    {
    leap: {
        naturalSwipe   : true,    // Invert swipe gestures
        pointerOpacity : 0.5,      // Set pointer opacity to 0.5
        pointerColor   : '#d80000' // Red pointer
        },
    }
);
```

## Feedback

If you have any feedback, or find any bugs, please let me know just opening
an issue.

Thanks!

Damián.
