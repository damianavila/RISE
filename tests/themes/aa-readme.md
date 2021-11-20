# testing themes

this is a rustic test for generating one slideshow per theme for all the builtin themes in reveal.js

it is on purpose in a separate dir - and **NOT** in `examples/` for example - so that no customisation is in place

## master

change `master.ipynb` as needed; make sure to keep the `rise` key in metadata

## generate

```
./redo-all.sh
```

## visual test

open all theme files

```
macnb-open theme-*nb
```

or whatever notebook-opener you have in place
