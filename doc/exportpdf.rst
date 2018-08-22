PDF Export
==========

You can export your RISE presentation to PDF using the following procedures:

Using nbconvert
---------------

0 - This step will not be necessary when nbconvert makes a new release
(https://github.com/jupyter/nbconvert/pull/748), but for now,
if you want sintax highlighting in your printed slideshow, you need to follow these (or similar) instructions:
https://github.com/jupyter/notebook/issues/840#issuecomment-365176083

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
Bokeh via HoloViews_), even if the live RISE presentation works fine
when skipping those cells. You can use the `Notes` slide type for that
cell if you want it to be omitted from the RISE slideshow but included
in HTML or PDF output.

.. _bokeh: http://bokeh.pydata.org
.. _HoloViews: http://holoviews.org

Using decktape
--------------

1 - Install decktape with::

  npm install decktape

2 - Start the jupyter-notebook server (you don't have to start the RISE presentation, you even don't have to open any notebook at all)::

  jupyter notebook

NOTE: Make sure `autoLaunch` option is disabled, otherwise the decktape plugin will exit from the slideshow view before printing the slides.
Discussion about this behavior lives at https://github.com/astefanutti/decktape/issues/110.

3 - Run decktape with::

  `npm bin`/decktape rise <Jupyter-Notebook-URL> <Output-File>

More concretely, it looks something like the following::

  `npm bin`/decktape rise http://localhost:8888/notebooks/your/notebook.ipynb?token=YourIndividualJupyterNotebookSessionToken /path/to/outputfile.pdf

Note that the jupyter-notebook session token is needed. The token is shown to you when you start the jupter-notebook server from commandline.

You can run into some problems using this approach:

1 - If you run decktape.js with wrong token first, or some other things first, it could fail. Restarting the jupyter-notebook server helped.

2 - If you have changed the default presentation size/width/height using the notebook metadata, you might have to adapt the call to include the ``-s <width>x<height>`` parameter::

  `npm bin`/decktape rise -s 1500x900 https://localhost:8888/...

3 - If you experience issues when rendering svg files, please post your fix at astefanutti/decktape#90

4 - Math rendering problems: just try to rerender (issue posted at astefanutti/decktape#91)

5 - Fragments don't show up at all. The current decktape rise plugin puts ``fragments: false``,
see https://github.com/astefanutti/decktape/blob/master/plugins/rise.js#L40 which should render everything together but it is not working.
When changing the above line to ``fragments: true``, every fragment is rendered as a single slide which is a very efficient work around for the moment
as you can simply delete the unwanted slides afterwards.

