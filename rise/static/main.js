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

  "use strict";

  /*
   * load configuration
   *
   * 1) start from the hardwired settings (in this file)
   * 2) add settings configured in python; these typically can be
   *   2a) either in a legacy file named `livereveal.json`
   *   2b) or, with the official name, in `rise.json`
   * 3) add the settings from nbextensions_configurator (i.e. .jupyter/nbconfig/notebook.json)
   *    they should all belong in the 'rise' category
   *    the configurator came after the shift from 'livereveal' to 'rise'
   *    so no need to consider 'livereveal' here
   * 4) and finally add the settings from the notebook metadata
   *   4a) for legacy reasons: use the 'livereveal' key
   *   4b) for more consistency, then override with the 'rise' key
   *
   * configLoaded alters the complete_config object in place.
   * it will hold a consolidated set of all relevant settings with their priorities resolved
   *
   * it returns a promise that can be then'ed once the config is loaded
   *
   * setup waits for the config to be loaded before it actually enables keyboard shortcuts
   * and other menu items; so this means that the bulk of the code can assume that the config
   * is already loaded and does not need to worry about using promises, or
   * waiting for any asyncronous code to complete
   */

  let complete_config = {};

  // returns a promise; you can do 'then()' on this promise
  // to do stuff *after* the configuration is completely loaded
  function configLoaded() {

    // see rise.yaml for more details
    let hardwired_config = {

      // behaviour
      autolaunch: false,
      start_slideshow_at: 'selected',
      auto_select: 'code',
      auto_select_fragment: true,

      // aspect
      header: undefined,
      footer: undefined,
      backimage: undefined,
      overlay: undefined,

      // timeouts
      restore_timeout: 500,
      // when going too short, like 250, size of selected cell get odd
      auto_select_timeout: 500,

      // UI
      toolbar_icon: 'fa-bar-chart',
      shortcuts: {
        'slideshow' : 'alt-r',
        'toggle-slide': 'shift-i',
        'toggle-subslide': 'shift-b',
        'toggle-fragment': 'shift-g',
        // this can be helpful
        'rise-nbconfigurator': 'shift-c',
        // unassigned by default
        'toggle-notes': '',
        'toggle-skip': '',
      },

      // reveal native settings passed as-is
      // see also the 'inherited' variable below in Revealer below
      theme: 'simple',
      transition: 'linear',
      // xxx there might be a need to tweak this one when set
      // by the configurator, as e.g. 'false' or 'true' will result
      // in a string and not a boolean
      slideNumber: true,
      width: "100%",
      height: "100%",
      controls: true,
      progress: true,
      history: true,
      scroll: false,
      center: true,
      margin: 0.1,
      minScale: 1.0, // we need this for codemirror to work right
      // turn off reveal's help overlay that is by default bound to question mark / ?
      help: false,

      // plugins
      enable_chalkboard: false,
    };

    // honour the 2 names: 'livereveal' and 'rise'
    // use the ones in livereveal/legacy first
    // so they get overridden if redefined in rise
    let config_section_legacy = new configmod.ConfigSection(
      'livereveal',
      {base_url: utils.get_body_data("baseUrl")});
    // trigger an asynchronous load
    config_section_legacy.load();
    let config_section = new configmod.ConfigSection(
      'rise',
      {base_url: utils.get_body_data("baseUrl")});
    config_section.load();

    // this is also a ConfigSection object as per notebook/static/services/config.js
    let nbext_configurator = Jupyter.notebook.config;
    nbext_configurator.load();

    // with Promise.all we can wait for all 3 configs to have loaded
    return Promise.all([
      config_section_legacy.loaded,
      config_section.loaded,
      nbext_configurator.loaded,
    ]).then(
        // and now we can compute the layered config
        function() {
          // 1) initialize with hardwired defaults
          $.extend(true, complete_config, hardwired_config);
          // 2a) and 2b)
          $.extend(true, complete_config, config_section_legacy.data);
          $.extend(true, complete_config, config_section.data);
          // 3)
          $.extend(true, complete_config, nbext_configurator.data.rise);
          // 4a) from the notebook metadata
          let metadata_legacy = Jupyter.notebook.metadata.livereveal;
          $.extend(true, complete_config, metadata_legacy);
          // 4b) ditto
          let metadata = Jupyter.notebook.metadata.rise;
          $.extend(true, complete_config, metadata);
          // console.log("complete_config is OK");
        });
  }

  /*
   * this function is a heuristic that says if this notebook seems to
   * be meant to be a slideshow.
   * this primarily is for autolaunch, so that somebody who would
   * enable autolaunch in her ~/.jupyter/ area would not
   * see RISE trigger on every single notebook
   *
   * xxx note that this might take too long on large notebooks
   * a possible improvement would be to look for the first, say, 10 cells only
   * as a matter of fact, in most cases the first cell would be a slide cell really
   */
  function is_slideshow(notebook) {
    for (let cell of notebook.get_cells())
      if (is_slide(cell) || is_subslide(cell))
        return true;
    return false;
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
    let slide_type = (cell.metadata.slideshow || {}).slide_type;
    return ( (slide_type === undefined) || (slide_type == '-')) ? '' : slide_type;
  }

  function is_slide(cell)    {return get_slide_type(cell) == 'slide';}
  function is_subslide(cell) {return get_slide_type(cell) == 'subslide';}
  function is_fragment(cell) {return get_slide_type(cell) == 'fragment';}
  function is_skip(cell)     {return get_slide_type(cell) == 'skip';}
  function is_notes(cell)    {return get_slide_type(cell) == 'notes';}
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
    let slide_counter = -1, subslide_counter = -1;
    let slide_section, subslide_section;
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
    let current_fragment = subslide_section;

    let selected_cell_idx = Jupyter.notebook.get_selected_index();
    let selected_cell_slide = [0, 0];

    /* Special handling for the first slide: it will work even if the user
     * doesn't start with a 'Slide' cell. But if the user does explicitly
     * start with slide/subslide, we don't want a blank first slide. So we
     * don't create a new slide/subslide until there is visible content on
     * the first slide.
     */
    let content_on_slide1 = false;

    let cells = Jupyter.notebook.get_cells();

    for (let i=0; i < cells.length; i++) {
      let cell = cells[i];
      let slide_type = get_slide_type(cell);

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
    for (let i=0; i < cells.length; i++) {
      let cell = cells[i];
      // default is 'pinned' because this applies to the last cell
      let tag = 'smart_exec_slide';
      for (let j = i+1; j < cells.length; j++) {
        let next_cell = cells[j];
        let next_type = get_slide_type(next_cell);
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
  function setStartingSlide(selected) {

    let start_slideshow = complete_config.start_slideshow_at;
    if (start_slideshow === 'selected') {
      // Start from the selected cell
      Reveal.slide(selected[0], selected[1]);
    } else {
      // Start from the beginning
      Reveal.slide(0, 0);
    }
    setScrollingSlide();
  }

  /* Setup the scrolling in the current slide if the config option is activated
   *  and the content is greater than 0.95 * slide height
   */
  function setScrollingSlide() {

    let scroll = complete_config.scroll;
    if (scroll === true) {
      let h = $('.reveal').height() * 0.95;
      $('section.present').find('section')
        .filter(function() {
          return $(this).height() > h;
        })
        .css('height', 'calc(95vh)')
        .css('overflow-y', 'scroll')
        .css('margin-top', '20px');
    }
  }

  /*
   * Setup the auto-launch function, which checks metadata to see if
   * RISE should launch automatically when the notebook is opened.
   *
   * this will trigger only on notebooks that have
   * either a 'livereveal' or a 'rise' section in their metadata
   * this is because autolaunch can be enabled in nbextensions_configurator
   * and so can possibly have a too big impact if we are not careful
   */
  function autoLaunch() {
    if (complete_config.autolaunch && is_slideshow(Jupyter.notebook)) {
      revealMode();
    }

    // Ref: https://stackoverflow.com/a/7739035
    let url = (window.location != window.parent.location)
            ? document.referrer
            : document.location.href;
    let lastPart = url.substr(url.lastIndexOf('/') + 1);

    if (lastPart === "notes.html") {
      revealMode();
    }
  }

  /* Setup a MutationObserver to call Reveal.sync when an output is generated.
   * This fixes issue #188: https://github.com/damianavila/RISE/issues/188
   */
  let outputObserver = null;
  function setupOutputObserver() {
    function mutationHandler(mutationRecords) {
      mutationRecords.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length) {
          Reveal.sync();
          setScrollingSlide();
        }
      });
    }

    let $output = $(".output");
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    outputObserver = new MutationObserver(mutationHandler);

    let observerOptions = { childList: true,
                           characterData: false,
                           attributes: false,
                           subtree: false
                         };
    $output.each(function () {
      outputObserver.observe(this, observerOptions);
    });
  }

  function disconnectOutputObserver() {
    if (outputObserver !== null) {
      outputObserver.disconnect();
    }
  }

  function addHeaderFooterOverlay() {
    let overlay = complete_config.overlay;
    let header =  complete_config.header;
    let footer =  complete_config.footer;
    let backimage =  complete_config.backimage;
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
    $('div.reveal').append(overlay_div);
  }

  function removeHeaderFooterOverlay() {
    // it's easier to remove than to hide, plus this way
    // changes in the metadata will be reflected each time
    // we enter reveal again
    $('div#rise-overlay').remove();
  }

  function Revealer(selected_slide) {
    $('body').addClass("rise-enabled");
    // Prepare the DOM to start the slideshow
    $('div#header').hide();
    $('.end_space').hide();

    // Add the main reveal.js classes
    $('div#notebook').addClass("reveal");
    $('div#notebook-container').addClass("slides");

    // Header
    // Available themes are in static/css/theme
    let theme = complete_config.theme;
    $('head')
      .prepend('<link rel="stylesheet" href='
               + require.toUrl("./reveal.js/css/theme/" + theme + ".css")
               + ' id="theme" />');
    // Add reveal css
    $('head')
      .prepend('<link rel="stylesheet" href='
               + require.toUrl("./reveal.js/css/reveal.css")
               + ' id="revealcss" />');

    /* this policy of trying ./rise.css and then <notebook>.css
     * should be redefinable in the config
     */
    if (window.location.pathname.endsWith('.ipynb')) {
      // typically examples/README.ipynb
      let path = Jupyter.notebook.notebook_path;
      // typically README.ipynb
      let name = Jupyter.notebook.notebook_name;
      // asscosiated css
      let name_css = name.replace(".ipynb", ".css");
      // typically /files/examples/
      let prefix = `/files/${path.replace(name, '')}`;
      // Attempt to load rise.css
      $('head').append(
          `<link rel="stylesheet" href="${prefix}rise.css" id="rise-custom-css" />`);
      // Attempt to load css with the same path as notebook
      $('head').append(
          `<link rel="stylesheet" href="${prefix}${name_css}" id="notebook-custom-css" />`);

    }

    function toggleAllRiseButtons() {
        $('#help_b,#exit_b,#toggle-chalkboard,#toggle-notes').fadeToggle()
    }

    // Tailer
    require([
      './reveal.js/lib/js/head.min.js',
      './reveal.js/js/reveal.js'
    ].map(require.toUrl),
            function(){
              // Full list of configuration options available here:
              // https://github.com/hakimel/reveal.js#configuration


              // all these settings are passed along to reveal as-is
              // xxx it might be just better to copy the whole complete_config instead
              // of selecting some names, which would allow users to transparently use
              // all reveal's features
              let inherited = ['controls', 'progress', 'history', 'width', 'height', 'margin',
                               'minScale', 'transition', 'slideNumber', 'center', 'help'];

              let options = {

                //parallaxBackgroundImage: 'https://raw.github.com/damianavila/par_IPy_slides_example/gh-pages/figs/star_wars_stormtroopers_darth_vader.jpg',
                //parallaxBackgroundSize: '2560px 1600px',

                // turn off reveal native help
                help: false,

                keyboard: {
                  13: null, // Enter disabled
                  27: null, // ESC disabled
                  38: null, // up arrow disabled
                  40: null, // down arrow disabled
                  66: null, // b, black pause disabled, use period or forward slash
                  70: fullscreenHelp, // disable fullscreen inside the slideshow, makes codemirror unreliable
                  72: null, // h, left disabled
                  74: null, // j, down disabled
                  75: null, // k, up disabled
                  76: null, // l, right disabled
                  78: null, // n, down disabled
                  79: null, // o disabled
                  80: null, // p, up disabled
                  // 84: RevealNotes.open, // t, modified in the custom notes plugin.
                  87: Reveal.toggleOverview, // w, toggle overview
                  188: toggleAllRiseButtons, // comma
                },

                dependencies: [
                  // Optional libraries used to extend on reveal.js
                  /* { src: "static/custom/livereveal/reveal.js/lib/js/classList.js",
                   *   condition: function() { return !document.body.classList; } },
                   * { src: "static/custom/livereveal/reveal.js/plugin/highlight/highlight.js",
                   *   async: true,
                   *  callback: function() { hljs.initHighlightingOnLoad(); } },
                   */
                  { src: require.toUrl("./notes_rise/notes.js"),
                    async: true,
                  },
                ],

              };

              for (let setting of inherited) {
                options[setting] = complete_config[setting];
              }

              ////////// set up the leap motion integration if configured
              let enable_leap_motion = complete_config.enable_leap_motion;
              if (enable_leap_motion) {
                options.dependencies.push({ src: require.toUrl('./reveal.js/plugin/leap/leap.js'), async: true });
                options.leap = enable_leap_motion;
              }

              ////////// set up chalkboard if configured
              let enable_chalkboard = complete_config.enable_chalkboard;
              if (enable_chalkboard) {
                options.dependencies.push({ src: require.toUrl('./reveal.js-chalkboard/chalkboard.js'), async: true });
                // xxx need to explore the option of registering jupyter actions
                // and have jupyter handle the keyboard entirely instead of this approach
                // could hopefully avoid conflicting behaviours in case of overlaps
                $.extend(options.keyboard, {
                           // for chalkboard; also bind uppercases just in case
                           63:  riseHelp,                               // '?' show our help
                           // can't use just RevealChalkboard.reset directly here
                           // because RevealChalkboard is not yet loaded at that time
                           187: () => RevealChalkboard.reset(),             // '=' reset chalkboard data on current slide
                           189: () => RevealChalkboard.clear(),             // '-' clear full size chalkboard
                           219: () => RevealChalkboard.toggleChalkboard(),  // '[' toggle full size chalkboard
                           221: () => RevealChalkboard.toggleNotesCanvas(), // ']' toggle notes (slide-local)
                           220: () => RevealChalkboard.download(),          // '\' download recorded chalkboard drawing
                         });
              }

              if (Reveal.initialized) {
                //delete options["dependencies"];
                Reveal.configure(options);
                //console.log("Reveal is already initialized and is being configured");
              } else {
                Reveal.initialize(options);
                Reveal["initialized"] = true;
                //console.log("Reveal initialized");
              }

              Reveal.addEventListener('ready', function(event) {
                Unselecter();
                // check and set the scrolling slide when you start the whole thing
                setScrollingSlide();
                autoSelectHook();
              });

              Reveal.addEventListener('slidechanged', function(event) {
                Unselecter();
                // check and set the scrolling slide every time the slide change
                setScrollingSlide();
                autoSelectHook();
              });

              Reveal.addEventListener('fragmentshown', function(event) {
                autoSelectHook();
              });
              Reveal.addEventListener('fragmenthidden', function(event) {
                autoSelectHook();
              });

              // Sync when an output is generated.
              setupOutputObserver();

              // Setup the starting slide
              setStartingSlide(selected_slide);
              addHeaderFooterOverlay();

            });
  }

  function Unselecter(){
    let cells = Jupyter.notebook.get_cells();
    for (let cell of cells){
      cell.unselect();
    }
  }

  function fixCellHeight(){
    // Let's start with all the cell unselected, the unselect the current selected one
    let scell = Jupyter.notebook.get_selected_cell();
    scell.unselect();
    // This select/unselect code cell triggers the "correct" heigth in the codemirror instance
    let cells = Jupyter.notebook.get_cells();
    for (let cell of cells){
      if (cell.cell_type === "code") {
        cell.select();
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
    let smart_exec = Jupyter.notebook.get_selected_cell().smart_exec;
    if (smart_exec == 'smart_exec_slide') {
      Jupyter.notebook.execute_selected_cells();
    } else if (smart_exec == "smart_exec_fragment") {
      // let's see if the next fragment is visible or not
      let cell = Jupyter.notebook.get_selected_cell();
      let fragment_div = cell.smart_exec_next_fragment;
      let visible = $(fragment_div).hasClass('visible');
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
      // see also #375
      try {
        Jupyter.keyboard_manager.command_shortcuts.remove_shortcut("f");
        Jupyter.keyboard_manager.command_shortcuts.set_shortcut("shift-f", "jupyter-notebook:find-and-replace");
      } catch(error) {
        console.log(`entering RISE : could not remove shortcut 'f' - ignored`);
      }
    } else if (mode === 'notebook_mode') {
      Jupyter.keyboard_manager.command_shortcuts.set_shortcut("shift-enter", "jupyter-notebook:run-cell-and-select-next");
      Jupyter.keyboard_manager.edit_shortcuts.set_shortcut("shift-enter", "jupyter-notebook:run-cell-and-select-next");
      try {      
        Jupyter.keyboard_manager.command_shortcuts.remove_shortcut("shift-f");
        Jupyter.keyboard_manager.command_shortcuts.set_shortcut("f", "jupyter-notebook:find-and-replace");
      } catch(error) {
        console.log(`exiting RISE : could not remove shortcut 'shift-f' - ignored`);
      }
    }
  }

  function riseHelp() {
    let message = $('<div/>').append(
      $("<p/></p>").addClass('dialog').html(
        "<ul>" +
          "<li><kbd>Alt</kbd>+<kbd>r</kbd>: enter/exit RISE</li>" +
          "<li><kbd>Space</kbd>: next</li>" +
          "<li><kbd>Shift</kbd>+<kbd>Space</kbd>: previous</li>" +
          "<li><kbd>Shift</kbd>+<kbd>Enter</kbd>: eval and select next cell if visible</li>" +
          "<li><kbd>Home</kbd>: first slide</li>" +
          "<li><kbd>End</kbd>: last slide</li>" +
          "<li><kbd>w</kbd>: toggle overview mode</li>" +
          "<li><kbd>t</kbd>: toggle notes</li>" +
          "<li><kbd>,</kbd>: toggle help and exit buttons</li>" +
          "<li><kbd>/</kbd>: black screen</li>" +
          "<li><strong>less useful:</strong>" +
            "<ul>" +
            "<li><kbd>PgUp</kbd>: up</li>" +
            "<li><kbd>PgDn</kbd>: down</li>" +
            "<li><kbd>Left Arrow</kbd>: left <em>(note: Space preferred)</em></li>" +
            "<li><kbd>Right Arrow</kbd>: right <em>(note: Shift Space preferred)</em></li>" +
            "</ul>" +
          "<li><strong>with chalkboard enabled:</strong>" +
            "<ul>" +
            "<li><kbd>[</kbd> toggle fullscreen chalkboard</li>" +
            "<li><kbd>]</kbd> toggle slide-local canvas</li>" +
            "<li><kbd>\\</kbd> download chalkboard drawing</li>" +
            "<li><kbd>=</kbd> clear slide-local canvas</li>" +
            "<li><kbd>-</kbd> delete fullscreen chalkboard</li>" +
            "</ul>" +
          "</ul>" +
          "<b>NOTE</b>: of course you have to use these shortcuts <b>in command mode.</b>"
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
    let help_button = $('<i/>')
        .attr('id','help_b')
        .attr('title','Reveal Shortcuts Help')
        .addClass('fa-question fa-4x fa')
        .addClass('my-main-tool-bar')
        .click(riseHelp);
    $('.reveal').after(help_button);
  }

  function buttonExit() {
    let exit_button = $('<i/>')
        .attr('id','exit_b')
        .attr('title','Exit RISE')
        .addClass('fa-times-circle fa-4x fa')
        .addClass('my-main-tool-bar')
        .click(revealMode);
    $('.reveal').after(exit_button);
  }

  function fullscreenHelp() {
    let message = $('<div/>').append(
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

  function Remover() {
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

    let cells = Jupyter.notebook.get_cells();
    for(let i in cells){
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
    /* scan all cells until we find one that matches current reveal location
     * need to deal carefully with beginning of that process because
     * (.) we do not impose a starting 'slide', and
     * (.) the first cell(s) might be of type 'skip'
     *     which then must not be counted
     */
    let [slide, subslide, fragment] = reveal_current_position();

    // start at slide -1 because we don't impose a starting 'slide'
    let [slide_counter, subslide_counter, fragment_counter] = [-1, 0, 0];
    let result = null;

    let cells = notebook.get_cells();
    for (let index in cells) {
        let cell = cells[index];
        // ignore skip cells no matter what
        if (is_skip(cell) || is_notes(cell))
          continue;
        // a slide always increments, even at the start, since we begin at -1
        if (is_slide(cell)) {
            slide_counter += 1;
            subslide_counter = 0;
        }
        // if we see anything else then we're on a visible slide
        // that has to be at least 0
        slide_counter = Math.max(slide_counter, 0);
        if (is_subslide(cell)) {
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
        let fragment_match = (auto_select_fragment) ? (fragment_counter == fragment) : true;
        // we still need to match cell types
        if ( fragment_match &&
	         ((cell_type === null) || (cell.cell_type == cell_type))) {
	      return index;
        }
      }
    }
    // for consistency with previous implementations
    return null;
  }

  function registerJupyterActions() {

    // accessing Jupyter.actions directly results in a warning message
    // https://github.com/jupyter/notebook/issues/2401
    let actions = Jupyter.notebook.keyboard_manager.actions;

    // register main action
    actions.register(
        {help:    "Enter/Exit RISE Slideshow",
         handler: revealMode},
        "slideshow", "RISE");

    actions.register(
        {help:    "execute cell, and move to the next if on the same slide",
         handler: smartExec},
        "smart-exec", "RISE");

    // helpers for toggling slide_type
    function init_metadata_slideshow(optional_cell) {
      // use selected cell if not specified
      let cell = optional_cell || Jupyter.notebook.get_selected_cell();
      let metadata = cell.metadata;
      if (metadata.slideshow === undefined)
        metadata.slideshow = {};
      return metadata.slideshow;
    }

    // new_type can be any of 'slide' 'subslide' 'fragment' 'notes' 'skip'
    function toggle_slide_type(new_type) {
      let slideshow = init_metadata_slideshow();
      slideshow.slide_type = (slideshow.slide_type == new_type) ? '' : new_type;
      Jupyter.CellToolbar.rebuild_all();
    }

    actions.register(
        {help   : '(un)set current cell as a Slide cell',
         handler: () => toggle_slide_type('slide')},
        "toggle-slide", "RISE");

    actions.register(
        {help   : '(un)set current cell as a Sub-slide cell',
         handler: () => toggle_slide_type('subslide')},
        "toggle-subslide", "RISE");

    actions.register(
        {help   : '(un)set current cell as a Fragment cell',
         handler: () => toggle_slide_type('fragment')},
        "toggle-fragment", "RISE");

    actions.register(
        {help   : '(un)set current cell as a Note cell',
         handler: () => toggle_slide_type('notes')},
        "toggle-notes", "RISE");

    actions.register(
        {help   : '(un)set current cell as a Skip cell',
         handler: () => toggle_slide_type('skip')},
        "toggle-skip", "RISE");


    actions.register(
        {help   : 'render all cells (all cells go to command mode)',
         handler: () => Jupyter.notebook.get_cells().forEach(
             cell => cell.render())},
        "render-all-cells", "RISE");

    actions.register(
        {help   : 'edit all cells (all cells go to edit mode)',
         handler: () => Jupyter.notebook.get_cells().forEach(
            cell => cell.unrender())},
        "edit-all-cells", "RISE");

    // because the `Edit Keyboard Shortcuts` utility does not mention the
    // actions prefix (i.e. 'RISE' in our case), we choose to make these two
    // action names start with `rise-` even if it's a bit redundant.

    // define an action that goes to the nbconfigurator page for rise
    let nbconfigurator = function() {
      let url = "/nbextensions/?nbextension=rise/main";
      window.open(url, '_blank');
    }

    actions.register(
        {help: 'open the nbconfigurator page for RISE',
         handler: nbconfigurator},
        "rise-nbconfigurator", "RISE");

    // mostly for debug / information
    actions.register(
        {help   : 'output RISE configuration in console, for debugging mostly',
         handler: showConfig},
        "rise-dump-config", "RISE");

  }


  // the entrypoint - call this to enter or exit reveal mode
  function revealMode() {
    // We search for a class tag in the maintoolbar to check if reveal mode is "on".
    // If the tag exits, we exit. Otherwise, we enter the reveal mode.
    let tag = $('#maintoolbar').hasClass('reveal_tagging');

    if (!tag) {
      // Preparing the new reveal-compatible structure
      let selected_slide = markupSlides($('div#notebook-container'));
      // Adding the reveal stuff
      Revealer(selected_slide);
      // Minor modifications for usability
      setupKeys("reveal_mode");
      buttonExit();
      buttonHelp();
      $('#maintoolbar').addClass('reveal_tagging');
    } else {
      let current_cell_index =
         // first use current selection if relevant
        Jupyter.notebook.get_selected_index()
        // resort to first cell in visible slide otherwise
        || reveal_cell_index(Jupyter.notebook);
      Remover();
      setupKeys("notebook_mode");
      $('#exit_b').remove();
      $('#help_b').remove();
      $('#maintoolbar').removeClass('reveal_tagging');
      // Workaround... should be a better solution. Need to investigate codemirror
      fixCellHeight();
      // select and focus on current cell
      Jupyter.notebook.select(current_cell_index);
      // Need to delay the action a little bit so it actually focus the selected slide
      setTimeout(() => Jupyter.notebook.get_selected_cell().ensure_focused(),
                 complete_config.restore_timeout);
    }
  }

  function autoSelectHook() {
    let auto_select = complete_config.auto_select;
    let cell_type =
        (auto_select == "code") ? 'code'
	: (auto_select == "first") ? null
	: undefined;

    /* turned off altogether */
    if (cell_type === undefined) {
      return;
    }

    let auto_select_fragment = complete_config.auto_select_fragment;
    setTimeout(function(){
      let current_cell_index = reveal_cell_index(
          Jupyter.notebook, cell_type, auto_select_fragment);
      // select and focus on current cell
      if (current_cell_index)
        Jupyter.notebook.select(current_cell_index);
    }, complete_config.auto_select_timeout);
  }

  function addButtonsAndShortcuts() {

    // create button
    Jupyter.toolbar.add_buttons_group([{
      action  : "RISE:slideshow",
      icon    : complete_config.toolbar_icon,
      id      : 'RISE',
    }]);

    //////// bind to keyboard shortcut
    let shortcuts = complete_config.shortcuts;
    for (let action_name in complete_config.shortcuts) {
      let shortcut = shortcuts[action_name];
      // ignore if shortcut is set to an empty string
      if (shortcut) {
//        console.log(`RISE: adding shortcut ${shortcut} for ${action_name}`)
        Jupyter.notebook.keyboard_manager.command_shortcuts.add_shortcut(
          shortcut, `RISE:${action_name}`)
      }
    }
  }

  function showConfig() {
    console.log("RISE configuration", complete_config);
    console.log(`Current notebook ${is_slideshow(Jupyter.notebook) ? "is" : "not"} a slideshow`);
  }


  /* load_jupyter_extension */
  function setup() {
    // load css first
    $('<link/>')
      .attr({rel: "stylesheet",
             href: require.toUrl("./main.css"),
             id: 'maincss',
            })
      .appendTo('head');

    configLoaded()
//      .then(showConfig)
      .then(registerJupyterActions)
      .then(addButtonsAndShortcuts)
      .then(autoLaunch)
    ;

  }

  setup.load_ipython_extension = setup;
  setup.load_jupyter_extension = setup;

  return setup;
});
