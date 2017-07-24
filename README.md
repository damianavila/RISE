# RISE

**Reveal.js - Jupyter/IPython Slideshow Extension**, also known as *live_reveal*

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/damianavila/RISE)

## Installation

From the most simple to the most complex one, you have 3 options:

### Option 1 - Using conda (recommended):

```
conda install -c damianavila82 rise
```

### Option 2 - Using pip (less recommended):

```
pip install RISE
```
and then two more steps to install the JS and CSS in the proper places:

```
jupyter-nbextension install rise --py --sys-prefix
```

and enable the nbextension:

```
jupyter-nbextension enable rise --py --sys-prefix
```

### Option 3 - The old way (are sure sure you want to go this path?):

To install this nbextension, simply run ``python setup.py install`` from the
*RISE* repository (please use the latest tag available or try master if you want).

And then the same two step described in the pip-based installation:

```
jupyter-nbextension install rise --py --sys-prefix
```

and

```
jupyter-nbextension enable rise --py --sys-prefix
```

### Conclusion

If you use conda, life will be easy ;-)

**NOTE**: in all the options available the `--sys-prefix` option will install and
enable the extension in the current environment, if you want a `--user` based or a
`--system` based installation just use those options instead in the above commands.

## RISE talk

My old talk about **RISE** at *SciPy 2014* (click on the image to see it):

[![RJSE/RISE video](http://img.youtube.com/vi/sZBKruEh0jI/0.jpg)](https://www.youtube.com/watch?v=sZBKruEh0jI)

## RISElet

Coming soon... in fact it is on master but I need to explain how to use it ;-)

## About

As you know... we love **Jupyter/IPython** and we like **Reveal.js** too.

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
    *  3.x.1 tag also compatible with `notebook` 4.x series, but using old installation mechanism
    *  4.0.0b1 tag compatible with the `notebook` 4.2 and above, beta release, please test and report any issues
    *  5.0.0 tag compatible with `notebook` 5 (and "probably" with the upcoming 5.x releases).

3- With **Jupyter** landing we will provide a conda and pip-instalable packages too

**NOTE**: We will only maintain the latest released version.

## Usage

A Very quick video showing how to use RISE lives here: https://youtu.be/sXyFa_r1nxA

In the notebook toolbar, a new button ("Enter/Exit Live Reveal Slideshow")
will be available.

In the notebook menu, the "View" option contains a "Cell Toolbar" sub-menu that gives
you access to the metadata for each cell. If you select the Slideshow preset, you
will see in the right corner of each cell a little box where you can select
the cell type (similar as for the static reveal slides with nbconvert).

Some notes:

1- Use ``spacebar`` to go forward and ``shift+spacebar`` to go backward (or the
visual controller in the slideshow right bottom corner). ``Up`` and ``down`` arrows are reserved to
interact with notebook cells and cannot be used to navigate the slides, instead
you can use ``pgup`` and ``pgdown``.

2- You can know more about the reveal-specific shortcuts just pressing the help
button at the slideshow left bottom corner.

3- In contrast to the traditional Jupyter notebook, the ``Shift-Enter``
shortcut does not select the next cell, but will only run the cell (same as
``Ctrl-Enter``). This is intentional to not switch slides by running a cell
and because some problem arises when you inject new cells on the fly.
When you exit the presentation mode, the behavior comes back to normal.

4- Darkish themes have css conflict with the notebook css, so it need customization
to make them work (not provided by default).

5- Markdown Images get left aligned by default. Enclose the image like 
``<center>![noimg](path/to/image.png)</center>`` to center it.

## Configure your own options

You can configure the `theme`, the `transition`, and from where the slideshow starts with:

```
from traitlets.config.manager import BaseJSONConfigManager
path = "/home/damian/miniconda3/envs/rise_latest/etc/jupyter/nbconfig"
cm = BaseJSONConfigManager(config_dir=path)
cm.update('livereveal', {
              'theme': 'sky',
              'transition': 'zoom',
              'start_slideshow_at': 'selected',
})
```

`path` is where the `nbconfig` is located (for possible different locations,
depending on where did you "install" and "enable" the nbextension, check this docs:
http://jupyter.readthedocs.io/en/latest/projects/jupyter-directories.html and
http://jupyter-notebook.readthedocs.io/en/latest/frontend_config.html).

With these options, your slides will get the `serif` theme and the
`zoom` transition and the slideshow will start from the selected cell (instead
of from the beginning, which is the default).

You can use a similar piece of python code to change the `width` and
`height` of your slides:

```python
cm.update('livereveal', {
              'width': 1024,
              'height': 768,
})
```

Or to enable a right scroll bar for your content exceeding the slide vertical height with:

```python
cm.update('livereveal', {
              'scroll': True,
})
```

There are also options for `controls`, `progress`, `history`, `minScale` and
`slideNumber`.

**Note**: The use of the `minScale` option (values other then `1.0`) can cause
problems with codemirror.

### Alternative configuration method
You can put reveal.js configuration in your notebook metadata (Edit->Edit Notebook Metadata) like this:
```
{
    "livereveal": {
        "theme": "serif",
        "transition": "zoom",
        ...
    },
    "kernelspec": {...}
}
```

## Usage with Leap Motion

**Reveal.js** supports the [Leap Motion](https://www.leapmotion.com) controller.
To control RISE slides with the Leap, put the
[reveal leap plugin options](https://github.com/hakimel/reveal.js#leap-motion)
in your config by running this Python code:

```python
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
cm.update('livereveal', {'leap_motion': None})
```

## Development

You can install RISE in development mode in this way:

First, you'll need to install `npm` (and `node`, `conda install nodejs` is a good idea).

1. Install the JS dependencies

```bash
npm install
```

2. Copy reveal into the static folder and avoid reveal.js RESET styling

```bash
npm run build-reveal
npm run reset-reveal
```

To remove reveal.js from the static folder you can use `npm run clean-reveal`.

3. Build the CSS assets

```bash
npm run build-css
```

To have per-save automatic building of CSS, you can use

```bash
npm run watch-less
```

Second, let's install RISE in a editable form

```bash
git clone https://github.com/damianavila/RISE.git
pip install -e .
jupyter-nbextension install rise --py --sys-prefix --symlink
jupyter-nbextension enable rise --py --sys-prefix
```

Note for developers: the --symlink argument allow you to modify the JavaScript code in-place.
This feature is probably not available in Win. So you will need to "re-install" the nbextension
to actually see any changes you made.

## Pre-Release check

1 - Clean your local repo copy:

```
git clean -fdx
```

2 - Build the JS and CSS

```
npm install
npm run build-reveal
npm run reset-reveal
npm run build-css
```

3 - Check for updated version numbers at `rise/_version.py` and `conda.recipe/meta.yaml`

## Release

4 - Tag the repo with:

```
git tag -a release_tag -m "Release msg"
git push origin release_tag
```

5 - Build sdist and wheels packages:

```
python setup.py sdist
python setup.py bdist_wheel
```

6 - Build the conda packages

For linux and osx packages:

```
RISE_RELEASE=1 conda build conda.recipe --python=3.6
RISE_RELEASE=1 conda build conda.recipe --python=3.5
RISE_RELEASE=1 conda build conda.recipe --python=2.7
```

and

```
conda convert /path/to/conda-bld/linux-64/rise-<version_number>-py36_0.tar.bz2 -p linux-32 -p linux-64 -p osx-64 -o conda_dist
conda convert /path/to/conda-bld/linux-64/rise-<version_number>-py35_0.tar.bz2 -p linux-32 -p linux-64 -p osx-64 -o conda_dist
conda convert /path/to/conda-bld/linux-64/rise-<version_number>-py27_0.tar.bz2 -p linux-32 -p linux-64 -p osx-64 -o conda_dist
```

For Win packages you need to build in a Win VM (shared folders will make you things easier):

```
set RISE_RELEASE=1
conda build conda.recipe --python=3.6
conda build conda.recipe --python=3.5
conda build conda.recipe --python=2.7
```

If the build hangs, there is probably a permission error, try to run again with `--croot %TEMP%`

then, convert them in the same Win VM:

```
conda convert C:\path\to\conda-bld\win-64\rise-<version_number>-py36_0.tar.bz2 -p win-64 -p win-32 -o conda_dist
conda convert C:\path\to\conda-bld\win-64\rise-<version_number>-py35_0.tar.bz2 -p win-64 -p win-32 -o conda_dist
conda convert C:\path\to\conda-bld\win-64\rise-<version_number>-py27_0.tar.bz2 -p win-64 -p win-32 -o conda_dist
```

**Note**: You can increment the build number with the `RISE_BUILD_NUMBER` environment variable

7 - Upload sdist and wheels to PyPI

```
twine upload dist/*
```

8 - Upload conda packages to anaconda.org/damianavila82 (5 platforms x 3 pythons):

```
anaconda upload -u damianavila82 conda_dist/linux-32/*
anaconda upload -u damianavila82 conda_dist/linux-64/*
anaconda upload -u damianavila82 conda_dist/osx-64/*
anaconda upload -u damianavila82 conda_dist/win-32/*
anaconda upload -u damianavila82 conda_dist/win-64/*
```

## Changelog

Lazy changelog: https://github.com/damianavila/RISE/milestone/1?closed=1

## Feedback

If you have any feedback, or find any bugs, please let me know just opening
an issue.

Thanks!

Damián.
