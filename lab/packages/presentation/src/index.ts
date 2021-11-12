// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IChangedArgs, PageConfig, URLExt } from "@jupyterlab/coreutils";
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  "example/"
);
// TODO quid extension...
// import "@jupyterlab/application/style/index.css";
// import "@jupyterlab/codemirror/style/index.css";
import "@jupyterlab/notebook/style/index.css";
import "@jupyterlab/theme-light-extension/style/theme.css";
import "rise-reveal/css/reveal.css";
import "rise-reveal/css/theme/simple.css";
// require('../style/rise.css');
import "../index.css";

import Reveal from "rise-reveal";

import { CommandRegistry } from "@lumino/commands";

import { SplitPanel, Widget } from "@lumino/widgets";

import { ServiceManager } from "@jupyterlab/services";
import { MathJaxTypesetter } from "@jupyterlab/mathjax2";

import {
  INotebookModel,
  NotebookModelFactory,
  NotebookPanel,
  NotebookWidgetFactory,
} from "@jupyterlab/notebook";

import { editorServices } from "@jupyterlab/codemirror";

import { DocumentManager } from "@jupyterlab/docmanager";

import { DocumentRegistry } from "@jupyterlab/docregistry";

import {
  standardRendererFactories as initialFactories,
  RenderMimeRegistry,
} from "@jupyterlab/rendermime";

function main(): void {
  const manager = new ServiceManager();
  void manager.ready.then(() => {
    createApp(manager);
  });
}

function startReveal(panel: NotebookPanel): void {
  function get_slide_type(cell: any) {
    let slideshow = cell.metadata.get("slideshow") || {};
    let slide_type = (slideshow as any)["slide_type"];
    //console.log(slide_type);
    return slide_type === undefined || slide_type == "-" ? "" : slide_type;
  }

  // function is_slide(cell: any)    {return get_slide_type(cell) == 'slide';}
  // function is_subslide(cell: any) {return get_slide_type(cell) == 'subslide';}
  // function is_fragment(cell: any) {return get_slide_type(cell) == 'fragment';}
  // function is_regular(cell: any)  {return get_slide_type(cell) == '';

  function markupSlides(container: any) {
    let slide_section;
    let slide_counter = 0;
    let cells = container.model.cells;

    for (let i = 0; i < cells.length; i++) {
      let cell = cells.get(i);
      let slide_type = get_slide_type(cell);

      let cell_node = container.node.children[slide_counter];
      let prev_slide_section = slide_section;

      if (slide_type === "slide") {
        // Start new slide
        slide_section = document.createElement("section");
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
        console.log("Sep slide", i);
      } else {
        slide_section?.appendChild(cell_node);
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

  Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,

    transition: "slide", // none/fade/slide/convex/concave/zoom
    //make codemirror works as expected
    minScale: 1.0,
    maxScale: 1.0,
  });
}

function createApp(manager: ServiceManager.IManager): void {
  // Initialize the command registry with the bindings.
  const commands = new CommandRegistry();
  const useCapture = true;

  // Setup the keydown listener for the document.
  document.addEventListener(
    "keydown",
    (event) => {
      commands.processKeydownEvent(event);
    },
    useCapture
  );

  const rendermime = new RenderMimeRegistry({
    initialFactories: initialFactories,
    latexTypesetter: new MathJaxTypesetter({
      url: PageConfig.getOption("mathjaxUrl"),
      config: PageConfig.getOption("mathjaxConfig"),
    }),
  });

  const opener = {
    open: (widget: Widget) => {
      // Do nothing for sibling widgets for now.
    },
  };

  const docRegistry = new DocumentRegistry();
  const docManager = new DocumentManager({
    registry: docRegistry,
    manager,
    opener,
  });
  const mFactory = new NotebookModelFactory({});
  const editorFactory = editorServices.factoryService.newInlineEditor;
  const contentFactory = new NotebookPanel.ContentFactory({ editorFactory });

  const wFactory = new NotebookWidgetFactory({
    name: "Notebook",
    modelName: "notebook",
    fileTypes: ["notebook"],
    defaultFor: ["notebook"],
    preferKernel: true,
    canStartKernel: true,
    rendermime,
    contentFactory,
    mimeTypeService: editorServices.mimeTypeService,
    toolbarFactory: () => [],
  });
  docRegistry.addModelFactory(mFactory);
  docRegistry.addWidgetFactory(wFactory);

  const notebookPath = PageConfig.getOption("notebookPath");
  const nbWidget = docManager.open(notebookPath) as NotebookPanel;

  const panel = new SplitPanel();
  panel.id = "main";
  panel.orientation = "horizontal";
  panel.spacing = 0;
  SplitPanel.setStretch(nbWidget, 1);
  panel.addWidget(nbWidget);

  // Attach the panel to the DOM.
  Widget.attach(panel, document.body);

  function initializeReveal(
    _: INotebookModel,
    change: IChangedArgs<any, any, string>
  ) {
    if (change.name === "dirty" && change.newValue === false) {
      nbWidget.model?.stateChanged.disconnect(initializeReveal, this);
      startReveal(nbWidget);
    }
  }
  nbWidget.model?.stateChanged.connect(initializeReveal, this);

  // Handle resize events.
  window.addEventListener("resize", () => {
    panel.update();
  });
}

window.addEventListener("load", main);
