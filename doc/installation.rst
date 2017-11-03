Installation
------------

.. note::

   To install RISE in development mode, see
   the `Developer Documentaion <dev/index.rst>`_.

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

.. note::

   In all the options available the ``--sys-prefix`` option will install and
   enable the extension in the current environment, if you want a ``--user`` based or a
   ``--system`` based installation just use those option instead in the above commands.
