#!/bin/bash

for file in notes.js notes.html; do cp notes/$file export/reveal.js/plugin/notes; done

result_dir=export/reveal.js/plugin/notes

##### js file
# first patch is about locating notes.js to compute the location of notes.html
# second it to bind 't' instead of 's' to the notes feature
sed -i.patched \
    -e 's/src\$=/src*=/' \
    -e 's/\(keyCode.*\)83/\184/' \
    -e "s/key: 'S'/key: 'T'/" \
    $result_dir/notes.js

echo $result_dir/notes.js patched for RISE


##### html file
# this is about removing duplicate widgets in the notes view
# for issue #456, remove spurrious, i.e. duplicate or useless
# contents in this area
# first is the drop down with Slide Type, that I guess comes
# from a representation of the 'notes' cell with the cell toolbar being set to Slide,
# second is the duplicate cell notes contents, in fixed font

sed -i.patched \
    "/Layout selector/ i\\
#speaker-controls>.speaker-controls-notes .inner_cell>.ctb_hideshow, \\
#speaker-controls>.speaker-controls-notes .inner_cell>.input_area { \\
    display: none; \\
}\\
" \
    $result_dir/notes.html

echo $result_dir/notes.js patched for RISE


