#RISE

**Reveal.js - Jupyter/IPython Slideshow Extension**, also known as *live_reveal*

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/damianavila/RISE)

## Installation

To install this nbextension, simply run ``python setup.py install`` from the
*RISE* repository.

You also have some interesting optional arguments, such as:

```bash
  --develop          Install livereveal as a symlink to the source.
  --profile PROFILE  The name of the profile to use.
```

**Note**: We are now (27 Feb 2015) using the new frontend config system, so if
you installed RISE with the ``--develop`` option before, please reinstall it
again. Thanks.

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

3- You have an example presentation as a gist here:
https://gist.github.com/damianavila/6345426. You can test the extension with it
or use it as a template... or make your own presentaion ;-)

4: I tested the extension without losing any `ipynb` for more than one year now,
but I am touching your `ipynb` in a *complex* way... so, make sure you have a
backup of your `ipynb` to prevent any possible loss.

5: There are some issues in **Firefox** (if you use it, please report me any issue
because I want to support both browsers), so I recommend to use **Chromium/Chrome**
during your talks).

## Usage

In the notebook toolbar, a new button ("Enter/Exit Live Reveal Slideshow")
will be available.

The notebook toolbar also contains a "Cell Toolbar" dropdown menu that gives
you access to metadata for each cell. If you select the Slideshow preset, you
will see in the right corner of each cell a little box where you can select
the cell type (similar as for the static reveal slides with nbconvert).

Some notes:

1: Use spacebar to go forward and shift+spacebar to go backward (or the
controller in the bottom right corner). Up and down arrows are reserved to
interact with notebook cells and cannot be used to navigate the slides, instead
you can use pgup and pgdown

2: You can know more about the reveal-specific shortcuts just pressing the help
button at the bottom left of your slideshow.

3: In contrast to the traditional IPython/Jupyter notebook, the Shift-Enter
shortcut does not select the next cell, but will only run the cell (similar
to Ctrl-Enter). This is intentional to not switch slides by running a cell
and because some problem when you inject new cells on the fly.
When you exit the presentation mode, the behaviour comes back to normal.

## Manual installation

I encourage you to use the setup.py-based installation (see above), but if you
insist about doing it manually, you need to put the `livereveal folder`from the
repo into your `.ipython/nbextensions` folder and run this python code to enable
it:

```python
from IPython.html.services.config import ConfigManager
from IPython.utils.path import locate_profile
cm = ConfigManager(profile_dir=locate_profile(get_ipython().profile))
cm.update('notebook', {"load_extensions": {"livereveal/main": True}})
```
or this python code to disable it:

```python
from IPython.html.services.config import ConfigManager
from IPython.utils.path import locate_profile
cm = ConfigManager(profile_dir=locate_profile(get_ipython().profile))
cm.update('notebook', {"load_extensions": {"livereveal/main": False}})
```

## Configure your own options

You can configure the `theme` and the `transition` of your slides, and where
slideshows start from, by running this python code:

```python
from IPython.html.services.config import ConfigManager
from IPython.utils.path import locate_profile
cm = ConfigManager(profile_dir=locate_profile(get_ipython().profile))
cm.update('livereveal', {
              'theme': 'serif',
              'transition': 'zoom',
              'start_slideshow_at': 'selected',
})
```

With these options, your slides will get the `serif` theme and the
`zoom` transition, and slideshows will start from the selected cell (instead
of from the beginning, which is the default).

You can use a similar piece of python code to change the `width` and
`height` of your slides:

```python
from IPython.html.services.config import ConfigManager
from IPython.utils.path import locate_profile
cm = ConfigManager(profile_dir=locate_profile(get_ipython().profile))
cm.update('livereveal', {
              'width': 1024,
              'height': 768,
})
```

There are also options for `controls`, `progress`, `history`, `minScale` and
`slideNumber`.

**Note**: The use of the `minScale` option (values other then `1.0`) can cause
problems with codemirror.

## Usage with Leap Motion

**Reveal.js** supports the [Leap Motion](leapmotion.com) controller.
To control RISE slideshows with the Leap, put the
[reveal leap plugin options](https://github.com/hakimel/reveal.js#leap-motion)
in your config by running this Python code:

```python
from IPython.html.services.config import ConfigManager
from IPython.utils.path import locate_profile
cm = ConfigManager(profile_dir=locate_profile(get_ipython().profile))
cm.update('livereveal', {
    'leap_motion': {
        'naturalSwipe'  : True,     # Invert swipe gestures
        'pointerOpacity': 0.5,      # Set pointer opacity to 0.5
        'pointerColor'  : '#d80000',# Red pointer
    }
})
```

To disable it:

```python
from IPython.html.services.config import ConfigManager
from IPython.utils.path import locate_profile
cm = ConfigManager(profile_dir=locate_profile(get_ipython().profile))
cm.update('livereveal', {'leap_motion': None})
```

## Feedback

If you have any feedback, or find any bugs, please let me know just opening
an issue.

Thanks!

Damián.
