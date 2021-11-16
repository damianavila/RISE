import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { CommandToolbarButton, ICommandPalette } from '@jupyterlab/apputils';

import { PageConfig } from '@jupyterlab/coreutils';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { ITranslator } from '@jupyterlab/translation';

import { RISEIcon } from './icons';

/**
 * Command IDs namespace for JupyterLab RISE extension
 */
namespace CommandIDs {
  export const openRise = 'rise-jupyterlab:open';
}

/**
 * Open the notebook with RISE.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'rise-jupyterlab:plugin',
  autoStart: true,
  requires: [ITranslator],
  optional: [INotebookTracker, ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,
    notebookTracker: INotebookTracker | null,
    palette: ICommandPalette | null
  ) => {
    if (!notebookTracker) {
      return;
    }

    const { commands, shell } = app;
    const baseUrl = PageConfig.getBaseUrl();
    const trans = translator.load('rise');

    commands.addCommand(CommandIDs.openRise, {
      label: args => (args.toolbar ? '' : trans.__('Open as Reveal Slideshow')),
      caption: trans.__('Open the current notebook as an RevealJS slideshow.'),
      icon: RISEIcon,
      execute: () => {
        const current = notebookTracker.currentWidget;
        if (!current) {
          return;
        }
        window.open(`${baseUrl}rise/${current.context.path}`);
      },
      isEnabled: () =>
        notebookTracker.currentWidget !== null &&
        notebookTracker.currentWidget === shell.currentWidget
    });

    notebookTracker.widgetAdded.connect(
      async (sender: INotebookTracker, panel: NotebookPanel) => {
        panel.toolbar.insertBefore(
          'kernelName',
          'RISE-button',
          new CommandToolbarButton({
            commands,
            id: CommandIDs.openRise,
            args: { toolbar: true }
          })
        );
      }
    );

    if (palette) {
      palette.addItem({ command: CommandIDs.openRise, category: 'Other' });
    }
  }
};

export default plugin;
