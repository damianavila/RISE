declare let require:(moduleId:string) => any;
//let Reveal = require('reveal.js');
import Reveal from 'rise-reveal/export/reveal.js';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IDisposable, DisposableDelegate
} from '@lumino/disposable';

import {
  ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  JSONObject
} from '@lumino/coreutils';

import {
  LabIcon
} from '@jupyterlab/ui-components';

import '../style/index.css';

import riseIconStr from '../style/icons/assessment.svg';

/**
 * Initialization data for the rise-lab extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'rise-lab',
  autoStart: true,
  activate
};

/**
 * A notebook widget extension that adds a RISE button to the toolbar.
 */
export
class RiseExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let callback = () => {

      function get_slide_type(cell: any) {
        let slideshow = (cell.metadata.get("slideshow") || {});
        let slide_type = (slideshow as JSONObject)['slide_type'];
        //console.log(slide_type);
       return ((slide_type === undefined) || (slide_type == '-')) ? '' : slide_type;
      }

      // function is_slide(cell: any)    {return get_slide_type(cell) == 'slide';}
      // function is_subslide(cell: any) {return get_slide_type(cell) == 'subslide';}
      // function is_fragment(cell: any) {return get_slide_type(cell) == 'fragment';}
      // function is_regular(cell: any)  {return get_slide_type(cell) == '';

      function markupSlides(container: any) {
        let slide_section;
        let slide_counter = 0;
        let cells = container.model.cells;

        for (let i=0; i < cells.length; i++) {
          let cell = cells.get(i);
          let slide_type = get_slide_type(cell);

          let cell_node = container.node.children[slide_counter];
          let prev_slide_section = slide_section;

          if (slide_type === 'slide') {
            // Start new slide
            slide_section = document.createElement('section');
            slide_section.appendChild(cell_node);
            if (i === 0) {
              container.node.insertBefore(slide_section, container.node.firstChild);
            } else {
              container.node.insertBefore(slide_section, prev_slide_section.nextSibling);
            }
            slide_counter++;
            console.log("Sep slide", i);
          } else {
            slide_section.appendChild(cell_node);
            console.log("Nop slide", i);
          }
        console.log(container.node);
        }
      }

      let notebook = panel.content;
      markupSlides(notebook);

      let panel_container = document.getElementsByClassName("jp-NotebookPanel")[0];
      panel_container.classList.add("reveal");
      //console.log("panel_container");

      let notebook_container = document.getElementsByClassName("jp-Notebook")[0];
      notebook_container.classList.add("slides");
      //console.log("notebook_container");

      let revealCSS = require('../../rise-reveal/export/reveal.js/css/reveal.css');
      console.log(revealCSS);
      let customCSS = require('../style/rise.css');
      console.log(customCSS);
      //let revealTheme = require('reveal.js/css/theme/simple.css');

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
    };

    const riseIcon = new LabIcon({ name: 'rise:slideshow', svgstr: riseIconStr });

    let button = new ToolbarButton({
      icon: riseIcon,
      onClick: callback,
      tooltip: 'RISE me'
    });

    // Getting the index iteratively is less resource consuming, but this is far more readable
    // and we only need to get the index at the loading of the extension...
    let cellTypeButton = panel.toolbar.node.getElementsByClassName("jp-Notebook-toolbarCellType")[0]
    let index = Array.from(cellTypeButton.parentNode.children).indexOf(cellTypeButton)

    panel.toolbar.insertItem(index + 1,'rise', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd) {
  app.docRegistry.addWidgetExtension('Notebook', new RiseExtension());
  console.log('JupyterLab extension rise-lab is activated!');
};

export default extension;
