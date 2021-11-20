/* eslint-disable no-inner-declarations */
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICellModel } from '@jupyterlab/cells';
import { IChangedArgs, PageConfig } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Signal } from '@lumino/signaling';
import Reveal from 'rise-reveal';
import { RiseApp, RiseShell } from '../app';

// TODO should we define our own factory?

/**
 * Open the notebook with RISE.
 */
const opener: JupyterFrontEndPlugin<void> = {
  id: 'rise-extension:opener',
  autoStart: true,
  requires: [IDocumentManager],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    documentManager: IDocumentManager,
    settingRegistry: ISettingRegistry
  ) => {
    Promise.all([
      // Load settings of the JupyterLab extension - so the settings can be edited in JLab.
      settingRegistry?.load('rise-jupyterlab:plugin') ?? Promise.resolve(null),
      app.started,
      app.restored
    ]).then(([settings]) => {
      let rendered: boolean | null = null;
      const notebookPath = PageConfig.getOption('notebookPath');
      const notebookPanel = documentManager.open(notebookPath) as NotebookPanel;

      const initializeReveal = (
        _: any,
        change: IChangedArgs<any, any, string>
      ) => {
        if (
          change.name === 'dirty' &&
          change.newValue === false &&
          // rendered = null || true
          !!rendered
        ) {
          notebookPanel.content.fullyRendered.disconnect(setRendered, this);
          notebookPanel.model?.stateChanged.disconnect(initializeReveal, this);
          RevealUtils.startReveal(notebookPanel, settings);

          Signal.disconnectAll(this);
          (app.shell as RiseShell).updated.connect(() => {
            Reveal.layout();
          });
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

/**
 * The default paths for a Rise app.
 */
const paths: JupyterFrontEndPlugin<JupyterFrontEnd.IPaths> = {
  id: 'rise-extension:paths',
  autoStart: true,
  provides: JupyterFrontEnd.IPaths,
  activate: (app: JupyterFrontEnd): JupyterFrontEnd.IPaths => {
    if (!(app instanceof RiseApp)) {
      throw new Error(`${paths.id} must be activated in Rise.`);
    }
    return app.paths;
  }
};

export default [opener, paths];

namespace RevealUtils {
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

    // UI - TODO
    // toolbar_icon: 'fa-bar-chart',
    // shortcuts: {
    //   slideshow: 'alt-r',
    //   'toggle-slide': 'shift-i',
    //   'toggle-subslide': 'shift-b',
    //   'toggle-fragment': 'shift-g',
    //   // this can be helpful
    //   'rise-nbconfigurator': 'shift-c',
    //   // unassigned by default
    //   'toggle-notes': '',
    //   'toggle-skip': ''
    // },

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
    minScale: 1.0, // we need this for codemirror to work right
    // turn off reveal's help overlay that is by default bound to question mark / ?
    help: false,

    // plugins
    enable_chalkboard: false,
    enable_leap_motion: false
  };

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
  function markupSlides(container: Notebook) {
    if (!container.model) {
      // Bail early if the model is not valid
      return;
    }

    let slide_section: HTMLElement | null = null;
    let slide_counter = 0;
    const cells = container.model.cells;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells.get(i);
      const slide_type = get_slide_type(cell);

      const cell_node = container.node.children[slide_counter];
      const prev_slide_section = slide_section;

      if (slide_type === 'slide') {
        // Start new slide
        slide_section = document.createElement('section');
        slide_section.appendChild(cell_node);
        if (i === 0) {
          container.node.insertBefore(slide_section, container.node.firstChild);
        } else {
          if (prev_slide_section) {
            container.node.insertBefore(
              slide_section,
              prev_slide_section.nextSibling
            );
          }
        }
        slide_counter++;
      } else {
        slide_section?.appendChild(cell_node);
      }
    }
  }

  export function startReveal(
    panel: NotebookPanel,
    settings: ISettingRegistry.ISettings | null
  ): void {
    const notebook = panel.content;
    panel.addClass('reveal');
    notebook.addClass('slides');

    markupSlides(notebook);

    const applicationSettings = settings?.composite ?? {};

    const finalSettings = {
      ...HARDWIRED_CONFIG,
      ...applicationSettings
    } as IConfig;

    Reveal.initialize(finalSettings);
  }
}
