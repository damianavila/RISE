/* -*- coding: utf-8 -*-
* ----------------------------------------------------------------------------
* Copyright (c) 2013 - Damián Avila
*
* Distributed under the terms of the Modified BSD License.
*
* An IPython notebook extension to support *Live* Reveal.js-based slideshows.
* -----------------------------------------------------------------------------
*/

define([
        'require',
        'jquery',
        'base/js/utils',
        'services/config',
], function(require, $, utils, configmod) {

var config_section = new configmod.ConfigSection('livereveal',
                            {base_url: utils.get_body_data("baseUrl")});

config_section.load();

var config = new configmod.ConfigWithDefaults(config_section, {
    controls: true,
    progress: true,
    history: true,
    width: 1140,
    height: 855, // 4:3 ratio
    minScale: 1.0, //we need this for codemirror to work right
    theme: 'simple',
    transition: 'linear',
    slideNumber: true,
    start_slideshow_at: 'beginning',
});

Object.getPrototypeOf(IPython.notebook).get_cell_elements = function () {
  /*
  * Version of get_cell_elements that will see cell divs at any depth in the HTML tree,
  * allowing container divs, etc to be used without breaking notebook machinery.
  * You'll need to make sure the cells are getting detected in the right order.
  * NOTE: We use the Object prototype to workaround a firefox issue, check the following
  * link to know more about the discussion leading to this use:
  * https://github.com/damianavila/RISE/issues/117#issuecomment-127331816
  */
    return this.container.find("div.cell");
};

/* Use the slideshow metadata to rearrange cell DOM elements into the
 * structure expected by reveal.js
 */
function markupSlides(container) {
    // Machinery to create slide/subslide <section>s and give them IDs
    var slide_counter = -1, subslide_counter = -1;
    var slide_section, subslide_section;
    function new_slide() {
        slide_counter++;
        subslide_counter = -1;
        return $('<section>').appendTo(container);
    }
    function new_subslide() {
        subslide_counter++;
        return $('<section>').attr('id', 'slide-'+slide_counter+'-'+subslide_counter)
                .appendTo(slide_section);
    }

    // Containers for the first slide.
    slide_section = new_slide();
    subslide_section = new_subslide();
    var current_fragment = subslide_section;

    var selected_cell_idx = IPython.notebook.get_selected_index();
    var selected_cell_slide = [0, 0];

    // Special handling for the first slide: it will work even if the user
    // doesn't start with a 'Slide' cell. But if the user does explicitly
    // start with slide/subslide, we don't want a blank first slide. So we
    // don't create a new slide/subslide until there is visible content on
    // the first slide.
    var content_on_slide1 = false;

    var cells = IPython.notebook.get_cells();
    var i, cell, slide_type;

    for (i=0; i < cells.length; i++) {
        cell = cells[i];
        slide_type = (cell.metadata.slideshow || {}).slide_type;
        //~ console.log('cell ' + i + ' is: '+ slide_type);

        if (content_on_slide1) {
            if (slide_type === 'slide') {
                // Start new slide
                slide_section = new_slide();
                // In each subslide, we insert cells directly into the
                // <section> until we reach a fragment, when we create a div.
                current_fragment = subslide_section = new_subslide();
            } else if (slide_type === 'subslide') {
                // Start new subslide
                current_fragment = subslide_section = new_subslide();
            } else if (slide_type === 'fragment') {
                current_fragment = $('<div>').addClass('fragment')
                                    .appendTo(subslide_section);
            }
        } else if (slide_type !== 'notes' && slide_type !== 'skip') {
            // Subsequent cells should be able to start new slides
            content_on_slide1 = true;
        }

        // Record that this slide contains the selected cell
        if (i === selected_cell_idx) {
            selected_cell_slide = [slide_counter, subslide_counter];
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
    return selected_cell_slide;
}

/* Set the #slide-x-y part of the URL to control where the slideshow will start.
 * N.B. We do this instead of using Reveal.slide() after reveal initialises,
 * because that leaves one slide clearly visible on screen for a moment before
 * changing to the one we want. By changing the URL before setting up reveal,
 * the slideshow really starts on the desired slide.
 */
function setStartingSlide(selected) {
    var start_slideshow = config.get_sync('start_slideshow_at');
    if (start_slideshow === 'selected') {
        // Start from the selected cell
        window.location.hash = "/slide-"+selected[0]+"-"+selected[1];
    } else {
        // Start from the beginning
        window.location.hash = "/slide-0-0";
    }
}


function Revealer() {
  $('body').addClass("rise-enabled");
  // Prepare the DOM to start the slideshow
  //$('div#header').hide();
  //$('div#site').css("height", "100%");
  //$('div#ipython-main-app').css("position", "static");
  $('div#notebook').addClass("reveal");
  $('div#notebook-container').addClass("slides");

  // Header
  $('head').prepend('<link rel="stylesheet" href=' + require.toUrl("./reveal.js/css/theme/simple.css") + ' id="theme" />');
  $('head').prepend('<link rel="stylesheet" href=' + require.toUrl("./reset_reveal.css") + ' id="revealcss" />');

  // Tailer
  require(['./reveal.js/lib/js/head.min.js',
           './reveal.js/js/reveal.js'].map(require.toUrl),function(){
    // Full list of configuration options available here: https://github.com/hakimel/reveal.js#configuration

    var options = {
    controls: config.get_sync('controls'),
    progress: config.get_sync('progress'),
    history: config.get_sync('history'),

    // You can switch width and height to fix the projector
    width: config.get_sync('width'),
    height: config.get_sync('height'),
    minScale: config.get_sync('minScale'), //we need this for codemirror to work right)

    // available themes are in /css/theme
    theme: Reveal.getQueryHash().theme || config.get_sync('theme'),
    // default/cube/page/concave/zoom/linear/none
    transition: Reveal.getQueryHash().transition || config.get_sync('transition'),

    slideNumber: config.get_sync('slideNumber'),

    //parallaxBackgroundImage: 'https://raw.github.com/damianavila/par_IPy_slides_example/gh-pages/figs/star_wars_stormtroopers_darth_vader.jpg',
    //parallaxBackgroundSize: '2560px 1600px',

    keyboard: {
    13: null, // Enter disabled
    27: null, // ESC disabled
    38: null, // up arrow disabled
    40: null, // down arrow disabled
    66: null, // b, black pause disabled, use period or forward slash
    72: null, // h, left disabled
    74: null, // j, down disabled
    75: null, // k, up disabled
    76: null, // l, right disabled
    78: null, // n, down disable
    79: null, // o disabled
    80: null, // p, up disable
    // 83: null, // s, notes, but not working because notes is a plugin
    87: function() {Reveal.toggleOverview();}, // w, toggle overview
    188: function() {$('#help_b,#exit_b').fadeToggle();},
    },

    // Optional libraries used to extend on reveal.js
    // Notes are working partially... it opens the notebooks, not the slideshows...
    dependencies: [
            //{ src: "static/custom/livereveal/reveal.js/lib/js/classList.js", condition: function() { return !document.body.classList; } },
            //{ src: "static/custom/livereveal/reveal.js/plugin/highlight/highlight.js", async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
            { src: require.toUrl("./reveal.js/plugin/notes/notes.js"), async: true, condition: function() { return !!document.body.classList; } }
        ]
    };

    // Set up the Leap Motion integration if configured
    var leap = config.get_sync('leap_motion');
    if (leap !== undefined) {
        options.dependencies.push({ src: require.toUrl('./reveal.js/plugin/leap/leap.js'), async: true });
        options.leap = leap;
    }

    Reveal.initialize(options);

    Reveal.addEventListener( 'ready', function( event ) {
      Unselecter();
      window.scrollTo(0,0);
      Reveal.layout();
      $('#start_livereveal').blur();
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

function fixCellHeight(){
  // Let's start with all the cell unselected, the unselect the current selected one
  var scell = IPython.notebook.get_selected_cell()
  scell.unselect()
  // This select/unselect code cell triggers the "correct" heigth in the codemirror instance
  var cells = IPython.notebook.get_cells();
  for(var i in cells){
    var cell = cells[i];
    if (cell.cell_type === "code") {
      cell.select()
      cell.unselect();
    }
  }
}

function setupKeys(mode){
  if (mode === 'reveal_mode') {
    IPython.keyboard_manager.command_shortcuts.set_shortcut("shift-enter", "ipython.execute-in-place")
    IPython.keyboard_manager.edit_shortcuts.set_shortcut("shift-enter", "ipython.execute-in-place")
  } else if (mode === 'notebook_mode') {
    IPython.keyboard_manager.command_shortcuts.set_shortcut("shift-enter", "ipython.run-select-next")
    IPython.keyboard_manager.edit_shortcuts.set_shortcut("shift-enter", "ipython.run-select-next")
  }
}

function KeysMessager() {
  var message = $('<div/>').append(
                  $("<p/></p>").addClass('dialog').html(
                    "<ul>" +
                      "<li><kbd>Alt</kbd>+<kbd>r</kbd>: Enter/Exit RISE</li>" +
                      "<li><kbd>w</kbd>: Toggle overview mode</li>" +
                      "<li><kbd>,</kbd>: Toggle help and exit buttons</li>" +
                      "<li><kbd>Home</kbd>: First slide</li>" +
                      "<li><kbd>End</kbd>: Last slide</li>" +
                      "<li><kbd>space</kbd>: Next</li>" +
                      "<li><kbd>Shift</kbd>+<kbd>space</kbd>: Previous</li>" +
                      "<li><kbd>PgUp</kbd>: Up</li>" +
                      "<li><kbd>PgDn</kbd>: Down</li>" +
                      "<li><kbd>left</kbd>: Left</li>" +
                      "<li><kbd>right</kbd>: Right</li>" +
                      "<li><kbd>.</kbd> or <kbd>/</kbd>: black screen</li>" +
                    "</ul>" +
                    "<b>NOTE: You have to use these shortcuts in command mode.</b>"
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
        .addClass('fa-question fa-4x fa')
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
        .addClass('fa-times-circle fa-4x fa')
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
  Reveal.configure({minScale: 1.0});
  Reveal.removeEventListeners();
  $('body').removeClass("rise-enabled");
  IPython.menubar._size_header();

  $('div#notebook').removeClass("reveal");
  $('div#notebook-container').removeClass("slides");
  $('div#notebook-container').css('width','');
  $('div#notebook-container').css('height','');
  $('div#notebook-container').css('zoom','');

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
  $('.end_space').appendTo('div#notebook');
  IPython.page.show_site();
}

function revealMode() {
  /*
  * We search for a class tag in the maintoolbar to check if reveal mode is "on".
  * If the tag exits, we exit. Otherwise, we enter the reveal mode.
  */
  var tag = $('#maintoolbar').hasClass('reveal_tagging');

  if (!tag) {
    // Preparing the new reveal-compatible structure
    var selected_slide = markupSlides($('div#notebook-container'));
    // Set the hash part of the URL
    setStartingSlide(selected_slide);
    // Adding the reveal stuff
    Revealer();
    // Minor modifications for usability
    setupKeys("reveal_mode");
    buttonExit();
    buttonHelp();
    $('#maintoolbar').addClass('reveal_tagging');
  } else {
    Remover();
    setupKeys("notebook_mode");
    $('#exit_b').remove();
    $('#help_b').remove();
    $('#maintoolbar').removeClass('reveal_tagging');
    // Workaround... should be a better solution. Need to investigate codemirror
    fixCellHeight();
  }
}

function setup() {
  $('head').append('<link rel="stylesheet" href=' + require.toUrl("./main.css") + ' id="maincss" />');

  IPython.toolbar.add_buttons_group([
    {
    'label'   : 'Enter/Exit Live Reveal Slideshow',
    'icon'    : 'fa-bar-chart-o',
    'callback': function(){ revealMode(); },
    'id'      : 'start_livereveal'
    },
  ]);
  var document_keydown = function(event) {
    if (event.which == 82 && event.altKey) {
      revealMode();
      return false;
    }
    return true;
  };
  $(document).keydown(document_keydown);
}

setup.load_ipython_extension = setup;

return setup;
});
