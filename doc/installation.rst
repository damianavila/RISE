Installation
============

.. note::

   To install RISE in development mode, see
   the `Developer Documentation <dev/index.rst>`_.

You essentially have 2 options:

1 - Using conda ::

  conda install -c conda-forge rise

.. note::

   Previously, we provided packages in the `damianavila82` channel,
   going forward please use the `conda-forge` channel because newest versions
   will not be published in the `damianavila82` channel anymore.

If you are a Julia user, you can also install it from the Julia REPL with ::

  using Conda
  Conda.add_channel("conda-forge")
  Conda.add("rise")

2 - Using pip ::

  pip install RISE

.. note::

   Before RISE 5.4.2, it was necessary to perform one more step to install the JS and CSS in the proper places with ::

     jupyter-nbextension install rise --py --sys-prefix

   This is **not** needed anymore because those resources are installed automatically by the `setup.py` when you `pip install` the package.


Disable and Removal
-------------------

You can disable RISE with::

  jupyter-nbextension disable rise --py --sys-prefix

If you want to remove it from your environment::

  jupyter-nbextension uninstall rise --py --sys-prefix

Alternative, you can also remove it with conda (if you already installed it using conda) with::

  conda remove rise
