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
};

// Compatibility between IPython series.
var slide_icon;
var exit_icon;
var help_icon;

if(IPython.version.substring(0, 1) === '2') {
    slide_icon = 'icon-bar-chart';
    exit_icon = 'icon-remove-sign icon-4x';
    help_icon = 'icon-question icon-4x';
    console.log("IPython version: 2.x");
} else if (IPython.version.substring(0, 1) === '3') {
    slide_icon = 'fa-bar-chart-o';
    exit_icon = 'fa-times-circle fa-4x fa';
    help_icon = 'fa-question fa-4x fa';
    console.log("IPython version: 3.x");
}

/* Use the slideshow metadata to rearrange cell DOM elements into the
 * structure expected by reveal.js
 */
function markupSlides(container) {
    var slide_section = $('<section>').appendTo(container);
    var subslide_section = $('<section>').appendTo(slide_section);
    var current_fragment = subslide_section;

    var cells = IPython.notebook.get_cells();
    var i, cell, slide_type;
    
    // Special handling for the first slide: it will work even if the user
    // doesn't start with a 'Slide' cell. But if the user does explicitly
    // start with slide/subslide, we don't want a blank first slide. So we
    // don't create a new slide/subslide until there is visible content on
    // the first slide.
    var content_on_slide1 = false;
    
    for (i=0; i < cells.length; i++) {
        cell = cells[i];
        slide_type = (cell.metadata.slideshow || {}).slide_type;
        //~ console.log('cell ' + i + ' is: '+ slide_type);
        
        if (content_on_slide1) {
            if (slide_type === 'slide') {
                // Start new slide
                slide_section = $('<section>').appendTo(container);
                subslide_section = $('<section>').appendTo(slide_section);
                current_fragment = subslide_section;
            } else if (slide_type === 'subslide') {
                // Start new subslide
                subslide_section = $('<section>').appendTo(slide_section);
                current_fragment = subslide_section;
            } else if (slide_type === 'fragment') {
                current_fragment = $('<div>').addClass('fragment')
                                    .appendTo(subslide_section);
            }
        } else if (slide_type !== 'notes' && slide_type !== 'skip') {
            // Subsequent cells should be able to start new slides
            content_on_slide1 = true;
        }
        
        // Move the cell element into the slide <section>
        // N.B. jQuery append takes the element out of the DOM where it was
        if (slide_type === 'notes') {
            // Notes are wrapped in an <aside> element
            subslide_section.append(
                $('<aside>').addClass('notes').append(cell.element)
            );
        } else {
            current_fragment.append(cell.element);
        }
        
        // Hide skipped cells
        if (slide_type === 'skip') {
            cell.element.addClass('reveal-skip');
        }
    }
    
    // Put .end_space back at the end after all the rearrangement
    $('.end_space').appendTo('div#notebook-container');
}

function Revealer(ttheme, ttransition, extra){
  extra = extra || {};
  // Prepare the DOM to start the slideshow
  $('div#header').hide();
  $('div#site').css("height", "100%");  
  $('div#ipython-main-app').css("position", "static");
  $('div#notebook').addClass("reveal");
  $('div#notebook-container').addClass("slides");

  // Header
  $('head').prepend('<link rel="stylesheet" href=' + require.toUrl("./nbextensions/livereveal/reveal.js/css/theme/simple.css") + ' id="theme" />');
  $('head').prepend('<link rel="stylesheet" href=' + require.toUrl("./nbextensions/livereveal/reset_reveal.css") + ' id="revealcss" />');
  $('head').append('<link rel="stylesheet" href=' + require.toUrl("./nbextensions/livereveal/main.css") + ' id="maincss" />');

  // Tailer
  require(['nbextensions/livereveal/reveal.js/lib/js/head.min',
           'nbextensions/livereveal/reveal.js/js/reveal'],function(){
    // Full list of configuration options available here: https://github.com/hakimel/reveal.js#configuration
        
    var options = {
    controls: true,
    progress: true,
    history: true,

    // You can switch widt and height to fix the proyector
    width: 1140,
    minScale: 1.0, //we need this to codemirror work right

    theme: Reveal.getQueryHash().theme || ttheme, // available themes are in /css/theme
    transition: Reveal.getQueryHash().transition || ttransition, // default/cube/page/concave/zoom/linear/none

    slideNumber:true,

    //parallaxBackgroundImage: 'https://raw.github.com/damianavila/par_IPy_slides_example/gh-pages/figs/star_wars_stormtroopers_darth_vader.jpg',
    //parallaxBackgroundSize: '2560px 1600px',

    keyboard: {
    13: null, // Enter disabled
    27: null, // ESC disabled
    79: null, // o disabled
    87: function() {Reveal.toggleOverview();}, // w, toggle overview
    38: null, // up arrow disabled
    40: null, // down arrow disabled
    80: null, // p, up disable
    78: null, // n, down disable
    75: null, // k, up disabled
    74: null, // j, down disabled
    72: null, // h, left disabled
    76: null, // l, right disabled
    66: null, // b, black pause disabled, use period or forward slash
    // 83: null, // s, notes, but not working because notes is a plugin 
    },

    // Optional libraries used to extend on reveal.js
    // Notes are working partially... it opens the notebooks, not the slideshows...
    dependencies: [
            //{ src: "static/custom/livereveal/reveal.js/lib/js/classList.js", condition: function() { return !document.body.classList; } },
            //{ src: "static/custom/livereveal/reveal.js/plugin/highlight/highlight.js", async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
            { src: require.toUrl("./nbextensions/livereveal/reveal.js/plugin/notes/notes.js"), async: true, condition: function() { return !!document.body.classList; } }
        ]
    };
    if(typeof(extra.leap)!== 'undefined'){
        options.dependencies.push({ src: require.toUrl('./nbextensions/livereveal/reveal.js/plugin/leap/leap.js'), async: true });
        options.leap = extra.leap;
    }
    Reveal.initialize(options);

    Reveal.addEventListener( 'ready', function( event ) {
      Unselecter();
      window.scrollTo(0,0);
      Reveal.layout();
    });

    Reveal.addEventListener( 'slidechanged', function( event ) {
      Unselecter();
      window.scrollTo(0,0);
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
  IPython.keyboard_manager.edit_shortcuts.remove_shortcut('shift-enter');
  IPython.keyboard_manager.edit_shortcuts.add_shortcut('shift-enter', function (event) {
    IPython.notebook.execute_cell();
    return false;
  });
}

function KeysMessager() {
  var message = $('<div/>').append(
                  $("<p/></p>").addClass('dialog').html(
                    "<ul>" +
                      "<li><b>alt + r</b>: Enter/Exit RISE</li>" +
                      "<li><b>w</b>: Toogle overview mode</li>" +
                      "<li><b>home</b>: First slide</li>" +
                      "<li><b>end</b>: Last slide</li>" +
                      "<li><b>space bar</b>: Next</li>" +
                      "<li><b>shift + space bar</b>: Previous</li>" +
                      "<li><b>pgup</b>: Up</li>" +
                      "<li><b>pgdn</b>: Down</li>" +
                      "<li><b>left arrow</b>: Left</li>" +
                      "<li><b>right arrow</b>: Right</li>" +
                      "<li><b>black screen</b>: Period (or forward slash)</li>" +
                    "</ul>" +
                    "<b>NOTE: You have to use this shortcuts in command mode.</b>"
                    )
                );

  IPython.dialog.modal({
    title : "Reveal Shortcuts Help",
    body : message,
    buttons : {
        OK : {class: "btn-danger"}
    }
  });
}

function buttonHelp() {
    var help_button = $('<i/>')
        .attr('id','help_b')
        .attr('title','Reveal Shortcuts Help')
        .addClass(help_icon)
        .addClass('my-main-tool-bar')
        .css('position','fixed')
        .css('bottom','0.5em')
        .css('left','0.6em')
        .css('opacity', '0.6')
        .click(
            function(){
                KeysMessager();
            }
        );
    $('.reveal').after(help_button);
}

function buttonExit() {
    var exit_button = $('<i/>')
        .attr('id','exit_b')
        .attr('title','RISE Exit')
        .addClass(exit_icon)
        .addClass('my-main-tool-bar')
        .css('position','fixed')
        .css('top','0.5em')
        .css('left','0.48em')
        .css('opacity', '0.6')
        .click(
            function(){
                revealMode('simple', 'zoom');
            }
        );
    $('.reveal').after(exit_button);
}

function Remover() {
  $('div#site').css("height", "");  
  $('div#site').css('background-color','');
  $("div#ipython-main-app").css("position", "");
  $('div#header').show();
  $('div#maintoolbar').show();
  if(IPython.version.substring(0, 1) === '3') {
    IPython.menubar._size_header();
  } else {
    $('#menubar-container').css('display','');
  }
  $('div#notebook').removeClass("reveal");
  $('div#notebook-container').removeClass("slides");
  $('div#notebook-container').css('width','');
  $('div#notebook-container').css('height','');
  $('div#notebook-container').css('zoom','');

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
    $('.cell:nth('+i+')').removeClass('reveal-skip');
    $('div#notebook-container').append(cells[i].element);
  }

  $('div#notebook-container').children('section').remove();
  $('.end_space').appendTo('div#notebook-container');

  if(IPython.version.substring(0, 1) === '2') {
    $('body.notebook_app').css("overflow-y", "");
    $('body.notebook_app').css("overflow-x", "");
    IPython.layout_manager.do_resize();
  }

}

function revealMode(rtheme, rtransition, extra) {
  /*
  * We search for a class tag in the maintoolbar to if Zenmode is "on".
  * If not, to enter the Zenmode, we hide "menubar" and "header" bars and
  * we append a customized css stylesheet to get the proper styles.
  */
  var tag = $('#maintoolbar').hasClass('reveal_tagging');

  if (!tag) {
    // Preparing the new reveal-compatible structure
    markupSlides($('div#notebook-container'));
    // Adding the reveal stuff
    Revealer(rtheme, rtransition, extra);
    // Minor modifications for usability
    setupKeys();
    buttonExit();
    buttonHelp();
    $('#maintoolbar').addClass('reveal_tagging');
  } else {
    Remover();
    $('#exit_b').remove();
    $('#help_b').remove();
    try{
     button_rise();
    }
    catch(e){
     console.log('An error has occurred: ' + e.message);
    }
    $('#maintoolbar').removeClass('reveal_tagging');
  }

  if(IPython.version.substring(0, 1) === '2') {
    $('body.notebook_app').css("overflow-y", "auto");
    $('body.notebook_app').css("overflow-x", "hidden");
    IPython.layout_manager.do_resize();
  }

}

define(function() {
  return {
    parameters: function setup(param1, param2, extra) {
      IPython.toolbar.add_buttons_group([
        {
        'label'   : 'Enter/Exit Live Reveal Slideshow',
        'icon'    : slide_icon,
        'callback': function(){ revealMode(param1, param2, extra); },
        'id'      : 'start_livereveal'
        },
      ]);
      var document_keydown = function(event) {
        if (event.which == 82 && event.altKey) {
          revealMode(param1, param2);
          return false;
        }
        return true;
      };
      $(document).keydown(document_keydown);
    }
  };
});
