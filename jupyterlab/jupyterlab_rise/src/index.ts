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

//import {
//  CodeMirrorEditor
//}  from '@jupyterlab/codemirror';

//import {
//  Reveal
//} from 'reveal.js/js/reveal.js';

//import 'reveal.js/css/reveal.css';
//import 'reveal.js/css/theme/simple.css';
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
 * A notebook widget extension that adds a button to the toolbar.
 */
export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let callback = () => {
      //*** working
      //let cells = panel.notebook.model.cells;
      //let slideshow = (cells.get(0).metadata.get("slideshow") || {});
      //let slide_type = (slideshow as JSONObject)['slide_type'];
      //console.log(slide_type);

      function get_slide_type(cell: any) {
        let slideshow = (cell.metadata.get("slideshow") || {});
        let slide_type = (slideshow as JSONObject)['slide_type'];
        console.log(slide_type);
       return ((slide_type === undefined) || (slide_type == '-')) ? '' : slide_type;
      }

      function is_slide(cell: any)    {console.log(get_slide_type(cell) == 'slide'); return get_slide_type(cell) == 'slide';}
      // function is_subslide(cell: any) {return get_slide_type(cell) == 'subslide';}
      // function is_fragment(cell: any) {return get_slide_type(cell) == 'fragment';}
      // function is_regular(cell: any)  {return get_slide_type(cell) == '';}
  
      let cells = panel.notebook.model.cells;
      let cell1 = cells.get(0);
      is_slide(cell1);

      //*** info
      // let cell = cells.get(0);
      //*** working
      // let cell = panel.notebook.node.children[0];
      // let cell_copy = cell.cloneNode(true);
      // 
      // let section = document.createElement('section');
      // section.appendChild(cell_copy);
      // 
      // let notebook = panel.notebook.node;
      // notebook.replaceChild(section, cell);
      //*** working
      // let cell = panel.notebook.node.children[0];
      // let s_cell = "<section>" + cell.outerHTML;
      // cell.outerHTML = s_cell;
      //*** working partially (not executable)
      // let cell_0 = panel.notebook.node.children[0];
      // let cell_1 = panel.notebook.node.children[1];
      // let cell_0_copy = cell_0.cloneNode(true);
      // let cell_1_copy = cell_1.cloneNode(true);
      // 
      // let section = document.createElement('section');
      // section.appendChild(cell_0_copy);
      // section.appendChild(cell_1_copy); 
      // let notebook = panel.notebook.node;
      // notebook.removeChild(cell_1);
      // notebook.replaceChild(section, cell_0);
      //*** working !!!
      let cell_0 = panel.notebook.node.children[0];
      let cell_1 = panel.notebook.node.children[1];
      let cell_2 = panel.notebook.node.children[2];
      let cell_3 = panel.notebook.node.children[3];
      
      let section_1 = document.createElement('section');
      section_1.appendChild(cell_0);
      section_1.appendChild(cell_1); 

      let section_2 = document.createElement('section');
      section_2.appendChild(cell_2);
      section_2.appendChild(cell_3); 
      
      let notebook = panel.notebook.node;
      notebook.insertBefore(section_2, notebook.lastChild);
      notebook.insertBefore(section_1, section_2);

      //*** working
      let panel_container = document.getElementsByClassName("jp-NotebookPanel")[0];
      panel_container.classList.add("reveal");
      console.log(panel_container);  

      let notebook_container = document.getElementsByClassName("jp-Notebook")[0];
      notebook_container.classList.add("slides");
      console.log(notebook_container);
      // display: none; in jp-Toolbar to get rid of the toolbar
      // *** working
      // var headID = document.getElementsByTagName('head')[0];
      // 
      // var link_reveal = document.createElement('link');
      // link_reveal.type = 'text/css';
      // link_reveal.rel = 'stylesheet';
      // link_reveal.id = 'reveal_css';
      // headID.appendChild(link_reveal);
      // link_reveal.href = './node_modules/reveal.js/css/reveal.css';
      // 
      // var link_theme = document.createElement('link');
      // link_theme.type = 'text/css';
      // link_theme.rel = 'stylesheet';
      // link_theme.id = 'reveal_css';
      // headID.appendChild(link_theme);
      // link_theme.href = './node_modules/reveal.js/css/theme/simple.css';      
      //

      let revealCSS = require('reveal_rise/reveal.css');
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
      //console.log(headMin);
      console.log(revealCSS);
      //console.log(revealTheme);
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
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
  console.log('JupyterLab extension jupyterlab_rise is activated!');
};

export default extension;
