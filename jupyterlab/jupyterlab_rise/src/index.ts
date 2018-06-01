declare let require:(moduleId:string) => any;
let Reveal = require('reveal.js');

import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

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
} from '@phosphor/coreutils';

import '../style/index.css';

/**
 * Initialization data for the jupyterlab_rise extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_rise',
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

      let notebook = panel.notebook;
      markupSlides(notebook);

      let panel_container = document.getElementsByClassName("jp-NotebookPanel")[0];
      panel_container.classList.add("reveal");
      //console.log("panel_container");

      let notebook_container = document.getElementsByClassName("jp-Notebook")[0];
      notebook_container.classList.add("slides");
      //console.log("notebook_container");

      let revealCSS = require('reveal_rise/reveal.css');
      console.log(revealCSS);
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

    let button = new ToolbarButton({
      className: 'myButton',
      onClick: callback,
      tooltip: 'RISE me'
    });

    let i = document.createElement('i');
    i.classList.add('fa', 'fa-bar-chart-o');
    button.node.appendChild(i);

    panel.toolbar.insertItem(0, 'rise', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
/**
 * Activate the extension.
 */
function activate(app: JupyterLab) {
  app.docRegistry.addWidgetExtension('Notebook', new RiseExtension());
  console.log('JupyterLab extension jupyterlab_rise is activated!');
};

export default extension;
