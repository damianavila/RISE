# PDF Export

You can export your RISE presentation to PDF using the following procedures:

## Using nbconvert

1. Generate the slides and serve them using nbconvert:

   `jupyter nbconvert --to slides your_talk.ipynb --post serve`

   It opens up a webpage in the browser at http://127.0.0.1:8000/your_talk.slides.html#/

1. Add `?print-pdf` to the query string as http://127.0.0.1:8000/your_talk.slides.html?print-pdf

   Note that you need to remove the `#` at the end. The page will render the slides vertically.

1. Save to PDF in Chrome using the print option

- Open the in-browser print dialog (Cmd/Ctrl + P).
- Change the Destination setting to Save as PDF.
- Change the Layout to Landscape.
- Change the Margins to None.
- Enable the Background graphics option.
- Click Save.

### Note about Javascript dependencies

that if you are using JavaScript-based packages [like e.g.
bokeh](http://bokeh.pydata.org) in your slides, you will need to ensure that
any cells that define JS code used by other cells are _not_ skipped by RISE.
For instance, Bokeh plots will only be visible in the PDF output if you include
the cell containing `output_notebook()` (or `hv.extension()` if using Bokeh
[via HoloViews](http://holoviews.org)), even if the live RISE presentation
works fine when skipping those cells. You can use the `Notes` slide type for
that cell if you want it to be omitted from the RISE slideshow but included in
HTML or PDF output.

### Historical note

These instructions should work fine with an up-to-date version of `nbconvert`.
If you use a version [prior to the merge of PR
748](https://github.com/jupyter/nbconvert/pull/748), and you want syntax
highlighting in your printed slideshow, you need to follow these (or similar)
instructions:
https://github.com/jupyter/notebook/issues/840#issuecomment-365176083

## Using decktape

1. Install decktape with:

   `npm install decktape`

1. Start the jupyter-notebook server (you don't have to start the RISE presentation, you don't even have to open any notebook at all):

   `jupyter notebook`

   **NOTE**: Make sure `autoLaunch` option is disabled, otherwise the decktape plugin
   will exit from the slideshow view before printing the slides. Discussion about
   this behavior lives at <https://github.com/astefanutti/decktape/issues/110>.

1. Run decktape with:

   `$(npm bin)/decktape rise <Jupyter-Notebook-URL> <Output-File>`

   More concretely, it looks something like the following:

   `$(npm bin)/decktape rise http://localhost:8888/notebooks/your/notebook.ipynb?token=YourJupyterSessionToken /path/to/outputfile.pdf`

   Note that the jupyter-notebook session token is needed. The token is shown to you when you start the jupter-notebook server from commandline.

You can run into some problems using this approach:

1. If you run `decktape.js` with wrong token first, or some other things first,
   it could fail. Restarting the jupyter-notebook server helped.

1. If you have changed the default presentation size/width/height using the notebook metadata, you might have to adapt the call to include the `-s <width>x<height>` parameter:

   `$(npm bin)/decktape rise -s 1500x900 https://localhost:8888/...`

1. If you experience issues when rendering svg files, please post your fix at
   <https://github.com/astefanutti/decktape#90>

1. Math rendering problems: just try to rerender (issue posted at <https://github.com/astefanutti/decktape#91>)

1. Fragments don't show up at all. The current decktape rise plugin puts `fragments: false`,
   see https://github.com/astefanutti/decktape/blob/master/plugins/rise.js#L40 which should render everything together but it is not working.
   When changing the above line to `fragments: true`, every fragment is rendered as a single slide which is a very efficient work around for the moment
   as you can simply delete the unwanted slides afterwards.
