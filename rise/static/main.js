/* -*- coding: utf-8; js-indent-level: 2 -*-
 * ----------------------------------------------------------------------------
 * Copyright (c) 2013-2017 Damián Avila and contributors.
 *
 * Distributed under the terms of the Modified BSD License.
 *
 * A Jupyter notebook extension to support *Live* Reveal.js-based slideshows.
 * -----------------------------------------------------------------------------
 */

define([
  'require',
  'jquery',
  'base/js/namespace',
  'base/js/utils',
  'services/config',
], function(require, $, Jupyter, utils, configmod) {

  /*
   * Add customized config on top of the default options using the notebook metadata
   * or the config-derived values
   */
  function configSlides() {

    var default_config = {
      controls: true,
      progress: true,
      history: true,
      width: "100%",
      height: "100%",
      margin: 0.1,
      minScale: 1.0, // we need this for codemirror to work right
      theme: 'simple',
      transition: 'linear',
      slideNumber: true,
      /* describe where to start slideshow
       * can be either:
       * 'beginning' : start on first slide 
       * 'selected'  : start on current slide
       * xxx: could be useful to add more policies
       * like alowing to start on a hard-wired slide number
       */
      start_slideshow_at: 'selected',
      /* describe how to select cells when new contents
       * is displayed (new slide or new fragment)
       * can be either:
       * 'none' - no autoselect
       * 'code' - auto-select first code cell if any
       * 'first' - select first cell - should be
       * considered an experimental attempt, does
       * not seem very helpful in real life
       */
      auto_select: 'code',
      /* if auto_select is not 'none', this boolean
       * says if selection focuses on the current fragment
       * or considers the whole slide
       */
      auto_select_fragment: true,
      scroll: false,
      center: true,
      autolaunch: false,
    };

    var config_section = new configmod.ConfigSection(
      'livereveal',
      {base_url: utils.get_body_data("baseUrl")});
    config_section.load();

    /* dummy empty config section to load
     * the metadata + default as a ConfigWithDefaults object
     */
    var _config_section = new configmod.ConfigSection(
      '_livereveal',
      {base_url: utils.get_body_data("baseUrl")});
    _config_section.load();

    var final_config;

    var rise_meta = Jupyter.notebook.metadata.livereveal;

    if(rise_meta !== undefined && Object.keys(rise_meta).length > 0){
      final_config = $.extend(true, default_config, rise_meta);
      final_config = new configmod.ConfigWithDefaults(_config_section, final_config);
      console.log("RISE metadata detected. Using ONLY RISE metadata on top of the default config. Custom config disabled.")
    } else {
      final_config = new configmod.ConfigWithDefaults(config_section, default_config);
      console.log("No (or empty) RISE metadata. Using ONLY custom config (if exist) on top of the default config.")
    }

    return final_config

  }

  /*
   * Version of get_cell_elements that will see cell divs at any depth in the HTML tree,
   * allowing container divs, etc to be used without breaking notebook machinery.
   * You'll need to make sure the cells are getting detected in the right order.
   * NOTE: We use the Object prototype to workaround a firefox issue, check the following
   * link to know more about the discussion leading to this use:
   * https://github.com/damianavila/RISE/issues/117#issuecomment-127331816
   */
  Object.getPrototypeOf(Jupyter.notebook).get_cell_elements = function () {
    return this.container.find("div.cell");
  };

  /* uniform way to access slide type, whether the slideshow metadata is set or not
   * also sometimes slide_type is set to '-' by the toolbar 
   */
  function get_slide_type(cell) {
    var slide_type = (cell.metadata.slideshow || {}).slide_type;
    return ( (slide_type === undefined) || (slide_type == '-')) ? '' : slide_type;
  }

  function is_slide(cell)    {return get_slide_type(cell) == 'slide';}
  function is_subslide(cell) {return get_slide_type(cell) == 'subslide';}
  function is_fragment(cell) {return get_slide_type(cell) == 'fragment';}
  function is_regular(cell)  {return get_slide_type(cell) == '';}

  /* Use the slideshow metadata to rearrange cell DOM elements into the
   * structure expected by reveal.js
   *
   * in the process, each cell receives a 'smart_exec' tag that says
   * how to behave when the cell gets executed with Shift-Enter
   * this tag can be either
   * 'smart_exec_slide' : just do exec, which is what RISE did on all cells at first
   this is for the last cell on a (sub)slide
   i.e. if next cell is slide or subslide
   * 'smart_exec_fragment' : do exec + show next fragment
   if next cell is a fragment
   * 'smart_exec_next' : do the usual exec + select next like in classic notebook
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

    var selected_cell_idx = Jupyter.notebook.get_selected_index();
    var selected_cell_slide = [0, 0];

    /* Special handling for the first slide: it will work even if the user
     * doesn't start with a 'Slide' cell. But if the user does explicitly
     * start with slide/subslide, we don't want a blank first slide. So we
     * don't create a new slide/subslide until there is visible content on
     * the first slide.
     */
    var content_on_slide1 = false;

    var cells = Jupyter.notebook.get_cells();

    for (var i=0; i < cells.length; i++) {
      var cell = cells[i];
      var slide_type = get_slide_type(cell);

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
          // record the <div class='fragment'> element corresponding
          // to each fragment cell in the 'fragment_div' attribute
          cell.fragment_div = current_fragment = $('<div>').addClass('fragment')
            .appendTo(subslide_section);
        }
      } else if (slide_type !== 'notes' && slide_type !== 'skip') {
        // Subsequent cells should be able to start new slides
        content_on_slide1 = true;
      }

      // Record that this slide contains the selected cell
      // this is where we need i as set in the loop over cells
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

    /* set on all cells a smart_exec tag that says how smart exec
     * should behave on that cell
     * the fragment cell also get a smart_exec_next_fragment
     * attribute that points at the <div class='fragment'>
     * corresponding to the (usually immediately) next cell
     * that is a fragment cell
     */
    for (var i=0; i < cells.length; i++) {
      var cell = cells[i];
      // default is 'pinned' because this applies to the last cell
      var tag = 'smart_exec_slide';
      for (var j = i+1; j < cells.length; j++) {
        var next_cell = cells[j];
        var next_type = get_slide_type(next_cell);
        if ((next_type == 'slide') || (next_type) == 'subslide') {
          tag = 'smart_exec_slide';
          break;
        } else if (next_type == 'fragment') {
          tag = 'smart_exec_fragment';
          /* these cells are the last before a fragment
           * and when running smart-exec we'll want to know
           * if that fragment is visible, so we keep a link to
           * the <div class='fragment'> element of that (next)
           * fragment cell
           */
          cell.smart_exec_next_fragment = next_cell.fragment_div;
          break;
        } else if (next_type == '') {
          tag = 'smart_exec_next';
          break;
        }
      }
      cell.smart_exec = tag;
    }

    return selected_cell_slide;
  }

  /* Set the #slide-x-y part of the URL to control where the slideshow will start.
   * N.B. We do this instead of using Reveal.slide() after reveal initialises,
   * because that leaves one slide clearly visible on screen for a moment before
   * changing to the one we want. By changing the URL before setting up reveal,
   * the slideshow really starts on the desired slide.
   */
  function setStartingSlide(selected, config) {

    var start_slideshow_promise = config.get('start_slideshow_at');
    // We need the value after the promise resolution
    start_slideshow_promise.then(function(start_slideshow){
      if (start_slideshow === 'selected') {
        // Start from the selected cell
        Reveal.slide(selected[0], selected[1]);
      } else {
        // Start from the beginning
        Reveal.slide(0, 0);
      }
      setScrollingSlide(config);
    });

  }

  /* Setup the scrolling in the current slide if the config option is activated
   *  and the content is greater than 0.95 * slide height
   */
  function setScrollingSlide(config) {

    var scroll_promise = config.get('scroll');
    scroll_promise.then(function(scroll){
      if (scroll === true) {
        var h = $('.reveal').height() * 0.95;
        $('section.present').find('section')
          .filter(function() {
            return $(this).height() > h;
          })
          .css('height', 'calc(95vh)')
          .css('overflow-y', 'scroll')
          .css('margin-top', '20px');
      }
    });

  }

  /* Setup the auto-launch function, which checks metadata to see if
   * RISE should launch automatically when the notebook is opened.
   */
  function autoLaunch(config) {

    var autolaunch_promise = config.get('autolaunch');
    autolaunch_promise.then(function(autolaunch){
      if (autolaunch === true) {
        revealMode();
      }
    });

  }

  /* Setup a MutationObserver to call Reveal.sync when an output is generated.
   * This fixes issue #188: https://github.com/damianavila/RISE/issues/188
   */
  var outputObserver = null;
  function setupOutputObserver(config) {
    function mutationHandler(mutationRecords) {
      mutationRecords.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length) {
          Reveal.sync();
          setScrollingSlide(config);
        }
      });
    }

    var $output = $(".output");
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    outputObserver = new MutationObserver(mutationHandler);

    var observerConfig = { childList: true, characterData: false, attributes: false, subtree: false };
    $output.each(function () {
      outputObserver.observe(this, observerConfig);
    });
  }

  function disconnectOutputObserver() {
    if (outputObserver !== null) {
      outputObserver.disconnect();
    }
  }

  function addHeaderFooterOverlay(config) {
    let overlay = config.get_sync('overlay');
    let header =  config.get_sync('header');
    let footer =  config.get_sync('footer');
    let backimage =  config.get_sync('backimage');
    // minimum styling to make these 3 things look
    // like what their name says they should look
    let header_style = "position: absolute; top: 0px;";
    let footer_style = "position: absolute; bottom: 0px;";
    let backimage_style = "width: 100%; height: 100%;";

    let overlay_body = "";
    if (overlay) {
      overlay_body = overlay;
    } else {
      if (header)
        overlay_body += `<div id='rise-header' style='${header_style}'>${header}</div>`;
      if (backimage)
        overlay_body += `<img id='rise-backimage' style='${backimage_style}' src='${backimage}' />`;
      if (footer)
        overlay_body += `<div id='rise-footer' style='${footer_style}'>${footer}</div>`;
    }
    let overlay_div = `<div id='rise-overlay'>${overlay_body}</div>`;
    console.log(`adding overlay ${overlay_div}`);
    $('div.reveal').append(overlay_div);
  }

  function removeHeaderFooterOverlay() {
    // it's easier to remove than to hide, plus this way
    // changes in the metadata will be reflected each time
    // we enter reveal again   
    $('div#rise-overlay').remove();
  }

  function Revealer(selected_slide, config) {
    $('body').addClass("rise-enabled");
    // Prepare the DOM to start the slideshow
    $('div#header').hide();
    $('.end_space').hide();

    // Add the main reveal.js classes
    $('div#notebook').addClass("reveal");
    $('div#notebook-container').addClass("slides");

    // Header
    // Available themes are in static/css/theme
    var theme_promise = config.get('theme');
    theme_promise.then(function(theme){
      $('head')
        .prepend('<link rel="stylesheet" href='
                 + require.toUrl("./reveal.js/css/theme/" + theme + ".css")
                 + ' id="theme" />');
    });

    // Add reveal css
    $('head')
      .prepend('<link rel="stylesheet" href='
               + require.toUrl("./reveal.js/css/reveal.css")
               + ' id="revealcss" />');

    /* this policy of trying ./rise.css and then <notebook>.css
     * should be redefinable in the config
     */
    if (window.location.pathname.endsWith('.ipynb')) {
      // Attempt to load rise.css 
      $('head').append(`<link rel="stylesheet" href="./rise.css" id="rise-custom-css" />`);
      // Attempt to load CSS with the same path as the .ipynb but with .css extension instead
      let notebook_css = window.location.pathname.replace(/\.ipynb$/,'.css');
      $('head').append(`<link rel="stylesheet" href="${notebook_css}" id="notebook-custom-css" />`);

    }

    // Tailer
    require([
      './reveal.js/lib/js/head.min.js',
      './reveal.js/js/reveal.js'
    ].map(require.toUrl),
            function(){
              // Full list of configuration options available here:
              // https://github.com/hakimel/reveal.js#configuration

              Reveal.initialize();

              var options = {
                // All this config option load correctly just because of require-induced delay,
                // it would be better to catch them from the config.get promise.
                controls: config.get_sync('controls'),
                progress: config.get_sync('progress'),
                history: config.get_sync('history'),

                // You can switch width and height to fix the projector
                width: config.get_sync('width'),
                height: config.get_sync('height'),
                margin: config.get_sync('margin'),
                minScale: config.get_sync('minScale'), //we need this for codemirror to work right)

                // default/cube/page/concave/zoom/linear/none
                transition: config.get_sync('transition'),

                slideNumber: config.get_sync('slideNumber'),
                center: config.get_sync('center'),

                //parallaxBackgroundImage: 'https://raw.github.com/damianavila/par_IPy_slides_example/gh-pages/figs/star_wars_stormtroopers_darth_vader.jpg',
                //parallaxBackgroundSize: '2560px 1600px',

                keyboard: {
                  13: null, // Enter disabled
                  27: null, // ESC disabled
                  38: null, // up arrow disabled
                  40: null, // down arrow disabled
                  66: null, // b, black pause disabled, use period or forward slash
                  70: function () {fullscreenHelp();}, // disable fullscreen inside the slideshow, makes codemirror unrealiable
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
                  /* { src: "static/custom/livereveal/reveal.js/lib/js/classList.js",
                   *   condition: function() { return !document.body.classList; } },
                   * { src: "static/custom/livereveal/reveal.js/plugin/highlight/highlight.js",
                   *   async: true,
                   *  callback: function() { hljs.initHighlightingOnLoad(); } },
                   */
                  { src: require.toUrl("./reveal.js/plugin/notes/notes.js"),
                    async: true,
                    condition: function() { return !!document.body.classList; } }
                ]
              };

              // Set up the Leap Motion integration if configured
              var leap = config.get_sync('leap_motion');
              if (leap !== undefined) {
                options.dependencies.push({ src: require.toUrl('./reveal.js/plugin/leap/leap.js'), async: true });
                options.leap = leap;
              }

              Reveal.configure(options);

              Reveal.addEventListener( 'ready', function( event ) {
                Unselecter();
                // check and set the scrolling slide when you start the whole thing
                setScrollingSlide(config);
                autoSelectHook(config);
              });

              Reveal.addEventListener( 'slidechanged', function( event ) {
                Unselecter();
                // check and set the scrolling slide every time the slide change
                setScrollingSlide(config);
                autoSelectHook(config);
              });

              Reveal.addEventListener( 'fragmentshown', function( event ) {
                autoSelectHook(config);
              });
              Reveal.addEventListener( 'fragmenthidden', function( event ) {
                autoSelectHook(config);
              });

              // Sync when an output is generated.
              setupOutputObserver(config);

              // Setup the starting slide
              setStartingSlide(selected_slide, config);
              addHeaderFooterOverlay(config);

            });
  }

  function Unselecter(){
    var cells = Jupyter.notebook.get_cells();
    for(var i in cells){
      var cell = cells[i];
      cell.unselect();
    }
  }

  function fixCellHeight(){
    // Let's start with all the cell unselected, the unselect the current selected one
    var scell = Jupyter.notebook.get_selected_cell()
    scell.unselect()
    // This select/unselect code cell triggers the "correct" heigth in the codemirror instance
    var cells = Jupyter.notebook.get_cells();
    for(var i in cells){
      var cell = cells[i];
      if (cell.cell_type === "code") {
        cell.select()
        cell.unselect();
      }
    }
  }

  /* from notebook/actions.js
   * jupyter-notebook:run-cell -> notebook.execute_selected_cells()
   * jupyter-notebook:run-cell-and-select-next -> notebook.execute_cell_and_select_below()
   */
  function smartExec() {
    // is it really the selected cell that matters ?
    var smart_exec = Jupyter.notebook.get_selected_cell().smart_exec;
    if (smart_exec == 'smart_exec_slide') {
      Jupyter.notebook.execute_selected_cells();
    } else if (smart_exec == "smart_exec_fragment") {
      // let's see if the next fragment is visible or not
      var cell = Jupyter.notebook.get_selected_cell();
      var fragment_div = cell.smart_exec_next_fragment;
      var visible = $(fragment_div).hasClass('visible');
      if (visible) {
        Jupyter.notebook.execute_cell_and_select_below();
      } else {
        Jupyter.notebook.execute_selected_cells();
      }
    } else {
      Jupyter.notebook.execute_cell_and_select_below();
    }
  }

  function setupKeys(mode){
    // Lets setup some specific keys for the reveal_mode
    if (mode === 'reveal_mode') {
      Jupyter.keyboard_manager.command_shortcuts.set_shortcut("shift-enter", "RISE:smart-exec");
      Jupyter.keyboard_manager.edit_shortcuts.set_shortcut("shift-enter", "RISE:smart-exec");
      // Save the f keyboard event for the Reveal fullscreen action
      Jupyter.keyboard_manager.command_shortcuts.remove_shortcut("f");
      Jupyter.keyboard_manager.command_shortcuts.set_shortcut("shift-f", "jupyter-notebook:find-and-replace");
    } else if (mode === 'notebook_mode') {
      Jupyter.keyboard_manager.command_shortcuts.set_shortcut("shift-enter", "jupyter-notebook:run-cell-and-select-next");
      Jupyter.keyboard_manager.edit_shortcuts.set_shortcut("shift-enter", "jupyter-notebook:run-cell-and-select-next");
      Jupyter.keyboard_manager.command_shortcuts.remove_shortcut("shift-f");
      Jupyter.keyboard_manager.command_shortcuts.set_shortcut("f", "jupyter-notebook:find-and-replace");
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

    Jupyter.dialog.modal({
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
        .css('z-index', '30')
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
        .attr('title','Exit RISE')
        .addClass('fa-times-circle fa-4x fa')
        .addClass('my-main-tool-bar')
        .css('position','fixed')
        .css('top','0.5em')
        .css('left','0.48em')
        .css('opacity', '0.6')
        .css('z-index', '30')
        .click(revealMode);
    $('.reveal').after(exit_button);
  }

  function fullscreenHelp() {
    var message = $('<div/>').append(
      $("<p/></p>").addClass('dialog').html(
        "<b>Entering Fullscreen mode from inside RISE is disabled.</b>" +
          "<br>" +
          "<b>Exit RISE, make you browser Fullscreen and re-enter RISE</b>" +
          "<br>" +
          "That will help Reveal.js to perform the correct transformations " +
          "at the time to interact with code cells."
      )
    );

    Jupyter.dialog.modal({
      title : "Fullscreen Help",
      body : message,
    buttons : {
        OK : {class: "btn-danger"}
    }
    });

  }

  function removeHash() {
    history.pushState("", document.title, window.location.pathname
                      + window.location.search);
  }

  function Remover(config) {
    Reveal.configure({minScale: 1.0});
    Reveal.removeEventListeners();
    $('body').removeClass("rise-enabled");
    $('div#header').show();

    $('div#notebook').removeClass("reveal");
    // woekaround to fix fade class conflicting between notebook and reveal css...
    if ($('div#notebook').hasClass('fade')) { $('div#notebook').removeClass("fade"); };
    $('div#notebook-container').removeClass("slides");
    $('div#notebook-container').css('width','');
    $('div#notebook-container').css('height','');
    $('div#notebook-container').css('zoom','');

    $('#theme').remove();
    $('#revealcss').remove();

    $('.backgrounds').hide();
    $('.progress').hide();
    $('.controls').hide();
    $('.slide-number').hide();
    $('.speaker-notes').hide();
    $('.pause-overlay').hide();
    $('div#aria-status-div').hide();

    var cells = Jupyter.notebook.get_cells();
    for(var i in cells){
      $('.cell:nth('+i+')').removeClass('reveal-skip');
      $('div#notebook-container').append(cells[i].element);
    }

    $('div#notebook-container').children('section').remove();
    $('.end_space').show();

    disconnectOutputObserver();
    removeHash();
    removeHeaderFooterOverlay();
  }

  /*
    using Reveal.getCurrentSlide() it is possible to get a lot of data 
    about where we are in the slideshow

    the following function inspects this and returns a triple
    [slide, subslide, fragments]

    slide and subslide both start at 0 (1st slide numbered 0)

    fragments is the number of <fragments> tags currently showed
    that is to say, **in addition** to the slide beginning
    note that a jupyter cell cannot be a slide *and* a fragment at the same time
    the first slide however may be different as the first cell may be a fragment
    which I chose not to support for now
    bottom line: is fragments also starts at 0

    ---------- historical note

    in a previous implementation - for traditional notebooks - 
    we used to get slide and subslide from window.location.href
    however this in jupyter lab may be no longer possible

    in addition this is the way to go for getting info on the current fragment
  */
  function reveal_current_position() {
    let current_slide = Reveal.getCurrentSlide();
    // href of the form slide-2-3 
    let href = current_slide.id;
    let chunks = href.split('-');
    let slide = Number(chunks[1]);
    let subslide = Number(chunks[2]);
    let fragments = $(current_slide).find('div.fragment.visible').length;
    return [slide, subslide, fragments];
  }

  
  /* Just before exiting reveal mode, we run this function
   * whose job is to find the notebook index
   * for the first cell in the current (sub)slide
   * this allows to restore the notebook at the correct location,
   * i.e. with that cell being selected
   *
   * if cell_type is not set, returns the first cell in slide
   * otherwise, it returns the first cell of that type in slide
   * 
   * if auto_select_fragment is set to true, search is restricted to the current fragment
   * otherwise, the whole slide is considered
   * 
   * returns null if no match is found
   */
  function reveal_cell_index(notebook, cell_type=null, auto_select_fragment=false) {
    var [slide, subslide, fragment] = reveal_current_position();

    /* just scan all cells until we find one at that address
     * except that we need to start at -1 or 0 depending on
     * whether the first slide has a slide tag or not
     */
    var slide_counter = is_slide(notebook.get_cell(0)) ? -1 : 0;
    var subslide_counter = 0;
    var fragment_counter = 0;    
    var result = null;

    notebook.get_cells().forEach(function (cell, index) {
      if (result) {
        // keep it short: skip if we found already
        return;
      }
      if (is_slide(cell)) {
        slide_counter += 1;
        subslide_counter = 0;
      } else if (is_subslide(cell)) {
        subslide_counter += 1;
      }
      if ((slide_counter == slide) && (subslide_counter == subslide)) {
        // keep count of fragments but only on current slide
        if (is_fragment(cell)) {
	  fragment_counter += 1;
        }
        /* we're on the right slide
         * now: do we need to also worry about focusing on the right fragment ?
         * if auto_select_fragment is true, we only consider cells in the fragment
         * otherwise, the whole (sub)slide is considered valid
         */
        var fragment_match = (auto_select_fragment) ? (fragment_counter == fragment) : true;
        // we still need to match cell types
        if ( fragment_match &&
	     ((cell_type === null) || (cell.cell_type == cell_type))) {
	  result = index;
        }
      }
    })
    return result;
  }

  function registerJupyterActions() {

    // accessing Jupyter.actions directly results in a warning message
    // https://github.com/jupyter/notebook/issues/2401
    let actions = Jupyter.notebook.keyboard_manager.actions;

    // register main action
    actions.register({ help    : 'Enter/Exit RISE Slideshow',
                       handler : revealMode,
                     },
                     "slideshow", "RISE");

    actions.register({ help: "execute cell, and move to the next if on the same slide",
                       handler: smartExec,
                     },
                     "smart-exec", "RISE");

    // helpers for toggling slide_type
    function init_metadata_slideshow(optional_cell) {
      // use selected cell if not specified
      var cell = optional_cell || Jupyter.notebook.get_selected_cell();
      let metadata = cell.metadata;
      if (metadata.slideshow === undefined)
        metadata.slideshow = {};
      return metadata.slideshow;
    }

    // new_type can be any of 'slide' 'subslide' 'fragment' 'note' 'skip'
    function toggle_slide_type(new_type) {
      let slideshow = init_metadata_slideshow();
      slideshow.slide_type = (slideshow.slide_type == new_type) ? '' : new_type;
      Jupyter.CellToolbar.rebuild_all();
    }

    actions.register({ help   : '(un)set current cell as a Slide cell',
                       handler: function() { toggle_slide_type('slide'); }
                     },
                     "toggle-slide", "RISE");

    actions.register({ help   : '(un)set current cell as a Sub-slide cell',
                       handler: function() { toggle_slide_type('subslide'); }
                     },
                     "toggle-subslide", "RISE");

    actions.register({ help   : '(un)set current cell as a Fragment cell',
                       handler: function() { toggle_slide_type('fragment'); }
                     },
                     "toggle-fragment", "RISE");

    actions.register({ help   : '(un)set current cell as a Note cell',
                       handler: function() { toggle_slide_type('note'); }
                     },
                     "toggle-note", "RISE");

    actions.register({ help   : '(un)set current cell as a Skip cell',
                       handler: function() { toggle_slide_type('skip'); }
                     },
                     "toggle-skip", "RISE");


    actions.register({ help   : 'render all cells (all cells go to command mode)',
                       handler: function() {
                         Jupyter.notebook.get_cells().forEach(function(cell){
	                   cell.render();
                         })
                       }
                     },
                     "render-all-cells", "RISE");

    actions.register({ help   : 'edit all cells (all cells go to edit mode)',
                       handler: function() {
                         Jupyter.notebook.get_cells().forEach(function(cell){
	                   cell.unrender();
                         })
                       }
                     },
                     "edit-all-cells", "RISE");

  }

  // the entrypoint - call this to enter or exit reveal mode
  function revealMode() {
    // We search for a class tag in the maintoolbar to check if reveal mode is "on".
    // If the tag exits, we exit. Otherwise, we enter the reveal mode.
    var tag = $('#maintoolbar').hasClass('reveal_tagging');
    var config = configSlides()

    if (!tag) {
      // Preparing the new reveal-compatible structure
      var selected_slide = markupSlides($('div#notebook-container'));
      // Adding the reveal stuff
      Revealer(selected_slide, config);
      // Minor modifications for usability
      setupKeys("reveal_mode");
      buttonExit();
      buttonHelp();
      $('#maintoolbar').addClass('reveal_tagging');
    } else {
      var current_cell_index = reveal_cell_index(Jupyter.notebook);
      Remover(config);
      setupKeys("notebook_mode");
      $('#exit_b').remove();
      $('#help_b').remove();
      $('#maintoolbar').removeClass('reveal_tagging');
      // Workaround... should be a better solution. Need to investigate codemirror
      fixCellHeight();
      // select and focus on current cell
      Jupyter.notebook.select(current_cell_index);
      // Need to delay the action a little bit so it actually focus the selected slide
      setTimeout(function(){ Jupyter.notebook.get_selected_cell().ensure_focused(); }, 500);
    }
  }

  let autoSelectTimeout = 250;

  function autoSelectHook(config) {
    var auto_select_promise = config.get('auto_select');
    auto_select_promise.then(function(auto_select) {
      var cell_type =
          (auto_select == "code") ? 'code'
	  : (auto_select == "first") ? null
	  : undefined;

      /* turned off altogether */
      if (cell_type === undefined) {
	return;
      }

      var auto_select_fragment_promise = config.get('auto_select_fragment');
      auto_select_fragment_promise.then(function(auto_select_fragment) {
	setTimeout(function(){
	  var current_cell_index = reveal_cell_index(Jupyter.notebook, cell_type, auto_select_fragment);
	  // select and focus on current cell
	  Jupyter.notebook.select(current_cell_index)
	}, autoSelectTimeout);
      });
    })
  }

  
  function setup() {
    $('head').append('<link rel="stylesheet" href=' + require.toUrl("./main.css") + ' id="maincss" />');

    // register all known actions
    registerJupyterActions();

    // create button
    Jupyter.toolbar.add_buttons_group([{
      action  : "RISE:slideshow",
      icon    : 'fa-bar-chart-o',
      id      : 'RISE'
    }]);

    //////// bind to keyboard shortcut
    // main
    Jupyter.notebook.keyboard_manager.command_shortcuts.add_shortcut('alt-r', 'RISE:slideshow');
    // a selection of utilities - more for the sake of example
    Jupyter.notebook.keyboard_manager.command_shortcuts.set_shortcut('shift-i', 'RISE:toggle-slide');
    Jupyter.notebook.keyboard_manager.command_shortcuts.set_shortcut('shift-o', 'RISE:toggle-subslide');
    Jupyter.notebook.keyboard_manager.command_shortcuts.set_shortcut('shift-p', 'RISE:toggle-fragment');

    // autolaunch if specified in metadata
    var config = configSlides()
    autoLaunch(config);
  }

  setup.load_ipython_extension = setup;

  return setup;
});
