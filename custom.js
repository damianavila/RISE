// we want strict javascript that fails
// on ambiguous syntax
"using strict";

// to prevent timeout
requirejs.config({
    waitSeconds: 60
});

// do not use notebook loaded  event as it is re-triggerd on
// revert to checkpoint but this allow extension to be loaded
// late enough to work.

$([IPython.events]).on('app_initialized.NotebookApp', function(){

     require(['custom/livereveal/main'],function(livereveal){
       // livereveal.parameters('theme', 'transition', 'fontsize', static_prefix);
       //   * theme can be: simple, sky, beige, serif, solarized
       //   (you will need aditional css for default, night, moon themes).
       //   * transition can be: linear, zoom, fade, none
       livereveal.parameters('simple', 'zoom', ''); //'https://raw.github.com/damianavila/par_IPy_slides_example/gh-pages/figs/star_wars_stormtroopers_darth_vader.jpg');
       console.log('Live reveal extension loaded correctly');
     });

});
