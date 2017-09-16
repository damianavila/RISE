# RISE

**Reveal.js - Jupyter/IPython Slideshow Extension**, also known as *live_reveal*.
Quickly turn your Jupyter Notebooks into a live presentation.

See the [RISE Documentation](https://damianavila.github.io/RISE) for more
details.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/damianavila/RISE)

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

## Development

To install RISE in development mode, see the
[Developer section](damianavila.github.io/RISE/dev/index) of the RISE
documentation.

## Feedback

If you have any feedback, or find any bugs, please let me know just opening
an issue.
