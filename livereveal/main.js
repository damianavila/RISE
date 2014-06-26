/*
* ----------------------------------------------------------------------------
* Copyright (c) 2013 - Damián Avila
*
* Distributed under the terms of the Modified BSD License.
*
* An IPython notebook extension to support *Live* Reveal.js-based slideshows.
* -----------------------------------------------------------------------------
*/

IPython.notebook.get_cell_elements = function () {
  /*
  * Version of get_cell_elements that will see cell divs at any depth in the HTML tree,
  * allowing container divs, etc to be used without breaking notebook machinery.
  * You'll need to make sure the cells are getting detected in the right order.
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
      cells[i].metadata.internals.frag_number = i;
      var j=1;
      while (j < cells.length - i) {
        cells[i + j].metadata.internals.frag_helper = 'fragment_end';
        cells[i + j].metadata.internals.frag_number = i;
        j++;
      }
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
      $('.cell:nth('+i+')').attr('data-fragment-index', cell.metadata.internals.frag_number);
    }
    else if (cell.metadata.slideshow.slide_type == 'notes') {
      $('.cell:nth('+i+')').css('display','none');
    }
    else if (cell.metadata.slideshow.slide_type == 'skip') {
      $('.cell:nth('+i+')').css('display','none');
    }
    else if (cell.metadata.slideshow.slide_type == '-') {
      if (cell.metadata.internals.frag_helper == 'fragment_end') {
        $('.cell:nth('+i+')').addClass("fragment");
        $('.cell:nth('+i+')').attr('data-fragment-index', cell.metadata.internals.frag_number);
      }
    }
  }
}

function Slider(begin, end, container) {
  // Hiding header and menu
  $('#header').css('display','none');
  $('#menubar-container').css('display','none');

  /*
   * The crazy rearrangement, I read the following some months ago,
   * It applies here withou any doubts ;-)
   * "When I wrote this, only God and I understood what I was doing
   * Now, God only knows"
  */ 
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

  // Adding end_space after all the rearrangement
  $('.end_space').appendTo('div#notebook-container');
}

function HideMeCode(){
// Written by Arulalan.T <arulalant@gmil.com>
// Date : 13.02.2014
    var cells = IPython.notebook.get_cells();
     for(var i in cells){
        var cell = cells[i];
        if (cell instanceof IPython.CodeCell) {
            var input = cell.get_text();
            if (input.startsWith("#hideme")){
                // make input display as none. So that we can utilize that place
                cell.element.find('div.input')[0].style.display='none';
                // make output_prompt visibility as hidden. so output stays in
                // same region as other outputs region.
                cell.element.find('div.output_prompt')[0].style.visibility="hidden";
            }
        }
    }
}

function ShowMeCode(){
// Written by Arulalan.T <arulalant@gmil.com>
// Date : 13.02.2014
    var cells = IPython.notebook.get_cells();
     for(var i in cells){
        var cell = cells[i];
        if (cell instanceof IPython.CodeCell) {
            var input = cell.get_text();
            if (input.startsWith("#hideme")){
                // back to original
                cell.element.find('div.output_prompt')[0].style.visibility='inherit';
                cell.element.find('div.input')[0].style.display='';
            }
        }
    }
}

function Revealer(ttheme, ttransition, bgimgpath){
  // Bodier
  $('div#notebook').addClass("reveal");
  $('div#notebook-container').addClass("slides");

  // Header
  $('head').prepend('<link rel="stylesheet" href=' + require.toUrl("./custom/livereveal/reveal.js/css/theme/simple.css") + ' id="theme" />');
  $('head').prepend('<link rel="stylesheet" href=' + require.toUrl("./custom/livereveal/reset_reveal.css") + ' id="revealcss" />');
  $('head').append('<link rel="stylesheet" href=' + require.toUrl("./custom/livereveal/main.css") + ' id="maincss" />');

  // Tailer
  require(['custom/livereveal/reveal.js/lib/js/head.min',
           'custom/livereveal/reveal.js/js/reveal'],function(){
    // Full list of configuration options available here: https://github.com/hakimel/reveal.js#configuration
    Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    minScale: 1.0, //we need this to codemirror work right

    theme: Reveal.getQueryHash().theme || ttheme, // available themes are in /css/theme
    transition: Reveal.getQueryHash().transition || ttransition, // default/cube/page/concave/zoom/linear/none

    slideNumber:true,

    parallaxBackgroundImage: Reveal.getQueryHash().parallaxBackgroundImage || bgimgpath, 
    //'https://raw.github.com/damianavila/par_IPy_slides_example/gh-pages/figs/star_wars_stormtroopers_darth_vader.jpg',
    //parallaxBackgroundSize: '2560px 1600px',

    keyboard: {
    27: null, // ESC disabled
    79: null, // o disabled
    87: function() {Reveal.toggleOverview();},
    38: null, // up disabled
    40: null, // down disabled
    },

    // Optional libraries used to extend on reveal.js
    // Notes are working partially... it opens the notebooks, not the slideshows...
    dependencies: [
    //{ src: "static/custom/livereveal/reveal.js/lib/js/classList.js", condition: function() { return !document.body.classList; } },
    //{ src: "static/custom/livereveal/reveal.js/plugin/highlight/highlight.js", async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
    { src: require.toUrl("./custom/livereveal/reveal.js/plugin/notes/notes.js"), async: true, condition: function() { return !!document.body.classList; } }
    ]
    });

    Reveal.addEventListener( 'ready', function( event ) {
      Unselecter();
      HideMeCode();
      IPython.notebook.scroll_to_top();
    });

    Reveal.addEventListener( 'slidechanged', function( event ) {
      Unselecter();
      IPython.notebook.scroll_to_top();
    });
    
    Reveal.addEventListener( 'keydown', function( event ) {
        // Written by Arulalan.T <arulalant@gmail.com>
        // Date : 13.02.2014
        // shift and plus KEYS press together
        if (event.shiftKey && (event.keyCode === 107) ) {
            // prevent normal plus operator on current cell edit_mode,
            // when pressing shift and plus operator
            event.preventDefault();
            // make next as visibility in slideshow
            Reveal.down(); //alert(IPython.notebook.get_selected_index());
            var latest = -1;
            // find next CodeCell and go into edit mode if possible, else stay in next cell
            for (var i = IPython.notebook.get_selected_index()+1; i < IPython.notebook.ncells();i++) {
               var cell = IPython.notebook.get_cell(i);
               latest = i;
                if (cell instanceof IPython.CodeCell) {
                    IPython.notebook.select(i);
                    IPython.notebook.edit_mode();
                    Reveal.updateSlidesVisibility();
                    break;
                }
                // make next as visibility in slideshow
                Reveal.down();                       
    }

    // fix this after last code cell in the page, it should be unselect.
    // so that we can go to next slide by space bar
    // if ((latest <= IPython.notebook.get_selected_index()) && (latest !== -1)){
    // IPython.notebook.unselect(latest); alert('i'+i);
    // }

    }
    });
    
  });
}

function Unselecter(){
  var cells = IPython.notebook.get_cells();
  for(var i in cells){
    var cell = cells[i];
    cell.unselect();
  }
}

function setupKeys(){
  // command mode
  IPython.keyboard_manager.command_shortcuts.remove_shortcut('shift-enter');
  IPython.keyboard_manager.command_shortcuts.add_shortcut('shift-enter', function (event) {
    IPython.notebook.execute_cell();
    return false;
  });

  // edit mode
  IPython.keyboard_manager.edit_shortcuts.remove_shortcut('shift-enter')
  IPython.keyboard_manager.edit_shortcuts.add_shortcut('shift-enter', function (event) {
    IPython.notebook.execute_cell();
    return false;
  });
}

function buttonExit() {
    var exit_button = $('<i/>')
        .attr('id','exit')
        .attr('title','Exit')
        .addClass('icon-remove-sign icon-4x')
        .addClass('my-btn-close')
        .click(
            function(){ 
                Remover('div#notebook-container');
                $('#maintoolbar').removeClass('reveal_tagging');
                $('#exit').css('display', 'none');
                ShowMeCode();
            }
        );
    $('.reveal').after(exit_button);
}

function Remover() {
  $('#menubar-container').css('display','block');
  $('#header').css('display','block');

  $('div#notebook').removeClass("reveal");
  $('div#notebook-container').removeClass("slides");
  $('div#notebook-container').css('width','1170px');

  $('#maincss').remove();
  $('#theme').remove();
  $('#revealcss').remove();

  $('.progress').remove();
  $('.controls').remove();
  $('.slide-number').remove();
  $('.state-background').remove();
  $('.pause-overlay').remove();

  var cells = IPython.notebook.get_cells();
  for(var i in cells){
    $('.cell:nth('+i+')').removeClass('fragment');
    //$('.cell:nth('+i+')').css('display','block');
    $('div#notebook-container').append(cells[i].element);
  }

  $('div#notebook-container').children('section').remove();
  $('.end_space').appendTo('div#notebook-container');

  //IPython.layout_manager.do_resize();
}

function revealMode(rtheme, rtransition, bgimgpath) {
  /*
  * We search for a class tag in the maintoolbar to if Zenmode is "on".
  * If not, to enter the Zenmode, we hide "menubar" and "header" bars and
  * we append a customized css stylesheet to get the proper styles.
  */
  var tag = $('#maintoolbar').hasClass('reveal_tagging');

  if (!tag) {
    // Preparing the new reveal-compatible structure
    setupDict();
    labelCells();
    labelIntraSlides();
    Slider('slide', 'slide_end', 'div#notebook-container');
    // Adding the reveal stuff
    Revealer(rtheme, rtransition, bgimgpath);
    // Minor modifications for usability
    setupKeys();
    buttonExit();
    $('#maintoolbar').addClass('reveal_tagging');
  } else {
    Remover();
    $('#maintoolbar').removeClass('reveal_tagging');
  }

  // And now we find the proper height and do a resize
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
