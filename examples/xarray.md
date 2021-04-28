---
jupytext:
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.11.1
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---

```{code-cell} ipython3
import xarray as xr
```

this is to illustrate a useful patch for dealing with xarray's `_repr_html_()` 

see also

* https://github.com/damianavila/RISE/issues/594
* `rise.css` in this folder

```{code-cell} ipython3
ds = xr.tutorial.open_dataset('air_temperature')
ds
```
