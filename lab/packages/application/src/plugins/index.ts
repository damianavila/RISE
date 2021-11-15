import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IChangedArgs, PageConfig } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';
import Reveal from 'rise-reveal';
import { RiseApp } from '../app';

// TODO should we define our own factory?

function startReveal(panel: NotebookPanel): void {
  function get_slide_type(cell: any) {
    const slideshow = cell.metadata.get('slideshow') || {};
    const slide_type = (slideshow as any)['slide_type'];
    //console.log(slide_type);
    return slide_type === undefined || slide_type === '-' ? '' : slide_type;
  }

  // function is_slide(cell: any)    {return get_slide_type(cell) == 'slide';}
  // function is_subslide(cell: any) {return get_slide_type(cell) == 'subslide';}
  // function is_fragment(cell: any) {return get_slide_type(cell) == 'fragment';}
  // function is_regular(cell: any)  {return get_slide_type(cell) == '';

  function markupSlides(container: any) {
    let slide_section;
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
          container.node.insertBefore(
            slide_section,
            prev_slide_section?.nextSibling
          );
        }
        slide_counter++;
        console.log('Sep slide', i);
      } else {
        slide_section?.appendChild(cell_node);
        console.log('Nop slide', i);
      }
      console.log(container.node);
    }
  }

  const notebook = panel.content;
  markupSlides(notebook);

  const panel_container = document.getElementsByClassName(
    'jp-NotebookPanel'
  )[0];
  panel_container.classList.add('reveal');
  //console.log("panel_container");

  const notebook_container = document.getElementsByClassName('jp-Notebook')[0];
  notebook_container.classList.add('slides');
  //console.log("notebook_container");

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
          startReveal(notebookPanel);
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
