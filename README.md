# RISE

RISE allows you to instantly turn your Jupyter Notebooks into a
slideshow. No out-of-band conversion is needed, switch from jupyter
notebook to a live *reveal.js*-based slideshow in a single keystroke,
and back.

![Basic usage](https://media.giphy.com/media/3oxHQtTxAaZwMOHr9u/giphy.gif)

## Resources
RISE stands for
***Reveal.js - Jupyter/IPython Slideshow Extension***:

* Demo notebook (no installation required)
  * [![](https://mybinder.org/badge.svg)](https://mybinder.org/v2/gh/damianavila/RISE/master?filepath=examples%2FREADME.ipynb)

* Source code is on github <https://github.com/damianavila/RISE>
  * [![Issues](http://img.shields.io/github/issues/damianavila/RISE.svg)](https://github.com/damianavila/RISE/issues)

* Documentation is hosted on readthedocs
  * [![doc status](https://readthedocs.org/projects/rise/badge)](http://rise.readthedocs.io/)
  * Note / check out another location here that is planned to be phased out: <https://damianavila.github.io/RISE/>

* Chat room on gitter
  * [![Gitter chat](https://badges.gitter.im/damianavila/RISE.png)](https://gitter.im/damianavila/RISE "Gitter chat")

* Videos on youtube
  * basic usage (4'30'')

    <https://youtu.be/sXyFa_r1nxA>


## Installation

From the most simple to the most complex one, you have 3 options:

### Option 1 - Using conda (recommended):

```
conda install -c damianavila82 rise
```

If you are a Julia user, you can do this from the Julia REPL with
```
using Conda
Conda.add_channel("damianavila82")
Conda.add("rise")
```

### Option 2 - Using pip (less recommended):

```
pip install RISE
```

and then one more step to install the JS and CSS in the proper places:

```
jupyter-nbextension install rise --py --sys-prefix
```

As of version 5.3.0, it is **no longer required** to explicitly enable
the nbextension, which you would do with

```
jupyter-nbextension enable rise --py --sys-prefix
```

### Option 3 - The old way (are sure sure you want to go this path?):

To install this nbextension, simply run ``python setup.py install`` from the
*RISE* repository (please use the latest tag available or try master if you want).

And then the same step as described in the pip-based installation:

```
jupyter-nbextension install rise --py --sys-prefix
```

### Conclusion

If you use conda, life will be easy ;-)

**NOTE**: in all the options available the `--sys-prefix` option will install and
enable the extension in the current environment, if you want a `--user` based or a
`--system` based installation just use those options instead in the above commands.

## Development

To install RISE in development mode, see the
[Developer section](https://damianavila.github.io/RISE/dev/develop.html) of the RISE
documentation.

## Feedback

If you have any feedback, or find any bugs, please let me know just opening
an issue.
