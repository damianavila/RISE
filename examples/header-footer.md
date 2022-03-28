---
jupytext:
  cell_metadata_filter: all,-hidden,-heading_collapsed,-run_control,-trusted
  notebook_metadata_filter: all, -jupytext.text_representation.jupytext_version, -jupytext.text_representation.format_version,
    -language_info.version, -language_info.codemirror_mode.version, -language_info.codemirror_mode,
    -language_info.file_extension, -language_info.mimetype, -toc
  text_representation:
    extension: .md
    format_name: myst
kernelspec:
  display_name: Python 3 (ipykernel)
  language: python
  name: python3
language_info:
  name: python
  nbconvert_exporter: python
  pygments_lexer: ipython3
rise:
  autolaunch: true
  backimage: mybackimage.png
  footer: <h3>world (right aligned in css)</h3>
  header: <h1>Hello</h1>
---

Here we have defined `header`, `footer` and `backimage` - [see also the customization doc](http://rise.readthedocs.io/en/latest/customize.html).

See [this other notebook](overlay.ipynb) for a short description of how to use `overlay` instead.

+++ {"slideshow": {"slide_type": "slide"}}

# Slide 1

in this example we have not overridden `scroll` so it means `scroll=False`

regular slides (not too much content) will show up just nice

+++ {"slideshow": {"slide_type": "slide"}}

# Slide 2

* now for a slide that has a large (high) content
* because `scroll=False` we don't get to scroll vertically
* we create a slide
* with a rather extensive height
* so as to see 
* if we can use `"scroll": true` in our settings
* and check that the footer
* does not overlap the contents
* that should scroll within the available space
* between header and footer
* and again
* we create a slide
* with a rather extensive height
* so as to see 
* if we can use `"scroll": true` in our settings
* and check that the footer
* does not overlap the contents
* that should scroll within the available space
* between header and footer
* and a 3rd time
* we create a slide
* with a rather extensive height
* so as to see 
* if we can use `"scroll": true` in our settings
* and check that the footer
* does not overlap the contents
* that should scroll within the available space
* between header and footer
