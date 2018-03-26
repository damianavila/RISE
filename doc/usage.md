Usage
=====

You can see [in this youtube video](https://youtu.be/sXyFa_r1nxA) a very
short session on how to use RISE to create and run a slideshow.

Let us emphasize the key points here.

## Creating a slideshow

In the notebook menu, the *"View"* option contains a *"Cell Toolbar"*
sub-menu that gives you access to the metadata for each cell. If you
select the *"Slideshow"* preset, you will see in the right corner of each
cell a little box where you can select the cell type.

You can choose between the following types:

* **slide**: this cell is the beginning of a new slide

* **subslide**: this cell is the beginning of a new subslide; that is
  to say, a new slide, but that `reveal.js` will display *below* the
  previous one instead of on the right;

* **fragment**: this is to split the contents of one slide into
  pieces; a cell marked as a fragment will create a break inside the
  slide; it will not show up right away, you will need to press Space
  one more time to see it.

* **skip**: this cell are ignored altogether in *reveal* mode,
it will not appear either in the main view, nor in the speaker view.

* **notes**: similarly, this cell is marked to be discarded from
  the main view, but is meant to appear in the speaker view.

**Note** that as of RISE version 5.3, the support for speaker view is not
  working, so the *notes* cells will not show up at all either
  when in *reveal* mode.

**Keyboard shortcuts**

Starting with version 5.1.0 you can customize some keyboard shortcuts using
the keyboard shortcut editor from the notebook UI.

We have defined 4 main shortcuts by default that you can change
according to your needs:

-   `Alt-r`, \"Enter/Exit Live Reveal Slideshow\"
-   `Shift-i`, Toggle slide
-   `Shift-u`, Toggle subslide
-   `Shift-f`, Toggle fragment

## Running a slideshow

Once enabled, the RISE Jupyter extension
displays a new button (\"Enter/Exit Live Reveal Slideshow\") in the
toolbar, (also activable with `Alt-r` by default).

This starts the slideshow; you can return to normal notebook edition
by either pressing `Alt-r` again, or by clicking on the cross-shaped
icon on the upper right corner of each slide.

### Navigation

It is *highly recommended* to use mainly **`SpaceBar`** to go forward,
and **`Shift-SpaceBar`** to go backward (or the visual controller in
the slideshow right bottom corner). This will follow the course of the
presentation no matter what the detailed structure is (slides,
subslides, fragments...).

In contrast, `right` and `left` arrows can have a confusing behaviours
with respect to these 3 structural entities. Besides, `up` and `down`
arrows are reserved to interact with notebook cells and cannot be used
to navigate the slides, instead you can use `pgup` and `pgdown`.

### Selection and evaluation

Essentially, when a code cell appears in the presentation, you simply
need to press **`Shift-Enter`** to run it. This will move to the next
cell if it is already displayed.

The default behaviour for RISE is to select the first code cell when a
new slide or fragment shows up. This way, if your presentation has
only markdown cells, you will not be bothered with cells being
selected; on the other hand when yo do have code cells, you can run
the entire slideshow by just using **`Space`** and **`Shift-Enter`**
as appropriate.

### Other notes

* In presentation mode, you can know more about the reveal-specific
shortcuts just pressing the help button at the slideshow left bottom
corner.

* Darkish themes have css conflict with the notebook css, so it need
customization to make them work (not provided by default).

* Markdown Images get left aligned by default. Enclose the image like
`<center>![noimg](path/to/image.png)</center>` to center it.


###  Shift-Enter behaviour (historical note)

Starting version 5.1.0: We have developed a `smart exec` functionality
which essentially it is bound to the Shift-Enter keyboard shortcut and
allows you to execute cells and then proceed to the next cell **WHEN**
the context permits. It is pretty similar to the native behaviour in the
notebook view but it takes into consideration the slideshow view
limitations and particularities. You can find a demo notebook at
`RISE/examples/showflow.ipynb`, but pretty sure you will find the
behavior familiar enough to play with it immediately.

Prior to version 5.1.0: In contrast to the traditional Jupyter notebook,
the `Shift-Enter` shortcut does not select the next cell, but will only
run the cell (same as `Ctrl-Enter`). This is intentional to not switch
slides by running a cell and because some problem arises when you inject
new cells on the fly. When you exit the presentation mode, the behavior
comes back to normal.

### JupyterLab

Please be aware that as of 5.3 RISE is unfortunately not yet
compatible with JupyterLab and must be used with the classic notebook.

See <https://github.com/damianavila/RISE/issues/270> for the github
issue on this topic.
