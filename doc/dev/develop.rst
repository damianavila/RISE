Development
-----------

You can install RISE in development mode in this way:

First, you'll need to install `npm` (and `node`, `conda install nodejs` is a good idea).

1. Install the JS dependencies::

    npm install

2. Copy reveal into the static folder and avoid reveal.js RESET styling::

    npm run build-reveal
    npm run reset-reveal

To remove reveal.js from the static folder you can use `npm run clean-reveal`.

3. Build the CSS assets::

    npm run build-css

To have per-save automatic building of CSS, you can use::

    npm run watch-less

Second, let's install RISE in a editable form::

    git clone https://github.com/damianavila/RISE.git
    pip install -e .
    jupyter-nbextension install rise --py --sys-prefix --symlink
    jupyter-nbextension enable rise --py --sys-prefix

Note for developers: the ``--symlink`` argument allow you to modify the JavaScript code in-place.
This feature is probably not available in Win. So you will need to "re-install" the nbextension
to actually see any changes you made.
