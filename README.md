#RISE

**Reveal.js - Jupyter/IPython Slideshow Extension**, also known as *live_reveal*

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/damianavila/RISE)

## Installation

To install this nbextension, simply run ``python setup.py install`` from the
*RISE* repository.

You can also install it in development mode adding ``--develop`` (as a symlink to the source):

```bash
  python setup.py install --develop
```

## RISE talk

My talk about **RISE** at *SciPy 2014* (click on the image to see it):

[![RJSE/RISE video](http://img.youtube.com/vi/sZBKruEh0jI/0.jpg)](https://www.youtube.com/watch?v=sZBKruEh0jI)

## RISElet

Coming soon...

## About

As you now... we love **Jupyter/IPython** and we like **Reveal.js** too.

Previously, we developed a "converter" for the `nbconvert` library to
export a `ipynb` to a *STATIC* html slideshow based in **Reveal.js** library.

But with RISE, you don't have a *STATIC* version anymore, you have a **LIVE**
version! A notebook **rendered** as a **Reveal.js**-based slideshow,
where you can **execute** code or show to the audience whatever you can show/do
inside the notebook itself (but in a "slidy" way).

## Versions

1- **RISE** master branch will be following the **Jupyter** codebase.

2- There is also "released" tagged [branches](https://github.com/damianavila/RISE/releases)
compatible with previous IPython versions:

    *  1.x tag compatible with **IPython** 1.x series
    *  2.x tag compatible with **IPython** 2.x series
    *  3.x tag compatible with **IPython** 3.x series

3- With **Jupyter** landing we will provide a conda and pip-instalable packages too

**NOTE**: We will only mantain the latest released version.

## Usage

In the notebook toolbar, a new button ("Enter/Exit Live Reveal Slideshow")
will be available.

The notebook toolbar also contains a "Cell Toolbar" dropdown menu that gives
you access to metadata for each cell. If you select the Slideshow preset, you
will see in the right corner of each cell a little box where you can select
the cell type (similar as for the static reveal slides with nbconvert).

Some notes:

1- Use ``spacebar`` to go forward and ``shift+spacebar`` to go backward (or the
controller in the bottom right corner). ``Up`` and ``down`` arrows are reserved to
interact with notebook cells and cannot be used to navigate the slides, instead
you can use ``pgup` and ``pgdown``.

2- You can know more about the reveal-specific shortcuts just pressing the help
button at the bottom left of your slideshow.

3- In contrast to the traditional Jupyter notebook, the ``Shift-Enter``
shortcut does not select the next cell, but will only run the cell (same as
``Ctrl-Enter``). This is intentional to not switch slides by running a cell
and because some problem arises when you inject new cells on the fly.
When you exit the presentation mode, the behaviour comes back to normal.

## Manual installation

We encourage you to use the setup.py-based installation (see above), but if you
insist about doing it manually, you need to put the ``livereveal`` folder from the
repo into (most probably) ``~/.local/share/jupyter/nbextensions`` folder and run the
following python code to enable it:

```python
from notebook.services.config import ConfigManager
cm = ConfigManager()
cm.update('notebook', {"load_extensions": {"livereveal/main": True}})
```
or this python code to disable it:

```python
from notebook.services.config import ConfigManager
cm = ConfigManager()
cm.update('notebook', {"load_extensions": {"livereveal/main": False}})
```

## Configure your own options

You can configure the `theme` and the `transition` of your slides, and where
slideshows start from, by running this python code:

```python
from notebook.services.config import ConfigManager
cm = ConfigManager()
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
from notebook.services.config import ConfigManager
cm = ConfigManager()
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
from notebook.services.config import ConfigManager
cm = ConfigManager()
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
from notebook.services.config import ConfigManager
cm = ConfigManager()
cm.update('livereveal', {'leap_motion': None})
```

## Development
To build the CSS assets, you'll need to install `npm` (and `node`).

```bash
npm install
npm run build
```

To have per-save automatic building of CSS, use:
```bash
npm run watch-less
```

## Feedback

If you have any feedback, or find any bugs, please let me know just opening
an issue.

Thanks!

Damián.
