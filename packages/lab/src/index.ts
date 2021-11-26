import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  CommandToolbarButton,
  ICommandPalette,
  WidgetTracker
} from '@jupyterlab/apputils';

import { PageConfig } from '@jupyterlab/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  INotebookModel,
  INotebookTracker,
  NotebookPanel
} from '@jupyterlab/notebook';

import { ITranslator } from '@jupyterlab/translation';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { RISEIcon } from './icons';

import {
  RisePreview,
  IRisePreviewTracker,
  RisePreviewFactory
} from './preview';

export { IRisePreviewTracker } from './preview';

/**
 * Command IDs namespace for JupyterLab RISE extension
 */
namespace CommandIDs {
  /**
   * Open the current notebook in a new browser tab
   */
  export const openRise = 'RISE:slideshow';
  /**
   * Open the current notebook in a IFrame within JupyterLab
   */
  export const risePreview = 'RISE:preview';
  /**
   *
   */
  export const riseSmartExec = 'RISE:smart-exec';
  export const riseToggleSlide = 'RISE:toggle-slide';
  export const riseToggleSubSlide = 'RISE:toggle-subslide';
  export const riseToggleFragment = 'RISE:toggle-fragment';
  export const riseToggleNotes = 'RISE:toggle-notes';
  export const riseToggleSkip = 'RISE:toggle-skip';
}

/**
 * Open the notebook with RISE.
 */
const plugin: JupyterFrontEndPlugin<IRisePreviewTracker> = {
  id: 'rise-jupyterlab:plugin',
  autoStart: true,
  requires: [ITranslator],
  optional: [INotebookTracker, ICommandPalette, ILayoutRestorer],
  provides: IRisePreviewTracker,
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,
    notebookTracker: INotebookTracker | null,
    palette: ICommandPalette | null,
    restorer: ILayoutRestorer | null
  ): IRisePreviewTracker => {
    // Create a widget tracker for Rise Previews.
    const tracker = new WidgetTracker<RisePreview>({
      namespace: 'rise'
    });

    if (!notebookTracker) {
      return tracker;
    }

    const { commands, docRegistry, shell } = app;
    const trans = translator.load('rise');

    const factory = new RisePreviewFactory(getRiseUrl, commands, {
      name: 'rise',
      fileTypes: ['notebook'],
      modelName: 'notebook'
    });

    if (restorer) {
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: panel => ({
          path: panel.context.path,
          factory: factory.name
        }),
        name: panel => panel.context.path,
        when: app.serviceManager.ready
      });
    }

    docRegistry.addWidgetFactory(factory);

    function getCurrent(args: ReadonlyPartialJSONObject): NotebookPanel | null {
      const widget = notebookTracker?.currentWidget ?? null;
      const activate = args['activate'] !== false;

      if (activate && widget) {
        shell.activateById(widget.id);
      }

      return widget;
    }

    function isEnabled(): boolean {
      return (
        notebookTracker?.currentWidget !== null &&
        notebookTracker?.currentWidget === shell.currentWidget
      );
    }

    function getRiseUrl(path: string): string {
      const baseUrl = PageConfig.getBaseUrl();
      return `${baseUrl}rise/${path}`;
    }

    factory.widgetCreated.connect((sender, widget) => {
      // Notify the widget tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => {
        void tracker.save(widget);
      });
      // Add the notebook panel to the tracker.
      void tracker.add(widget);
    });

    commands.addCommand(CommandIDs.openRise, {
      label: args => (args.toolbar ? '' : trans.__('Open as Reveal Slideshow')),
      caption: trans.__(
        'Open the current notebook in a new browser tab as an RevealJS slideshow.'
      ),
      icon: RISEIcon,
      execute: async () => {
        const current = notebookTracker.currentWidget;
        if (!current) {
          return;
        }
        await current.context.save();
        window.open(getRiseUrl(current.context.path));
      },
      isEnabled
    });

    commands.addCommand(CommandIDs.risePreview, {
      label: args =>
        args.toolbar ? '' : trans.__('Render as Reveal Slideshow'),
      caption: trans.__('Render the current notebook as Reveal Slideshow'),
      icon: RISEIcon,
      execute: async args => {
        const current = getCurrent(args);
        let context: DocumentRegistry.IContext<INotebookModel>;
        if (current) {
          context = current.context;
          await context.save();

          commands.execute('docmanager:open', {
            path: context.path,
            factory: 'rise',
            options: {
              mode: 'split-right'
            }
          });
        }
      },
      isEnabled
    });

    notebookTracker.widgetAdded.connect(
      async (sender: INotebookTracker, panel: NotebookPanel) => {
        panel.toolbar.insertBefore(
          'kernelName',
          'RISE-button',
          new CommandToolbarButton({
            commands,
            id: CommandIDs.risePreview,
            args: { toolbar: true }
          })
        );
      }
    );

    if (palette) {
      const category = 'Notebook Operations';
      [CommandIDs.openRise, CommandIDs.risePreview].forEach(command => {
        palette.addItem({ command, category });
      });
    }

    return tracker;
  }
};

export default plugin;
