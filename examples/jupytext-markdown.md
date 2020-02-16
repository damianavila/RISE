---
jupyter:
  celltoolbar: Slideshow
  jupytext:
    cell_metadata_filter: all
    cell_metadata_json: true
    formats: md
    notebook_metadata_filter: all,-language_info,-jupytext.text_representation.jupytext_version
    text_representation:
      extension: .md
      format_name: markdown
      format_version: '1.2'
  kernelspec:
    display_name: Python 3
    language: python
    name: python3
  rise:
    autolaunch: true
---

<!-- #region {"slideshow": {"slide_type": "slide"}} -->
# using jupytext
<!-- #endregion -->

if you have jupytext enabled, you can use RISE in a usual manner  
on notebooks that are stored as `.py` or `.md` (or other extensions, for that matter).

<!-- #region {"slideshow": {"slide_type": "slide"}} -->
## exact same behaviour
<!-- #endregion -->

there is almost nothing that changes in this case as far as RISE is concerned


the only notable difference is for locating the notebook-specific CSS file


of course, and as you might expect, if your notebook   
is called either `mynotebook.py` or `mynotebook.md`,  
or, here again, any other extension  
then it is `mynotebook.css` that is used,  
if it exists, to load a notebook-specific CSS

<!-- #region {"slideshow": {"slide_type": "slide"}} -->
## pros and cons
<!-- #endregion -->

jupytext is supercool if you use git a lot, and you don't carre about saving cell outputs  
no need anymore to run `nbstripout` all the f... time

```python cell_style="split"
# you can still embed code of course
def syracuse(n):
    while n != 1: 
        if n % 2 == 0:
            n //= 2
            yield n
        else:
            n = 3*n + 1
            yield n
```

```python cell_style="split"
# but the output is no longer stored
for n in (4, 8, 27):
    print(f'n=${n} :', end=' ')
    for i in syracuse(n):
        print(i, end=' ')
    print()
```
