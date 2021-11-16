/* eslint-disable no-inner-declarations */
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICellModel } from '@jupyterlab/cells';
import { IChangedArgs, PageConfig } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookModel, Notebook, NotebookPanel } from '@jupyterlab/notebook';
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
  activate: (app: JupyterFrontEnd, documentManager: IDocumentManager) => {
    Promise.all([app.started, app.restored]).then(() => {
      const notebookPath = PageConfig.getOption('notebookPath');
      const notebookPanel = documentManager.open(notebookPath) as NotebookPanel;

      app.shell.add(notebookPanel);

      const initializeReveal = (
        _: INotebookModel,
        change: IChangedArgs<any, any, string>
      ) => {
        if (change.name === 'dirty' && change.newValue === false) {
          notebookPanel.model?.stateChanged.disconnect(initializeReveal, this);
          RevealUtils.startReveal(notebookPanel);

          Signal.disconnectAll(this);
          (app.shell as RiseShell).updated.connect(() => {
            Reveal.layout();
          });
        }
      };
      notebookPanel.model?.stateChanged.connect(initializeReveal, this);
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

  export function startReveal(panel: NotebookPanel): void {
    const notebook = panel.content;
    panel.addClass('reveal');
    notebook.addClass('slides');

    markupSlides(notebook);

    Reveal.initialize({
      controls: true,
      progress: true,
      history: true,
      center: true,

      transition: 'slide', // none/fade/slide/convex/concave/zoom
      //make codemirror works as expected
      minScale: 1.0,
      maxScale: 1.0
    });
  }
}
