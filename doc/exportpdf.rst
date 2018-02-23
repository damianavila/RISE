PDF Export
==========

You can export your RISE presentation to PDF using the following procedures:

Using nbconvert
---------------

1 - Generate the slides and serve them using nbconvert::

 jupyter nbconvert --to slides your_talk.ipynb --post serve

It opens up a webpage in the browser at http://127.0.0.1:8000/your_talk.slides.html#/

2 - Add ``?print-pdf`` to the query string as http://127.0.0.1:8000/your_talk.slides.html?print-pdf

Note that you need to remove the ``#`` at the end. The page will render the slides vertically.

3 - Save to PDF in Chrome using the print option

  + Open the in-browser print dialog (Cmd/Ctrl + P).
  + Change the Destination setting to Save as PDF.
  + Change the Layout to Landscape.
  + Change the Margins to None.
  + Enable the Background graphics option.
  + Click Save.

Note that if you are using JavaScript-based packages like bokeh_ in
your slides, you will need to ensure that any cells that define JS
code used by other cells are *not* skipped by RISE.  For instance,
Bokeh plots will only be visible in the PDF output if you include the
cell containing ``output_notebook()`` (or ``hv.extension()`` if using
Bokeh via HoloViews_, even if the live RISE presentation works fine
when skipping those cells. You can use the `Notes` slide type for that
cell if you want it to be omitted from the RISE slideshow but included
in HTML or PDF output.

.. _bokeh: http://bokeh.pydata.org
.. _HoloViews: http://holoviews.org

Using decktape
--------------

1 - Clone decktape::

 git clone https://github.com/astefanutti/decktape

2 - Download decktape's forked version of phantomjs (see https://github.com/astefanutti/decktape)::

 # Windows (MSVC 2013), for Windows Vista or later, bundles VC++ Runtime 2013
 curl -L https://github.com/astefanutti/decktape/releases/download/v1.0.0/phantomjs-msvc2013-x86.exe -o phantomjs.exe
 # Mac OS X (Cocoa), 64-bit, for OS X 10.6 or later
 curl -L https://github.com/astefanutti/decktape/releases/download/v1.0.0/phantomjs-osx-cocoa-x86-64 -o phantomjs
 # Linux (static build), 64-bit, requires fontconfig (CentOS) or libfontconfig (Debian, Ubuntu)
 curl -L https://github.com/astefanutti/decktape/releases/download/v1.0.0/phantomjs-linux-x86-64 -o phantomjs

3 - Put phantomjs on your PATH

4 - Start the jupyter-notebook server (you don't have to start the RISE presentation, you even don't have to open any notebook at all)

5 - ``cd`` into decktape's cloned repository

6 - Within decktape's cloned repository run the decktape.js file like::

 phantomjs decktape.js rise <Jupyter-Notebook-URL> <Output-File>.

More concretely, it looks something like the following::

 phantomjs decktape.js rise http://localhost:8888/notebooks/your/notebook.ipynb?token=5413981230123YourIndividualJupyterNotebookSessionToken412417923   /path/to/outputfile.pdf

Note that the jupyter-notebook session token which seems needed for more recent jupyter-notebook versions. The token is shown to you when you start the jupter-notebook server from commandline.

You can run into some problems using this approach:

1 - If you run decktape.js with wrong token first, or some other things first, it could fail. Restarting the jupyter-notebook server helped.

2 - If you have changed the default presentation size/width/height using the notebook metadata, you might have to adapt the call to include the ``-s <width>x<height>`` parameter::

 phantomjs decktape.js rise -s 1500x900 https://localhost:8888/...

3 - If you experience issues when rendering svg files, please post your fix at astefanutti/decktape#90

4 - Math rendering problems: just try to rerender (issue posted at astefanutti/decktape#91)

5 - Fragments don't show up at all. The current decktape rise plugin puts ``fragments: false``,
see https://github.com/astefanutti/decktape/blob/master/plugins/rise.js#L40 which should render everything together but it is not working.
When changing the above line to ``fragments: true``, every fragment is rendered as a single slide which is a very efficient work around for the moment
as you can simply delete the unwanted slides afterwards.

