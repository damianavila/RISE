RISE
====

**Reveal.js - Jupyter/IPython Slideshow Extension**, also known as *live_reveal*

.. image:: https://badges.gitter.im/Join%20Chat.svg
    :target: https://gitter.im/damianavila/RISE
    :alt: Gitter

What is RISE?
-------------
As you know... we love **Jupyter/IPython** and we like **Reveal.js** too.

Previously, we developed a "converter" for the `nbconvert` library to
export a ``ipynb`` file to a *STATIC* html slideshow based in **Reveal.js** library.

But with RISE, you don't have a *STATIC* version anymore, you have a **LIVE**
version! A notebook **rendered** as a **Reveal.js**-based slideshow,
where you can **execute** code or show to the audience whatever you can show/do
inside the notebook itself (but in a "slidy" way).

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   customize.rst
   changelog.rst

Installation
------------

From the most simple to the most complex one, you have 3 options:

1 - Using conda (recommended)::

 conda install -c damianavila82 rise

2 - Using pip (less recommended)::

 pip install RISE

and then two more steps to install the JS and CSS in the proper places::

 jupyter-nbextension install rise --py --sys-prefix

and enable the nbextension::

  jupyter-nbextension enable rise --py --sys-prefix

3 - The old way (are sure sure you want to go this path?):

To install this nbextension, simply run ``python setup.py install`` from the
*RISE* repository (please use the latest tag available or try master if you want).

And then the same two step described in the pip-based installation::

 jupyter-nbextension install rise --py --sys-prefix

and::

 jupyter-nbextension enable rise --py --sys-prefix

Conclusion: If you use conda, life will be easy ;-)

**NOTE**: in alll the options available the ``--sys-prefix`` option will install and
enable the extension in the current environment, if you want a ``--user`` based or a
``--system`` based installation just use those option instead in the above commands.

Usage
-----
A Very quick video showing how to use RISE lives here: https://youtu.be/sXyFa_r1nxA

In the notebook toolbar, a new button ("Enter/Exit Live Reveal Slideshow")
will be available.

In the notebook menu, the "View" option contains a "Cell Toolbar" sub-menu that gives
you access to the metadata for each cell. If you select the Slideshow preset, you
will see in the right corner of each cell a little box where you can select
the cell type (similar as for the static reveal slides with nbconvert).

Some notes:
1. Use ``spacebar`` to go forward and ``shift+spacebar`` to go backward (or the
visual controller in the slideshow right bottom corner). ``Up`` and ``down`` arrows are reserved to
interact with notebook cells and cannot be used to navigate the slides, instead
you can use ``pgup`` and ``pgdown``.

2. You can know more about the reveal-specific shortcuts just pressing the help
button at the slideshow left bottom corner.

3. In contrast to the traditional Jupyter notebook, the ``Shift-Enter``
shortcut does not select the next cell, but will only run the cell (same as
``Ctrl-Enter``). This is intentional to not switch slides by running a cell
and because some problem arises when you inject new cells on the fly.
When you exit the presentation mode, the behavior comes back to normal.

4. Darkish themes have css conflict with the notebook css, so it need customization
to make them work (not provided by default).

5. Markdown Images get left aligned by default. Enclose the image like
``<center>![noimg](path/to/image.png)</center>`` to center it.

RISE talk
---------

My old talk about **RISE** at *SciPy 2014* (click on the image to see it):

.. image:: http://img.youtube.com/vi/sZBKruEh0jI/0.jpg
  :target: https://www.youtube.com/watch?v=sZBKruEh0jI
  :alt: RJSE/RISE video

Feedback
--------

If you have any feedback, or find any bugs, please
`open an issue <https://github.com/damianavila/RISE/issues>`_.

Riselet
-------

Coming soon... in fact it is on master but I need to explain how to use it ;-)
