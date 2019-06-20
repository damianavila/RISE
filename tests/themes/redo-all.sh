#!/bin/bash

themes="
black white league sky beige simple 
serif blood night moon solarized"

nbstripout theme-main.ipynb

for theme in $themes; do
    sed \
      -e "s/{theme}/$theme/" \
      -e "s/\"rise\": {/& \"theme\": \"$theme\",/" \
    master.ipynb > theme-$theme.ipynb
    echo refreshed theme-$theme.ipynb
  done