Customizing RISE
================

There are two main ways to configure RISE. One invokes Python code to
update RISE configuration. The other involves updating the notebook's
metadata, which is stored as a YAML file.

.. _config_python:

Using python
------------
To configure RISE with python, you need to use the JSON config manager
from ``traitlets``. Do so with the following code:

.. code-block:: python

    from traitlets.config.manager import BaseJSONConfigManager
    path = "/home/damian/miniconda3/envs/rise_latest/etc/jupyter/nbconfig"
    cm = BaseJSONConfigManager(config_dir=path)
    cm.update("livereveal", {
                  "theme": "sky",
                  "transition": "zoom",
                  "start_slideshow_at": "selected",
    })

.. note::

   ``path`` is where the ``nbconfig`` is located. This will vary depending
   on where you "installed" and "enabled" the nbextension. For more information,
   see these docs:
   http://jupyter.readthedocs.io/en/latest/projects/jupyter-directories.html and
   http://jupyter-notebook.readthedocs.io/en/latest/frontend_config.html.

Using notebook metadata
-----------------------
You can also put ``reveal.js`` configuration in your notebook metadata
(Edit->Edit Notebook Metadata) like this::

    {
        ...
        "livereveal": {
            "theme": "serif",
            "transition": "zoom",
            ...
        },
        ...
    }

Configuration options
---------------------

There are many configuration options in RISE. This section includes details
how to use each one. We'll use JSON to show key/value combinations, but see
:ref:`config_python` for how to set configurations directly from python.

Below is a list of all configuration options and links
to the section for each.

- ``theme`` (:ref:`config_theme`)
- ``transition`` (:ref:`config_transition`)
- ``start_slideshow_at`` (:ref:`config_slide_begin`)
- ``width`` and ``height`` (:ref:`config_width_height`)
- ``autolaunch`` (:ref:`config_autolaunch`)
- ``auto_select`` and ``auto_select_fragment`` (:ref:`config_autoselect`)
- ``scroll`` (:ref:`config_right_scroll`)
- ``backimage``, ``header``, ``footer``, ``overlay`` (:ref:`config_overlay`)
- ``leap_motion`` (:ref:`config_leap_motion`)


.. _config_theme:

Choosing a theme
~~~~~~~~~~~~~~~~

You can configure the ``theme`` of your presentation (which controls the
general look and feel of the presentation) with::

  {
   ...
   "livereveal": {"theme": "sky"}
  }

.. _config_transition:

Choosing a transition
~~~~~~~~~~~~~~~~~~~~~

The transition configuration defines what happens in between slides.::

  {
   ...
   "livereveal": {"transition": "zoom"}
  }

.. _config_slide_begin:

Choosing where the slideshow begins
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The following configure changes where the slides begin. By default, RISE
will start at the first slide of the presentation. To use the current selected
slide use the following configuration::

  {...
   "livereveal": {"start_slideshow_at": "selected"}
  }

.. _config_width_height:

Change the width and height of slides
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To control the width and height of your slides, use the following
configuration::

  {
   ...
   "livereveal": {"width": 1024,
                  "height": 768}
  }

Note that you may want to increase the slide height to ensure that cell
outputs fit within a single slide.

.. _config_autolaunch:

Automatically launch RISE
~~~~~~~~~~~~~~~~~~~~~~~~~

You can setup your notebook to start immediately with the slideshow view using
the ``autolaunch`` config option::

  {
   ...
   "livereveal": {"autolaunch": true}
  }

.. _config_autoselect:

Select cells based on the current slide
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As you progress into your slideshow, you either move to a new
(sub)slide, or show (or hide) a new fragment; whenever any
of these events occur, you may wish to have the jupyter selection
keep in sync or not; this is the purpose of the auto-select feature.

There are currently two settings that let you change the way
auto-select behaves, here are their default values::

  {
   ...
   "livereveal": {"auto_select": "none",
                  "auto_select_fragment": true}
  }

``auto_select`` can be any of:

* ``"none"`` (no auto-selection, default)
* ``"first"`` (the first cell is auto-selected)
* ``"code"`` (the first code cell is auto-selected)

``auto_select_fragment`` is a boolean that states whether auto-selection
should select cells based on the current slide as a
whole (when set to ``false``) or restrict to the current fragment
(when set to ``true``, the default).

These settings are experimental and may change in the future. As of
their introduction it seems like the most meaningful combinations are
either ``auto_select = "none"`` - in which case the other setting is
ignored, or ``auto_select = "code"` and ``auto_select_fragment = true``.

.. _config_right_scroll:

Enable a right scroll bar
~~~~~~~~~~~~~~~~~~~~~~~~~

To enable a right scroll bar for your content exceeding the slide vertical
height, use the following configuratoin::

  {
   ...
   "livereveal": {"scroll": true}
  }

.. _config_overlay:

Add overlay, header, footer and background images
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

It is possible to add the config option ``overlay`` to build a constant background.
It is wrapped in a ``<div>``, so it can be text or html. In this case, the user is
entirely responsible for styling. For example::

  {
   ...
   "livereveal": {"overlay": "<div class='myheader'><h2>my company</h2></div><div class='myfooter'><h2>the date</h2></div>"}
  }

In addition, you can specify headers, footers, and backgrounds. In this case,
minimal styling is applied (floor and ceiling) but user is still responsible
for cosmetic styling::

  {
   ...
   "livereveal": {"backimage": "mybackimage.png",
                  "header": "<h1>Hello</h1>",
                  "footer": "<h3>World!</h3>"}
  }

You can see some examples using these options at ``RISE/examples/overlay.ipynb`` and
``RISE/examples/header-footer.ipynb``

.. _config_leap_motion:

Usage with Leap Motion
~~~~~~~~~~~~~~~~~~~~~~

**Reveal.js** supports the `Leap Motion <https://www.leapmotion.com>`_ controller.
To control RISE slides with the Leap, put the
`reveal leap plugin options <https://github.com/hakimel/reveal.js#leap-motion>`_
in your config with the following parameters::

  {
   ...
   "livereveal": {"leap_motion": {
                     "naturalSwipe"  : true,     # Invert swipe gestures
                     "pointerOpacity": 0.5,      # Set pointer opacity to 0.5
                     "pointerColor"  : "#d80000"}# Red pointer"nat.png"
  }

To disable it::

  {
   ...
   "livereveal": {"leap_motion": "none"}
  }

Other configuration options
~~~~~~~~~~~~~~~~~~~~~~~~~~~

There are also options for ``controls``, ``progress``, ``history``, ``minScale``
and ``slideNumber``.

**Note**: The use of the ``minScale`` option (values other then ``1.0``) can cause
problems with codemirror.

Adding custom CSS
-----------------

RISE looks for two css files to apply CSS changes on top of the slideshow view.
First, it attemps to load ``rise.css`` and this will be applied to all notebooks in the
current directory.

Second, it attemps to load ``<my_notebook_name>.css`` and this will be **only** applied
to ``my_notebook_name.ipynb`` notebook file.
Both files needs to be placed alongside with the notebook if interest, in the same directory.

You can see some examples using this customization with ``RISE/examples/showflow.ipynb``.
