Customizing RISE
================

There are two main ways to configure RISE. One invokes Python code to
update RISE configuration. The other involves updating the notebook's
metadata, which is stored as a YAML file.

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

Choosing a theme and transition
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The following options can be configured with either the Python or notebook
metadata approach.

You can configure the ``theme``, the ```transition``, and from where the
slideshow starts with::

  from traitlets.config.manager import BaseJSONConfigManager
  path = "/home/damian/miniconda3/envs/rise_latest/etc/jupyter/nbconfig"
  cm = BaseJSONConfigManager(config_dir=path)
  cm.update("livereveal", {
                "theme": "sky",
                "transition": "zoom",
                "start_slideshow_at": "selected",
  })

``path`` is where the ``nbconfig`` is located (for possible different locations,
depending on where did you "install" and "enable" the nbextension, check these docs:
http://jupyter.readthedocs.io/en/latest/projects/jupyter-directories.html and
http://jupyter-notebook.readthedocs.io/en/latest/frontend_config.html).

With these options, your slides will get the ``serif`` theme and the
``zoom`` transition and the slideshow will start from the selected cell (instead
of from the beginning, which is the default).

Change the width and height of slides
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can use a similar piece of python code to change the ``width`` and
``height`` of your slides:

  .. code-block:: python

      cm.update("livereveal", {
                    "width": 1024,
                    "height": 768,
      })

Autoselect
~~~~~~~~~~

As you progress into your slideshow, you either move to a new
(sub)slide, or show (or hide) a new fragment; whenever any
of these events occur, you may wish to have the jupyter selection
keep in sync or not; this is the purpose of the auto-select feature.

There are currently two settings that let you change the way
auto-select behaves, here are their default values:

  .. code-block:: python

      cm.update("livereveal", {
                    "auto_select": "none",
                    "auto_select_fragment": True,
      })

``auto_select`` can be any of ``"none"`` (default) ``"first"`` or
``"code"``. When set to ``"first"``, the first cell is auto-selected,
and when set to ``"code"`` the first code cell is auto-selected. Using
``"none"`` turns off auto-selection.

``auto_select_fragment`` is a boolean that states whether auto-selection
should compute the cell to select based on the current slide as a
whole (when set to ``False``) or restrict to the current fragment
(when set to ``True``, the default).

These settings are experimental and may change in the future. As of
their introduction it seems like the most meaningful combinations are
either ``auto_select = "none"`` - in which case the other setting is
ignored, or ``auto_select = "code"` and ``auto_select_fragment = True``.



Enable a right scroll bar
~~~~~~~~~~~~~~~~~~~~~~~~~

Or to enable a right scroll bar for your content exceeding the slide vertical
height with:

  .. code-block:: python

      cm.update("livereveal", {
                    "scroll": True,
      })

Usage with Leap Motion
~~~~~~~~~~~~~~~~~~~~~~

**Reveal.js** supports the `Leap Motion <https://www.leapmotion.com>`_ controller.
To control RISE slides with the Leap, put the
`reveal leap plugin options <https://github.com/hakimel/reveal.js#leap-motion>`_
in your config with the following parameters:

    .. code-block:: python

        cm.update("livereveal", {
                    "leap_motion": {
                        "naturalSwipe"  : True,     # Invert swipe gestures
                        "pointerOpacity": 0.5,      # Set pointer opacity to 0.5
                        "pointerColor"  : "#d80000",# Red pointer
                    }
        })

To disable it:

    .. code-block:: python

        cm.update("livereveal", {"leap_motion": None})

Other configuration options
~~~~~~~~~~~~~~~~~~~~~~~~~~~

There are also options for ``controls``, ``progress``, ``history``, ``minScale``
and ``slideNumber``.

**Note**: The use of the ``minScale`` option (values other then ``1.0``) can cause
problems with codemirror.
