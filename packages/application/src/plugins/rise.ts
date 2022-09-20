/* eslint-disable no-inner-declarations */
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Dialog, ICommandPalette, showDialog } from '@jupyterlab/apputils';
import { ICellModel } from '@jupyterlab/cells';
import { IChangedArgs, PageConfig, PathExt } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookModel, Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import {
  TranslationBundle,
  ITranslator,
  nullTranslator
} from '@jupyterlab/translation';
import { CommandRegistry } from '@lumino/commands';
import { Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import type { RevealStatic } from 'rise-reveal';

// TODO Fix shortcut in slideshow mode
// TODO add commands to the palette
// TODO should we define our own factory?

namespace CommandIDs {
  export const riseSmartExec = 'RISE:smart-exec';
  export const riseFirstSlide = 'RISE:firstSlide';
  export const riseLastSlide = 'RISE:lastSlide';
  export const riseToggleOverview = 'RISE:toggleOverview';
  export const riseToggleAllButtons = 'RISE:toggleAllRiseButtons';
  export const riseFullScreen = 'RISE:fullscreenHelp';
  export const riseHelp = 'RISE:riseHelp';
  export const riseChalkboardClear = 'RISE:chalkboard-clear';
  export const riseChalkboardReset = 'RISE:chalkboard-reset';
  export const riseChalkboardToggle = 'RISE:chalkboard-toggleChalkboard';
  export const riseChalkboardToggleNotes = 'RISE:chalkboard-toggleNotesCanvas';
  export const riseChalkboardColorPrev = 'RISE:chalkboard-colorPrev';
  export const riseChalkboardColorNext = 'RISE:chalkboard-colorNext';
  export const riseChalkboardDownload = 'RISE:chalkboard-download';
  export const riseNotesOpen = 'RISE:notes-open';

  export const riseShowConfig = 'RISE:show-configuration';
}

/**
 * Open the notebook with RISE.
 */
export const plugin: JupyterFrontEndPlugin<void> = {
  id: 'rise-extension:opener',
  autoStart: true,
  requires: [IDocumentManager],
  optional: [ISettingRegistry, ITranslator, ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    documentManager: IDocumentManager,
    settingRegistry: ISettingRegistry | null,
    translator: ITranslator | null,
    palette: ICommandPalette | null
  ) => {
    const trans = (translator ?? nullTranslator).load('rise');

    // Get the active cell index from query argument
    const url = new URL(window.location.toString());
    const activeCellIndex = parseInt(
      url.searchParams.get('activeCellIndex') ?? '0',
      10
    );

    // Remove active cell from argument
    url.searchParams.delete('activeCellIndex');
    url.searchParams.delete('fullscreen');
    window.history.pushState(null, '', url.toString());

    Promise.all([
      // Load settings of the JupyterLab extension - so the settings can be edited in JLab.
      settingRegistry?.load('rise-jupyterlab:plugin') ?? Promise.resolve(null),
      app.started,
      app.restored
    ]).then(async ([settings]) => {
      let rendered: boolean | null = null;
      const notebookPath = PageConfig.getOption('notebookPath');
      const notebookPanel = documentManager.open(notebookPath) as NotebookPanel;

      Rise.registerCommands(app.commands, trans);
      if (palette) {
        [
          CommandIDs.riseFullScreen,
          CommandIDs.riseHelp,
          CommandIDs.riseNotesOpen,
          CommandIDs.riseFirstSlide,
          CommandIDs.riseLastSlide,
          CommandIDs.riseShowConfig,
          CommandIDs.riseChalkboardToggle,
          CommandIDs.riseChalkboardClear,
          CommandIDs.riseChalkboardReset,
          CommandIDs.riseChalkboardColorNext,
          CommandIDs.riseChalkboardColorPrev
        ].forEach(command => {
          palette.addItem({
            command,
            category: 'Rise'
          });
        });
      }

      const initializeReveal = (
        _: any,
        change: IChangedArgs<any, any, string>
      ) => {
        if (
          change.name === 'dirty' &&
          change.newValue === false &&
          // if rendered = null || true
          !!rendered
        ) {
          console.log(`Convert notebook ${notebookPath} to slideshow.`);
          notebookPanel.content.fullyRendered.disconnect(setRendered, this);
          notebookPanel.model?.stateChanged.disconnect(initializeReveal, this);

          // Set the active cell index
          notebookPanel.content.activeCellIndex = activeCellIndex;

          // We wait for the notebook to be loaded to get the settings from the metadata.
          Rise.loadConfiguration(settings, notebookPanel.model);
          Rise.revealMode(notebookPanel, app.commands, trans).catch(reason => {
            console.error(
              'Fail to update the notebook with Reveal.JS.',
              reason
            );
          });

          Signal.disconnectAll(this);
        }
      };

      const setRendered = (notebook: Notebook, fullyRendered: boolean) => {
        rendered = fullyRendered;
        if (rendered) {
          initializeReveal(null, {
            name: 'dirty',
            newValue: notebook.model?.dirty ?? true,
            oldValue: true
          });
        }
      };

      // Deal with virtual rendering
      notebookPanel.content.fullyRendered.connect(setRendered, this);

      notebookPanel.model?.stateChanged.connect(initializeReveal, this);

      // Remove the toolbar
      notebookPanel.toolbar.dispose();

      app.shell.add(notebookPanel);
    });
  }
};

namespace Rise {
  /* Configuration related code */
  interface IConfig {
    // behaviour
    autolaunch: boolean;
    start_slideshow_at: string;
    auto_select: string;
    auto_select_fragment: boolean;
    show_buttons_on_startup: boolean;

    // aspect
    header?: string;
    footer?: string;
    backimage?: string;
    overlay?: string;

    // timeouts
    // wait for that amont before calling ensure_focused on the
    // selected cell
    restore_timeout: number;
    // wait for that amount before actually selected auto-selected fragment
    // when going too short, like 250, size of selected cell get odd
    auto_select_timeout: number;
    // wait for that amount before calling sync() again
    // this is a workaround that fixes #504
    sync_timeout: number;

    // reveal native settings passed as-is
    // see also the 'inherited' variable below in Revealer
    theme: string;
    transition: string;
    // xxx there might be a need to tweak this one when set
    // by the configurator, as e.g. 'false' or 'true' will result
    // in a string and not a boolean
    slideNumber: boolean | string;
    width: string;
    height: string;
    controls: boolean;
    progress: boolean;
    history: boolean;
    scroll: boolean;
    center: boolean;
    margin: number;
    minScale: number; // we need this for codemirror to work right

    // turn off reveal's help overlay that is by default bound to question mark / ?
    help: boolean;

    // plugins
    enable_chalkboard: boolean;
    enable_leap_motion: boolean;
  }

  // see packages/lab/schema/plugin.json
  const HARDWIRED_CONFIG: IConfig = {
    // behaviour
    autolaunch: false,
    start_slideshow_at: 'selected',
    auto_select: 'code',
    auto_select_fragment: true,
    show_buttons_on_startup: true,

    // aspect
    header: undefined,
    footer: undefined,
    backimage: undefined,
    overlay: undefined,

    // timeouts
    // wait for that amont before calling ensure_focused on the
    // selected cell
    restore_timeout: 500,
    // wait for that amount before actually selected auto-selected fragment
    // when going too short, like 250, size of selected cell get odd
    auto_select_timeout: 450,
    // wait for that amount before calling sync() again
    // this is a workaround that fixes #504
    sync_timeout: 250,

    // reveal native settings passed as-is
    // see also the 'inherited' variable below in Revealer
    theme: 'simple',
    transition: 'linear',
    // xxx there might be a need to tweak this one when set
    // by the configurator, as e.g. 'false' or 'true' will result
    // in a string and not a boolean
    slideNumber: true,
    width: '100%',
    height: '100%',
    controls: true,
    progress: true,
    history: true,
    scroll: false,
    center: true,
    margin: 0.1,
    minScale: 1.0,

    // turn off reveal's help overlay that is by default bound to question mark / ?
    help: false,

    // plugins
    enable_chalkboard: false,
    enable_leap_motion: false
  };

  let complete_config: IConfig = { ...HARDWIRED_CONFIG };

  export function loadConfiguration(
    settings: ISettingRegistry.ISettings | null = null,
    notebookModel: INotebookModel | null = null
  ): void {
    const applicationSettings = settings?.composite ?? {};

    complete_config = {
      ...HARDWIRED_CONFIG,
      ...applicationSettings,
      ...((notebookModel?.metadata.get('livereveal') as any) ?? {}),
      ...((notebookModel?.metadata.get('rise') as any) ?? {})
    };
  }

  /* Register commands */
  function smartExec() {
    // TODO
    // is it really the selected cell that matters ?
    // let smart_exec = Jupyter.notebook.get_selected_cell().smart_exec;
    // if (smart_exec == 'smart_exec_slide') {
    //   Jupyter.notebook.execute_selected_cells();
    // } else if (smart_exec == "smart_exec_fragment") {
    //   // let's see if the next fragment is visible or not
    //   let cell = Jupyter.notebook.get_selected_cell();
    //   let fragment_div = cell.smart_exec_next_fragment;
    //   let visible = $(fragment_div).hasClass('visible');
    //   if (visible) {
    //     Jupyter.notebook.execute_cell_and_select_below();
    //   } else {
    //     Jupyter.notebook.execute_selected_cells();
    //   }
    // } else {
    //   Jupyter.notebook.execute_cell_and_select_below();
    // }
  }

  export function registerCommands(
    commands: CommandRegistry,
    trans: TranslationBundle
  ): void {
    // register main action
    commands.addCommand(CommandIDs.riseSmartExec, {
      caption: trans.__(
        'execute cell, and move to the next if on the same slide'
      ),
      execute: smartExec
    });

    // mostly for debug / information
    commands.addCommand(CommandIDs.riseShowConfig, {
      label: trans.__('Dump RISE configuration'),
      caption: trans.__(
        'Output RISE configuration in console, for debugging mostly'
      ),
      execute: () => {
        console.log('RISE configuration', complete_config);
      }
    });

    // action for reveal.js and reveal.js plug-in bindings
    // this a the dictionary structure as generated by nbextension_configurator
    // with the corresponding API calls to RISE/reveal.js and/or its plug-ins
    const reveal_actions: { [id: string]: () => void } = {};

    // RISE/reveal.js API calls
    reveal_actions[CommandIDs.riseFirstSlide] = () => Reveal.slide(0); // jump to first slide
    reveal_actions[CommandIDs.riseLastSlide] = () =>
      Reveal.slide(Number.MAX_VALUE); // jump to last slide
    reveal_actions[CommandIDs.riseToggleOverview] = () =>
      Reveal.toggleOverview(); // toggle overview
    reveal_actions[CommandIDs.riseToggleAllButtons] = toggleAllRiseButtons; // show/hide buttons
    reveal_actions[CommandIDs.riseFullScreen] = () => {
      fullscreenHelp();
    }; // show fullscreen help
    reveal_actions[CommandIDs.riseHelp] = () => {
      displayRiseHelp(commands, trans);
    }; // '?' show our help
    // API calls for RevealChalkboard plug-in
    reveal_actions[CommandIDs.riseChalkboardClear] = () =>
      (window as any).RevealChalkboard?.clear(); // clear full size chalkboard
    reveal_actions[CommandIDs.riseChalkboardReset] = () =>
      (window as any).RevealChalkboard?.reset(); // reset chalkboard data on current slide
    reveal_actions[CommandIDs.riseChalkboardToggle] = () =>
      (window as any).RevealChalkboard?.toggleChalkboard(); // toggle full size chalkboard
    reveal_actions[CommandIDs.riseChalkboardToggleNotes] = () =>
      (window as any).RevealChalkboard?.toggleNotesCanvas(); // toggle notes (slide-local)
    reveal_actions[CommandIDs.riseChalkboardColorNext] = () =>
      (window as any).RevealChalkboard?.colorNext(); // next color
    reveal_actions[CommandIDs.riseChalkboardColorPrev] = () =>
      (window as any).RevealChalkboard?.colorPrev(); // previous color
    reveal_actions[CommandIDs.riseChalkboardDownload] = () =>
      (window as any).RevealChalkboard?.download(); //  download recorded chalkboard drawing
    // API calls for RevealNotes plug-in
    reveal_actions[CommandIDs.riseNotesOpen] = () => {
      // TODO this is broken because it looks for reveal.js/plugin/notes/notes.html
      //   A manual path can be passed to open
      // open speaker notes window
      (window as any).RevealNotes.open(
        [PageConfig.getOption('fullStaticUrl'), 'notes.html'].join('/')
      );
    };
    const helpStrings = getHelpDescription(trans);
    // register all reveal.js actions
    for (const action of Object.keys(reveal_actions)) {
      const api_call = reveal_actions[action];
      commands.addCommand(action, {
        label: helpStrings[action],
        caption: helpStrings[action],
        execute: api_call
      });
      // console.log(`Registered jupyter action \"${action}\" to API call: ${api_call}`);
    }
  }

  /* Slideshow code */

  let Reveal: RevealStatic;

  function get_slide_type(cell: ICellModel): string {
    const slideshow = cell.metadata.get('slideshow') || {};
    const slide_type = (slideshow as any)['slide_type'];
    //console.log(slide_type);
    return slide_type === undefined || slide_type === '-' ? '' : slide_type;
  }

  /*
  function is_slide(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'slide';
  }
  function is_subslide(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'subslide';
  }
  function is_fragment(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'fragment';
  }
  function is_skip(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'skip';
  }
  function is_notes(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'notes';
  }
  */
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
  function markupSlides(notebook: Notebook): [number, number] {
    if (!notebook.model) {
      // Bail early if the model is not valid
      return [0, 0];
    }

    let slide_counter = -1;
    let subslide_counter = -1;

    function new_slide(prev_slide_section: HTMLElement | null): HTMLElement {
      slide_counter++;
      subslide_counter = -1;
      const new_section = document.createElement('section');
      // first slide
      if (!prev_slide_section) {
        notebook.node.insertBefore(new_section, notebook.node.firstChild);
      } else {
        notebook.node.insertBefore(new_section, prev_slide_section.nextSibling);
      }
      return new_section;
    }

    function new_subslide(slide_section: HTMLElement): HTMLElement {
      subslide_counter++;
      const new_section = document.createElement('section');
      new_section.id = `slide-${slide_counter}-${subslide_counter}`;
      slide_section.appendChild(new_section);
      return new_section;
    }

    function new_fragment(subslide_section: HTMLElement): HTMLElement {
      const new_fragment = document.createElement('div');
      new_fragment.classList.add('fragment');
      subslide_section.appendChild(new_fragment);
      return new_fragment;
    }

    // Containers for the first slide.
    let slide_section = new_slide(null);
    let subslide_section = new_subslide(slide_section);
    let current_fragment = subslide_section;

    const selected_cell_idx = notebook.activeCellIndex;
    let selected_cell_slide: [number, number] = [0, 0];

    /* Special handling for the first slide: it will work even if the user
     * doesn't start with a 'Slide' cell. But if the user does explicitly
     * start with slide/subslide, we don't want a blank first slide. So we
     * don't create a new slide/subslide until there is visible content on
     * the first slide.
     */
    let content_on_slide1 = false;

    const cells = notebook.model.cells;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells.get(i);
      const slide_type = get_slide_type(cell);
      // we already have one section inserted here on startup
      const cell_node = notebook.node.children[slide_counter + 1];

      if (content_on_slide1) {
        if (slide_type === 'slide') {
          // Start new slide
          slide_section = new_slide(slide_section);
          // In each subslide, we insert cells directly into the
          // <section> until we reach a fragment, when we create a div.
          current_fragment = subslide_section = new_subslide(slide_section);
        } else if (slide_type === 'subslide') {
          // Start new subslide
          current_fragment = subslide_section = new_subslide(slide_section);
        } else if (slide_type === 'fragment') {
          // record the <div class='fragment'> element corresponding
          // to each fragment cell in the 'fragment_div' attribute
          current_fragment = new_fragment(subslide_section);
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

      if (slide_type === 'notes') {
        // Notes are wrapped in an <aside> element
        const aside = document.createElement('aside');
        aside.classList.add('notes');
        aside.append(cell_node);
        subslide_section.appendChild(aside)
      
      } else {
        current_fragment.appendChild(cell_node);
      }

      // Hide skipped cells
      if (slide_type === 'skip') {
        cell_node.classList.add('reveal-skip');
      }
    }

    /* set on all cells a smart_exec tag that says how smart exec
     * should behave on that cell
     * the fragment cell also get a smart_exec_next_fragment
     * attribute that points at the <div class='fragment'>
     * corresponding to the (usually immediately) next cell
     * that is a fragment cell
     */
    // TODO smart execution
    // for (let i = 0; i < cells.length; i++) {
    //   const cell = cells.get(i);
    //   // default is 'pinned' because this applies to the last cell
    //   let tag = 'smart_exec_slide';
    //   for (let j = i + 1; j < cells.length; j++) {
    //     const next_cell = cells.get(j);
    //     const next_type = get_slide_type(next_cell);
    //     if (next_type === 'slide' || next_type === 'subslide') {
    //       tag = 'smart_exec_slide';
    //       break;
    //     } else if (next_type === 'fragment') {
    //       tag = 'smart_exec_fragment';
    //       /* these cells are the last before a fragment
    //        * and when running smart-exec we'll want to know
    //        * if that fragment is visible, so we keep a link to
    //        * the <div class='fragment'> element of that (next)
    //        * fragment cell
    //        */
    //       cell.smart_exec_next_fragment = next_cell.fragment_div;
    //       break;
    //     } else if (next_type === '') {
    //       tag = 'smart_exec_next';
    //       break;
    //     }
    //   }
    //   cell.smart_exec = tag;
    // }

    return selected_cell_slide;
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
  function reveal_current_position(): [number, number, number] {
    const current_slide = Reveal.getCurrentSlide();

    if (!current_slide) {
      return [0, 0, 0];
    }
    // href of the form slide-2-3
    const href = current_slide.id;
    const chunks = href.split('-');
    const slide = Number(chunks[1]);
    const subslide = Number(chunks[2]);
    const fragments = current_slide.querySelectorAll(
      'div.fragment.visible'
    ).length;
    return [slide, subslide, fragments];
  }

  function is_slide(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'slide';
  }
  function is_subslide(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'subslide';
  }
  function is_fragment(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'fragment';
  }
  function is_skip(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'skip';
  }
  function is_notes(cell: ICellModel): boolean {
    return get_slide_type(cell) === 'notes';
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
  function reveal_cell_index(
    notebook: INotebookModel | null,
    cell_type: string | null | undefined = null,
    auto_select_fragment = false
  ): number | null {
    if (!notebook) {
      return null;
    }
    /* scan all cells until we find one that matches current reveal location
     * need to deal carefully with beginning of that process because
     * (.) we do not impose a starting 'slide', and
     * (.) the first cell(s) might be of type 'skip'
     *     which then must not be counted
     */
    const [slide, subslide, fragment] = reveal_current_position();

    // start at slide -1 because we don't impose a starting 'slide'
    let [slide_counter, subslide_counter, fragment_counter] = [-1, 0, 0];

    const cells = notebook.cells;
    for (let index = 0; index < cells.length; index++) {
      const cell = cells.get(index);
      // ignore skip cells no matter what
      if (is_skip(cell) || is_notes(cell)) {
        continue;
      }
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

      if (slide_counter === slide && subslide_counter === subslide) {
        // keep count of fragments but only on current slide
        if (is_fragment(cell)) {
          fragment_counter += 1;
        }
        /* we're on the right slide
         * now: do we need to also worry about focusing on the right fragment ?
         * if auto_select_fragment is true, we only consider cells in the fragment
         * otherwise, the whole (sub)slide is considered valid
         */
        const fragment_match = auto_select_fragment
          ? fragment_counter === fragment
          : true;
        // we still need to match cell types
        if (fragment_match && (cell_type === null || cell.type === cell_type)) {
          return index;
        }
      }
    }
    // for consistency with previous implementations
    return null;
  }

  function autoSelectHook(notebook: Notebook) {
    const auto_select = complete_config.auto_select;
    const cell_type =
      auto_select === 'code'
        ? 'code'
        : auto_select === 'first'
        ? null
        : undefined;

    /* turned off altogether */
    if (cell_type === undefined) {
      return;
    }

    const auto_select_fragment = complete_config.auto_select_fragment;
    setTimeout(() => {
      const current_cell_index = reveal_cell_index(
        notebook.model,
        cell_type,
        auto_select_fragment
      );
      // select and focus on current cell
      if (current_cell_index) {
        notebook.activeCellIndex = current_cell_index;
      }
    }, complete_config.auto_select_timeout);
  }

  /* Set the #slide-x-y part of the URL to control where the slideshow will start.
   * N.B. We do this instead of using Reveal.slide() after reveal initializes,
   * because that leaves one slide clearly visible on screen for a moment before
   * changing to the one we want. By changing the URL before setting up reveal,
   * the slideshow really starts on the desired slide.
   */
  function setStartingSlide(selected: [number, number]): void {
    const start_slideshow = complete_config.start_slideshow_at;
    if (start_slideshow === 'selected') {
      // Start from the selected cell
      Reveal.slide(selected[0], selected[1]);
    } else {
      // Start from the beginning
      Reveal.slide(0, 0);
    }
    setScrollingSlide();
    // workaround for #504
    // when editing if you swap out of reveal, and then
    // come back in, with 5.6 most of the time display
    // becomes empty or the contents is way too low
    // this patch makes the situation much better,
    // although it is clearly suboptimal to have
    // to resort to that sort of dirty patch
    setTimeout(() => Reveal.sync(), complete_config.sync_timeout);
  }

  /* Setup the scrolling in the current slide if the config option is activated
   *  and the content is greater than 0.95 * slide height
   */
  function setScrollingSlide() {
    const scroll = complete_config.scroll;
    const panel = document.querySelector('.reveal');
    const sections =
      document.querySelector('section.present')?.querySelectorAll('section') ??
      [];

    if (scroll === true && panel) {
      const height = panel.getBoundingClientRect().height * 0.95;

      [...sections]
        .filter(section => {
          return section.getBoundingClientRect().height > height;
        })
        .forEach(section => {
          section.style.height = 'calc(95vh)';
          section.style.overflowY = 'scroll';
          section.style.marginTop = '20px';
        });
    }
  }

  /* Setup a MutationObserver to call Reveal.sync when an output is generated.
   * This fixes issue #188: https://github.com/damianavila/RISE/issues/188
   */
  let outputObserver: MutationObserver | null = null;
  function setupOutputObserver() {
    function mutationHandler(mutationRecords: MutationRecord[]) {
      mutationRecords.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length) {
          Reveal.sync();
          setScrollingSlide();
        }
      });
    }

    const outputs = document.querySelectorAll('.output');
    const MutationObserver =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.MutationObserver ?? window.WebKitMutationObserver;
    outputObserver = new MutationObserver(mutationHandler);

    const observerOptions = {
      childList: true,
      characterData: false,
      attributes: false,
      subtree: false
    };
    [...outputs].forEach(output => {
      outputObserver?.observe(output, observerOptions);
    });
  }

  function addHeaderFooterOverlay() {
    const overlay = complete_config.overlay;
    const header = complete_config.header;
    const footer = complete_config.footer;
    const backimage = complete_config.backimage;
    // minimum styling to make these 3 things look
    // like what their name says they should look
    const header_style = 'position: absolute; top: 0px;';
    const footer_style = 'position: absolute; bottom: 0px;';
    const backimage_style = 'width: 100%; height: 100%;';
    let overlay_body = '';
    if (overlay) {
      overlay_body = overlay;
    } else {
      if (header) {
        overlay_body += `<div id='rise-header' style='${header_style}'>${header}</div>`;
      }
      if (backimage) {
        overlay_body += `<img id='rise-backimage' style='${backimage_style}' src='${backimage}' />`;
      }
      if (footer) {
        overlay_body += `<div id='rise-footer' style='${footer_style}'>${footer}</div>`;
      }
    }
    document
      .querySelector('div.reveal')
      ?.insertAdjacentHTML(
        'beforeend',
        `<div id='rise-overlay'>${overlay_body}</div>`
      );
  }

  function toggleAllRiseButtons() {
    // TODO do this with vanillaJS
    for (const selector of ['#help_b', '#toggle-chalkboard', '#toggle-notes']) {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element) {
        element.style.visibility =
          element.style.visibility === 'hidden' ? 'visible': 'hidden';
      }
    }
  }

  async function fullscreenHelp(): Promise<void> {
    if (!document.fullscreenElement) {
      await document.querySelector('div.reveal')?.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  }

  let isRevealInitialized = false;

  async function Revealer(
    panel: NotebookPanel,
    selected_slide: [number, number]
  ): Promise<void> {
    document.body.classList.add('rise-enabled');

    // Add the main reveal.js classes
    const notebook = panel.content;
    panel.addClass('reveal');
    notebook.addClass('slides');

    // Header
    // Available themes are in static/css/theme
    const theme = complete_config.theme;
    document.body.classList.add(`theme-${theme}`);
    // Asynchronously load reveal theme
    await import(`rise-reveal/export/reveal.js/css/theme/${theme}.css`);

    /* this policy of trying ./rise.css and then <notebook>.css
     * should be redefinable in the config
     */
    // https://github.com/damianavila/RISE/issues/509
    // Attempt to load rise.css
    const curdir = PathExt.dirname(panel.sessionContext.path);
    document.head.insertAdjacentHTML(
      'beforeend',
      `<link rel="stylesheet" href="${PageConfig.getBaseUrl()}files/${curdir}/rise.css" id="rise-custom-css" />`
    );
    const name = PathExt.basename(panel.sessionContext.path);
    const dot_index = name.lastIndexOf('.');
    const stem = dot_index === -1 ? name : name.substr(0, dot_index);
    // associated css
    const name_css = `${curdir}/${stem}.css`;
    // Attempt to load css with the same path as notebook
    document.head.insertAdjacentHTML(
      'beforeend',
      `<link rel="stylesheet" href="${PageConfig.getBaseUrl()}files/${name_css}" id="rise-notebook-css" />`
    );

    // Asynchronously import reveal
    Reveal = await import('rise-reveal');
    // Make Reveal.js accessible for plugins
    (window as any).Reveal = Reveal;

    // Full list of configuration options available here:
    // https://github.com/hakimel/reveal.js#configuration

    // all these settings are passed along to reveal as-is
    // xxx it might be just better to copy the whole complete_config instead
    // of selecting some names, which would allow users to transparently use
    // all reveal's features
    const inherited = [
      'controls',
      'progress',
      'history',
      'width',
      'height',
      'margin',
      'minScale',
      'transition',
      'slideNumber',
      'center',
      'help'
    ];

    const options: any = {
      //parallaxBackgroundImage: 'https://raw.github.com/damianavila/par_IPy_slides_example/gh-pages/figs/star_wars_stormtroopers_darth_vader.jpg',
      //parallaxBackgroundSize: '2560px 1600px',

      // turn off reveal native help
      help: false,

      // key bindings configurable are now defined in the reveal_default_bindings dict -
      // this should only be used to unbind keys
      // note that toggleAllRiseButtons is bound to comma here as jupyter does not
      // allow to bind anything to comma!
      keyboard: {
        13: null, // Enter disabled
        27: null, // ESC disabled
        35: null, // End - last slide disabled (will be set in custom keys)
        36: null, // Home - first slide disabled (will be set in custom keys)
        38: null, // up arrow disabled
        40: null, // down arrow disabled
        66: null, // b, black pause disabled, use period or forward slash
        70: null, // disable fullscreen inside the slideshow, makes codemirror unreliable
        72: null, // h, left disabled
        74: null, // j, down disabled
        75: null, // k, up disabled
        76: null, // l, right disabled
        78: null, // n, down disabled
        79: null, // o disabled
        80: null, // p, up disabled
        84: null, // t, modified in the custom notes plugin.
        87: null, // w, toggle overview
        // is it ok?
        188: toggleAllRiseButtons // comma, hard-wired to toggleAllRiseButtons
      }
    };

    // Manually hook reveal.js notes in global namespace
    await import(
      // @ts-expect-error Import non typed package
      'rise-reveal/export/reveal.js/plugin/notes/notes.js'
    );
    // @ts-expect-error missing type description
    (window as any).RevealNotes = Reveal.getPlugin('notes');

    for (const setting of inherited) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      options[setting] = complete_config[setting];
    }

    ////////// set up the leap motion integration if configured
    // TODO leap plugin does not exist
    // const enable_leap_motion = complete_config.enable_leap_motion;
    // if (enable_leap_motion) {
    //   // @ts-expect-error Import non typed package
    //   await import('rise-reveal/export/reveal.js/plugin/leap/leap.js');
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   options.leap = enable_leap_motion;
    // }

    //$.extend(options.keyboard, reveal_bindings);

    ////////// set up chalkboard if configured
    const enable_chalkboard = complete_config.enable_chalkboard;
    if (enable_chalkboard) {
      if ('chalkboard' in complete_config) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options['chalkboard'] = complete_config['chalkboard'];
      }

      const plugin = await import(
        // @ts-expect-error Import non typed package
        'rise-reveal/export/reveal.js/plugin/chalkboard/chalkboard.js'
      );
      (window as any).RevealChalkboard = plugin.default;
    }

    if (isRevealInitialized) {
      Reveal.configure(options);
      //console.log("Reveal is already initialized and is being configured");
    } else {
      Reveal.initialize(options);
      //console.log("Reveal initialized");
      isRevealInitialized = true;
    }

    Reveal.addEventListener('ready', event => {
      Unselecter(panel.content);
      // check and set the scrolling slide when you start the whole thing
      setScrollingSlide();
      autoSelectHook(panel.content);
    });

    Reveal.addEventListener('slidechanged', event => {
      Unselecter(panel.content);
      // check and set the scrolling slide every time the slide change
      setScrollingSlide();
      autoSelectHook(panel.content);
    });

    Reveal.addEventListener('fragmentshown', event => {
      autoSelectHook(panel.content);
    });
    Reveal.addEventListener('fragmenthidden', event => {
      autoSelectHook(panel.content);
    });

    // Sync when an output is generated.
    setupOutputObserver();

    // Setup the starting slide
    setStartingSlide(selected_slide);
    addHeaderFooterOverlay();

    if (!complete_config.show_buttons_on_startup) {
      /* safer, and nicer too, to wait for reveal extensions to start */
      setTimeout(toggleAllRiseButtons, 2000);
    }
  }

  function Unselecter(notebook: Notebook) {
    notebook.deselectAll();
  }

  export async function revealMode(
    panel: NotebookPanel,
    commands: CommandRegistry,
    trans: TranslationBundle
  ): Promise<void> {
    const notebook = panel.content;

    // Preparing the new reveal-compatible structure
    const selected_slide = markupSlides(notebook);
    // Adding the reveal stuff
    Revealer(panel, selected_slide);
    // Minor modifications for usability
    addHelpButton(panel, commands, trans);
  }

  async function displayRiseHelp(
    commands: CommandRegistry,
    trans: TranslationBundle
  ): Promise<void> {
    const helpStrings = getHelpDescription(trans);

    /**
     * Build help list item
     *
     * @param commandID Command ID linked to a shortcut
     * @returns HTML string
     */
    function helpListItem(commandID: string): string {
      const binding = commands.keyBindings.find(b => b.command === commandID);
      const ks = binding
        ? CommandRegistry.formatKeystroke(binding.keys.join(' '))
        : '';
      return `<li><kbd>${ks}</kbd> : ${helpStrings[commandID]}</li>`;
    }

    const node = document.createElement('div');
    node.insertAdjacentHTML(
      'afterbegin',
      `<p>
  <ul>
    ${helpListItem(CommandIDs.riseHelp)}
    <li><kbd>${CommandRegistry.formatKeystroke('Alt R')}</kbd>: ${trans.__(
        'enter/exit RISE'
      )}</li>
    <li><kbd>${CommandRegistry.formatKeystroke('Space')}</kbd>: ${trans.__(
        'next'
      )}</li>
    <li><kbd>${CommandRegistry.formatKeystroke(
      'Shift Space'
    )}</kbd>: ${trans.__('previous')}</li>
    <li><kbd>${CommandRegistry.formatKeystroke(
      'Shift Enter'
    )}</kbd>: ${trans.__('eval and select next cell if visible')}</li>
    ${helpListItem(CommandIDs.riseFirstSlide)}
    ${helpListItem(CommandIDs.riseLastSlide)}
    ${helpListItem(CommandIDs.riseToggleOverview)}
    ${helpListItem(CommandIDs.riseNotesOpen)}
    <li><kbd>${CommandRegistry.formatKeystroke(',')}</kbd>: ${
        helpStrings[CommandIDs.riseToggleAllButtons]
      }</li>
    <li><kbd>${CommandRegistry.formatKeystroke('/')}</kbd>: ${trans.__(
        'black screen'
      )}</li>
    <li><strong>${trans.__('less useful')}:</strong></li>
    <ul>
      <li><kbd>${CommandRegistry.formatKeystroke('PageUp')}</kbd>: ${trans.__(
        'up'
      )}</li>
      <li><kbd>${CommandRegistry.formatKeystroke('PageDown')}</kbd>: ${trans.__(
        'down'
      )}</li>
      <li><kbd>${CommandRegistry.formatKeystroke(
        'ArrowLeft'
      )}</kbd>: ${trans.__('left')} <em>(${trans.__(
        'note: Space preferred'
      )})</em></li>
      <li><kbd>${CommandRegistry.formatKeystroke(
        'ArrowRight'
      )}</kbd>: ${trans.__('right')} <em>(${trans.__(
        'note: Shift Space preferred'
      )})</em></li>
    </ul>
    <li><strong>${trans.__('with chalkboard enabled')}:</strong></li>
    <ul>
      ${helpListItem(CommandIDs.riseChalkboardToggle)}
      ${helpListItem(CommandIDs.riseChalkboardToggleNotes)}
      ${helpListItem(CommandIDs.riseChalkboardColorNext)}
      ${helpListItem(CommandIDs.riseChalkboardColorPrev)}
      ${helpListItem(CommandIDs.riseChalkboardDownload)}
      ${helpListItem(CommandIDs.riseChalkboardReset)}
      ${helpListItem(CommandIDs.riseChalkboardClear)}
    </ul>
  </ul>
  ${trans.__(
    'NOTE: of course you have to use these shortcuts in command mode.'
  )}
</p>`
    );

    await showDialog({
      title: trans.__('Reveal Shortcuts Help'),
      body: new Widget({ node }),
      buttons: [Dialog.warnButton({ label: trans.__('OK') })]
    });
  }

  function addHelpButton(
    panel: NotebookPanel,
    commands: CommandRegistry,
    trans: TranslationBundle
  ): void {
    const helpButton = document.createElement('i');
    helpButton.setAttribute('id', 'help_b');
    helpButton.setAttribute('title', trans.__('Reveal Shortcuts Help'));
    helpButton.classList.add('fa-question', 'fa-4x', 'fa');

    helpButton.addEventListener('click', () => {
      displayRiseHelp(commands, trans);
    });

    panel.node.insertAdjacentElement('afterend', helpButton);
  }

  const reveal_helpstr: { [id: string]: string } = {};

  function getHelpDescription(trans: TranslationBundle): {
    [id: string]: string;
  } {
    if (Object.keys(reveal_helpstr).length === 0) {
      // RISE/reveal.js API calls
      reveal_helpstr[CommandIDs.riseFirstSlide] = trans.__(
        'jump to first slide'
      );
      reveal_helpstr[CommandIDs.riseLastSlide] = trans.__('jump to last slide');
      reveal_helpstr[CommandIDs.riseToggleOverview] =
        trans.__('toggle overview');
      reveal_helpstr[CommandIDs.riseToggleAllButtons] =
        trans.__('show/hide buttons');
      reveal_helpstr[CommandIDs.riseFullScreen] = trans.__(
        'show fullscreen help'
      );
      reveal_helpstr[CommandIDs.riseHelp] = trans.__('show this help dialog');
      // API calls for RevealChalkboard plug-in
      reveal_helpstr[CommandIDs.riseChalkboardClear] = trans.__(
        'clear full size chalkboard'
      );
      reveal_helpstr[CommandIDs.riseChalkboardReset] = trans.__(
        'reset chalkboard data on current slide'
      );
      reveal_helpstr[CommandIDs.riseChalkboardToggle] = trans.__(
        'toggle full size chalkboard'
      );
      reveal_helpstr[CommandIDs.riseChalkboardToggleNotes] = trans.__(
        'toggle notes (slide-local)'
      );
      reveal_helpstr[CommandIDs.riseChalkboardColorNext] = trans.__(
        'cycle to next pen color'
      );
      reveal_helpstr[CommandIDs.riseChalkboardColorPrev] = trans.__(
        'cycle to previous pen color'
      );
      reveal_helpstr[CommandIDs.riseChalkboardDownload] = trans.__(
        'download recorded chalkboard drawing'
      );
      // API calls for RevealNotes plug-in
      reveal_helpstr[CommandIDs.riseNotesOpen] = trans.__(
        'open speaker notes window'
      );
    }
    return reveal_helpstr;
  }
}
