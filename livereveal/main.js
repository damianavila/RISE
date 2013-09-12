/*
* ----------------------------------------------------------------------------
* Copyright (c) 2013 - Damián Avila
*
* Distributed under the terms of the Modified BSD License.
*
* An IPython notebook extension to support *Live* Reveal.js-based slideshows.
* -----------------------------------------------------------------------------
*/

IPython.layout_manager.app_height = function() {

  /*
  * We need to redefined this function because in the IPython codebase
  * the app_height function does not take into account the 'hmode' class
  * and the possibility to hide the 'menubar' bar.
  */

  var win = $(window);
  var w = win.width();
  var h = win.height();
  var header_height;
  if ($('div#header').hasClass('hmode')) {
    header_height = 0;
  }
  else {
    header_height = $('div#header').outerHeight(true);
  }
  var menubar_height;
  if ($('div#menubar').hasClass('hmode')) {
    menubar_height = 0;
  }
  else {
    menubar_height = $('div#menubar').outerHeight(true);
  }
  var toolbar_height;
  if ($('div#maintoolbar').hasClass('hmode')) {
    toolbar_height = 0;
  }
  else {
    toolbar_height = $('div#maintoolbar').outerHeight(true);
  }
  return h-header_height-menubar_height-toolbar_height;  // content height
}


function setupKeys(hfontsize){

  /* We need to add functions to some IPython keydown events
  *  to not conflict with keydown events from reveal.js
  *  and focus the cells properly inside the each slide
  *  NOTE: I had patched reveal.js (L2330 y L2332) to not trigger
  *  events with up and down arrows.
  */

  var key = IPython.utils.keycodes;

    $(document).keydown(function (event) {
        if (event.which === key.ENTER && event.shiftKey) {
            // hack to get ptoperly spaced li elements in the slideshow
            $('.cell').find('li').css('line-height', hfontsize);
            // hack to prevent select the cell in the next slide after execution
            var cell = IPython.notebook.get_selected_cell();
            if (!(cell instanceof IPython.CodeCell)) {
                IPython.notebook.select_prev();
            }
            return false;
        }
    });

  return true;

}


IPython.notebook.get_cell_elements = function () {

  /*
  * Version of get_cell_elements that will see cell divs at any depth in the HTML tree,
  * allowing container divs, etc to be used without breaking notebook machinery.
  * You'll need to make sure the cells are getting detected in the right order, but I think they will
  */

    return this.container.find("div.cell");
}

function setupDict(){
  var cells = IPython.notebook.get_cells();
  for(var i in cells){
    var cell = cells[i];
    if (cell.metadata.slideshow == undefined){
      cell.metadata.slideshow = {};
      cell.metadata.slideshow.slide_type = '-';
    }
    if (cell.metadata.internals == undefined){
      cell.metadata.internals = {};
      cell.metadata.internals.slide_type = '-';
    }
  }
}

function labelCells(){
  var cells = IPython.notebook.get_cells();
  for(var i=1; i< cells.length; i++){
    var cell = cells[i];
    var index = i - 1;
    if (cell.metadata.slideshow.slide_type == 'slide') {
      cells[i].metadata.internals.slide_type = 'slide';
      cells[index].metadata.slide_helper = 'slide_end';
      cells[index].metadata.internals.slide_helper = 'slide_end';
    }
    else if (cell.metadata.slideshow.slide_type == 'subslide'){
      cells[i].metadata.internals.slide_type = 'subslide';
      cells[index].metadata.slide_helper = 'subslide_end';
      cells[index].metadata.internals.slide_helper = 'subslide_end';
    }
    else if (cell.metadata.slideshow.slide_type == 'fragment'){
      cells[i].metadata.internals.slide_type = undefined;
      cells[index].metadata.slide_helper = undefined;
      cells[index].metadata.internals.slide_helper = undefined;
    }
    else if (cell.metadata.slideshow.slide_type == 'notes'){
      cells[i].metadata.internals.slide_type = undefined;
      cells[index].metadata.slide_helper = undefined;
      cells[index].metadata.internals.slide_helper = undefined;
    }
    else if (cell.metadata.slideshow.slide_type == 'skip'){
      cells[i].metadata.internals.slide_type = undefined;
      cells[index].metadata.slide_helper = undefined;
      cells[index].metadata.internals.slide_helper = undefined;
    }
    else if (cell.metadata.slideshow.slide_type == '-'){
      cells[i].metadata.internals.slide_type = undefined;
      cells[index].metadata.slide_helper = undefined;
      cells[index].metadata.internals.slide_helper = undefined;
    }
  }

  cells[0].metadata.slideshow.slide_type = 'slide';
  cells[0].metadata.internals.slide_type = 'slide';
  cells[cells.length - 1].metadata.slide_helper = "slide_end";
  cells[cells.length - 1].metadata.internals.slide_helper = "slide_end";

}

function labelIntraSlides(){
  var cells = IPython.notebook.get_cells();
  for(var i in cells){
    var cell = cells[i];
    if (cell.metadata.slideshow.slide_type == 'fragment') {
      $('.cell:nth('+i+')').addClass("fragment");
    }
    else if (cell.metadata.slideshow.slide_type == 'notes') {
      $('.cell:nth('+i+')').css('display','none');
    }
    else if (cell.metadata.slideshow.slide_type == 'skip') {
      $('.cell:nth('+i+')').css('display','none');
    }
  }
}

function Slider(begin, end, container) {
  var cells = IPython.notebook.get_cells();
  var counter = 0;
  for(var i=0; i<cells.length; i++){
    if (cells[i].metadata.slideshow.slide_type == begin) {
      var slide = [];
      $(container).append('<section id="'+begin+'_'+counter+'"></section>');
      for(var j=0; j<cells.length; j++){
        if (cells[i].metadata.slide_helper == end) {
          slide[j] = cells[i];
          break;
        }
        else if (cells[i].metadata.slide_helper != end) {
          slide[j] = cells[i];
          i++;
        }
      }
      console.log("slide:"+slide);
      slide[0].metadata.internals.slide_type = 'subslide';
      slide[slide.length - 1].metadata.internals.slide_helper = 'subslide_end';
      var counter2 = 0;
      for(var x=0; x<slide.length; x++){
        if (slide[x].metadata.internals.slide_type == 'subslide') {
          var subslide = [];
          $("section#"+begin+'_'+counter+"").append('<section id="subslide_'+counter+'_'+counter2+'"></section>');
          for(var y=0; y<slide.length; y++){
            if (slide[x].metadata.internals.slide_helper == 'subslide_end') {
              subslide[y] = slide[x];
              break;
            }
            else if (slide[x].metadata.internals.slide_helper != 'subslide_end') {
              subslide[y] = slide[x];
              x++;
            }
          }
          console.log("subslide:"+subslide);
          for(var z=0; z<subslide.length; z++){
            $("section#subslide_"+counter+'_'+counter2+"").append(subslide[z].element);
          }
          counter2++;
        }
      }
      counter++;
    }
  }
}

function Revealer(){

  $('.end_space').appendTo('div#notebook-container');

  $('div#notebook').addClass("reveal");
  $('div#notebook-container').addClass("slides");

}

function Header(hfontsize){

  $('head').append('<link rel="stylesheet" href="static/custom/livereveal/main.css" id="maincss" />');
  //<!--[if lt IE 9]>
  //<script src="//cdn.jsdelivr.net/reveal.js/2.4.0/lib/js/html5shiv.js"></script>
  //<![endif]-->

  //<!-- If the query includes 'print-pdf', use the PDF print sheet -->

  //<script>
  //document.write( '<link rel="stylesheet" href="//cdn.jsdelivr.net/reveal.js/2.4.0/css/print/' + ( window.location.search.match( /print-pdf/gi ) ? 'pdf' : 'paper' ) + '.css" type="text/css" media="print">' );
  //</script>

  //<!-- For syntax highlighting -->
  //$('head').prepend('<link rel="stylesheet" href="//cdn.jsdelivr.net/reveal.js/2.4.0/lib/css/zenburn.css" />');
  ////$('head').prepend('<link rel="stylesheet" href="static/reveal.js/lib/css/zenburn.css" />');

  //<!-- General and theme style sheets -->
  //$('head').prepend('<link rel="stylesheet" href="//cdn.jsdelivr.net/reveal.js/2.4.0/css/theme/simple.css" id="theme" />');
  //$('head').prepend('<link rel="stylesheet" href="//cdn.jsdelivr.net/reveal.js/2.4.0/css/reveal.css" />');
  $('head').prepend('<link rel="stylesheet" href="static/custom/livereveal/reveal.js/css/theme/simple.css" id="theme" />');
  $('head').prepend('<link rel="stylesheet" href="static/custom/livereveal/reveal.js/css/ipython_reveal.css" id="revealcss" />');
  $('.reveal').css('font-size', hfontsize);
  $('.cell').find('li').css('line-height', hfontsize);

}

function Tailer(ttheme, ttransition){

   /*
  requirejs.config({
    shim: {
      'static/custom/livereveal/reveal_config.js': ['custom/livereveal/reveal.js/js/reveal']
    }
  })

  require(['custom/livereveal/reveal.js/lib/js/head.min']);
  require(['custom/livereveal/reveal.js/js/reveal']);
  require(['static/custom/livereveal/reveal_config.js']);
  */

  require(['custom/livereveal/reveal.js/lib/js/head.min',
           'custom/livereveal/reveal.js/js/reveal'],function(){
    Config(ttheme, ttransition);
  });

}

function Unselecter(){

  var cells = IPython.notebook.get_cells();
  for(var i in cells){
    var cell = cells[i];
    cell.unselect();
  }

}

function Config(ctheme, ctransition) {

// Full list of configuration options available here: https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
controls: true,
progress: true,
history: true,
minScale: 1.0, //we need this to codemirror work right
//keyboard: false,

theme: Reveal.getQueryHash().theme || ctheme, // available themes are in /css/theme
transition: Reveal.getQueryHash().transition || ctransition, // default/cube/page/concave/zoom/linear/none

// Optional libraries used to extend on reveal.js
// Notes are working partially... it opens the notebooks, not the slideshows...
dependencies: [
//{ src: "static/custom/livereveal/reveal.js/lib/js/classList.js", condition: function() { return !document.body.classList; } },
//{ src: "static/custom/livereveal/reveal.js/plugin/highlight/highlight.js", async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
{ src: "static/custom/livereveal/reveal.js/plugin/notes/notes.js", async: true, condition: function() { return !!document.body.classList; } }
]
});

Reveal.addEventListener( 'ready', function( event ) {
  Unselecter();
  IPython.notebook.scroll_to_top();
  //console.log("unselecter");
});

Reveal.addEventListener( 'slidechanged', function( event ) {
  Unselecter();
  IPython.notebook.scroll_to_top();
  //console.log("slidechange");
});

}

function Remover(container) {

  $('div#notebook').removeClass("reveal");
  $('div#notebook').css('font-size', "100%");
  $('.cell').find('li').css('line-height', "20px");
  $('div#notebook-container').removeClass("slides");
  $('div#notebook-container').css('width','1170px');

  $('#maincss').remove();
  $('#theme').remove();
  $('#revealcss').remove();

  $('.progress').remove();
  $('.controls').remove();
  $('.state-background').remove();
  $('.pause-overlay').remove();

  var cells = IPython.notebook.get_cells();
  for(var i in cells){
    $('.cell:nth('+i+')').removeClass('fragment');
    $('.cell:nth('+i+')').css('display','block');
    $(container).append(cells[i].element);
  }

  $('div#notebook-container').children('section').remove();
  $('.end_space').appendTo('div#notebook-container');

}

function revealMode(rtheme, rtransition, rfontsize) {

  /*
  * We search for a class tag in the maintoolbar to if Zenmode is "on".
  * If not, to enter the Zenmode, we hide "menubar" and "header" bars and
  * we append a customized css stylesheet to get the proper styles.
  */

  var tag = $('#maintoolbar').hasClass('reveal_tagging');

  if (!tag) {

    $('#menubar').addClass('hmode');
    $('#header').addClass('hmode');

    setupDict();
    labelCells();
    labelIntraSlides();
    Slider('slide', 'slide_end', 'div#notebook-container');
    Revealer();
    Header(rfontsize);
    Tailer(rtheme, rtransition);
    setupKeys(rfontsize);

    $('#maintoolbar').addClass('reveal_tagging');

  }
  else{

    $('#menubar').removeClass('hmode');
    $('#header').removeClass('hmode');

    Remover('div#notebook-container');

    $('#maintoolbar').removeClass('reveal_tagging');

  }

  // And now we find the proper height and do a resize
  IPython.layout_manager.app_height();
  IPython.layout_manager.do_resize();

}

define(function() {
  return {
    parameters: function setup(param1, param2, param3) {
      IPython.toolbar.add_buttons_group([
        {
        'label'   : 'Enter/Exit Live Reveal Slideshow',
        'icon'    : 'icon-bar-chart',
        'callback': function(){revealMode(param1, param2, param3)},
        'id'      : 'start_livereveal'
        },
      ])
    }
  }
});
