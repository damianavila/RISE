# add /* at the beginning of line 11
sed -i.upstream '11 s_^_/*_' export/reveal.js/css/reveal.css
