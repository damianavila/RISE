Usage
-----

A Very quick video showing how to use RISE lives here: https://youtu.be/sXyFa_r1nxA

In the notebook toolbar, a new button ("Enter/Exit Live Reveal Slideshow")
will be available.

In the notebook menu, the "View" option contains a "Cell Toolbar" sub-menu that gives
you access to the metadata for each cell. If you select the Slideshow preset, you
will see in the right corner of each cell a little box where you can select
the cell type (similar as for the static reveal slides with nbconvert).

Starting version 5.1.0 you can customize some keyboard shortcuts using the keyboard
shortcut editor from the notebook UI.

We have defined 4 main shortcuts by default that you can change accordingly to your needs:
* ``alt-r``, "Enter/Exit Live Reveal Slideshow"
* ``shift-i``, Toggle slide
* ``shift-o``, Toggle-subslide
* ``shift-p``, Toggle-fragment
In future version we will provide full customization for all the important RISE actions.

Some notes:

1- Use ``spacebar`` to go forward and ``shift+spacebar`` to go backward (or the
visual controller in the slideshow right bottom corner). ``Up`` and ``down`` arrows are reserved to
interact with notebook cells and cannot be used to navigate the slides, instead
you can use ``pgup`` and ``pgdown``.

2- You can know more about the reveal-specific shortcuts just pressing the help
button at the slideshow left bottom corner.

3- Shift_Enter behaviour

Starting version 5.1.0:
We have developed a ``smart exec`` functionality which essentially it is bound to the
Shift-Enter keyboard shortcut and allows you to execute cells and then proceed to the
next cell **WHEN** the context permits. It is pretty similar to the native behaviour
in the notebook view but it takes into consideration the slideshow view limitations
and particularities. You can find a demo notebook at ``RISE/examples/showflow.ipynb``,
but pretty sure you will find the behavior familiar enough to play with it immediately.

Prior to version 5.1.0:
In contrast to the traditional Jupyter notebook, the ``Shift-Enter``
shortcut does not select the next cell, but will only run the cell (same as
``Ctrl-Enter``). This is intentional to not switch slides by running a cell
and because some problem arises when you inject new cells on the fly.
When you exit the presentation mode, the behavior comes back to normal.

4- Darkish themes have css conflict with the notebook css, so it need customization
to make them work (not provided by default).

5- Markdown Images get left aligned by default. Enclose the image like
``<center>![noimg](path/to/image.png)</center>`` to center it.


RISE talk
=========

My old talk about **RISE** at *SciPy 2014* (click on the image to see it):

.. image:: http://img.youtube.com/vi/sZBKruEh0jI/0.jpg
  :target: https://www.youtube.com/watch?v=sZBKruEh0jI
  :alt: RJSE/RISE video
