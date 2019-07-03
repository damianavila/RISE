declare let require:(moduleId:string) => any;
let Reveal = require('reveal.js');

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  JSONObject
} from '@phosphor/coreutils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  ToolbarButton
} from '@jupyterlab/apputils';

//////////////////////// from cookiecutter
import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';



export
class RiseExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    
    function callback() {

      function get_slide_type(cell: any) {
        let slideshow = (cell.metadata.get("slideshow") || {});
        let slide_type = (slideshow as JSONObject)['slide_type'];
        //console.log(slide_type);
       return ((slide_type === undefined) || (slide_type == '-')) ? '' : slide_type;
      }

      function is_slide(cell: any)    {return get_slide_type(cell) == 'slide';}
      /*function is_subslide(cell: any) {return get_slide_type(cell) == 'subslide';}
      function is_fragment(cell: any) {return get_slide_type(cell) == 'fragment';}
      function is_skip(cell: any)     {return get_slide_type(cell) == 'skip';}
      function is_notes(cell: any)    {return get_slide_type(cell) == 'notes';}*/

      function markup_slides(container: any) {
        let slide_section;
        let slide_counter = 0;
        let cells = container.model.cells;

        for (let cell_index=0; cell_index < cells.length; cell_index ++) {
          let cell = cells.get(cell_index);
          //let slide_type = get_slide_type(cell);

          let cell_node = container.node.children[slide_counter];
          let prev_slide_section = slide_section;

          if (is_slide(cell)) {
            // Start new slide
            slide_section = document.createElement('section');
            slide_section.appendChild(cell_node);
            if (cell_index === 0) {
              container.node.insertBefore(slide_section, container.node.firstChild);
            } else {
              container.node.insertBefore(slide_section, prev_slide_section.nextSibling);
            }
            slide_counter++;
            console.log("slide-separating cell", cell_index);
            console.log(slide_section);
          } else {
            slide_section.appendChild(cell_node);
            console.log("Nop cell", cell_index);
          }
        }
      }

      let notebook = panel.content;
      markup_slides(notebook);

      panel.node.classList.add('reveal');
      /*panel.node.querySelector('.jp-Notebook').classList.add('slides');*/
      panel.content.addClass('slides');

      console.log("about to load unpatched Reveal css")
      let revealCSS = require('reveal.js/css/reveal.css');
      console.log(revealCSS);
      //let revealTheme = require('reveal.js/css/theme/simple.css');

      console.log("about to trigger Reveal")

      Reveal.initialize({
				controls: true,
				progress: true,
				history: true,
				center: true,

        transition: 'slide', // none/fade/slide/convex/concave/zoom
        // make codemirror works as expected
        minScale: 1.0,
        maxScale: 1.0
      });
      
      Reveal.addEventListener('ready', 
        () => console.log("reveal sent 'ready'"))

    };


    console.log("jlab rise is creating button");
    let button = new ToolbarButton({
      className: 'myButton',
      iconClassName: 'fa fa-bar-chart-o',
      onClick: callback,
      tooltip: 'RISE me',
    });

    let i = document.createElement('i');
    button.node.appendChild(i);

    panel.toolbar.addItem('rise', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}




/**
 * Initialization data for the jupyterlab-rise extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-rise',
  autoStart: true,
  activate: activate,
};

function activate(app: JupyterFrontEnd) {
  console.log('JupyterLab extension jupyterlab-rise #009 is activated!');
  app.docRegistry.addWidgetExtension('Notebook', new RiseExtension());
}

export default extension;
