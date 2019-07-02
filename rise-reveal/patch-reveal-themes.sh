#!/bin/bash

# trigger this from toplevel directory with
# 
# npm run patch-themes

# 
# when going to reveal-3.8.0 we found out that reveal's native themes 
# like simple, sky, and similar, failed to have their global background 
# show up in our slides
# 
# this script patches the original themes as shipping with reveal.js to
# fix this issue
# 
# (*) one thing that goes wrong is when reveal tries to tweak settings 
#     on just the 'body' tag; these don't make it to <body> because they 
#     are too general and get superseded by other css in the jupyter arena
#     so we replace these 'body {' definitions so they apply on
#     a more specific css selector
#
# (*) that is still not enough, it took a while to find out, but 
#     the body tag also needs background-attachment to be reset to fixed,
#     somehow something defines it to 'scroll' which breaks it for those themes
# 

[ -d node_modules ] || {
    echo "$0: need to npm install first"
}

for theme in export/reveal.js/css/theme/*.css; do
    # do those changes only once
    # there's no mention of rise-enabled in the stock reveal.js
    grep -q 'rise-enabled' $theme && { echo $theme already patched; continue; }
    echo patching theme $theme for RISE
    sed -i.patched \
        -e "/^body/ a\\
    /* PATCHED by $0 */\\
    background-attachment: fixed !important;" \
        -e "s|^body {|body.notebook_app.rise-enabled {|" \
        $theme  
done
