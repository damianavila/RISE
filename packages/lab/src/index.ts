import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  CommandToolbarButton,
  ICommandPalette,
  showDialog,
  WidgetTracker
} from '@jupyterlab/apputils';

import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  INotebookModel,
  INotebookTracker,
  Notebook,
  NotebookPanel
} from '@jupyterlab/notebook';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ITranslator } from '@jupyterlab/translation';

import { toArray } from '@lumino/algorithm';

import { ReadonlyPartialJSONObject } from '@lumino/coreutils';

import { fullScreenIcon, RISEIcon } from './icons';

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
  export const riseFullScreen = 'RISE:fullscreen-plugin';
  /**
   * Open the current notebook in a IFrame within JupyterLab
   */
  export const risePreview = 'RISE:preview';
  /**
   * Set the slide attribute of a cell
   */
  export const riseSetSlideType = 'RISE:set-slide-type';
}

/**
 * Open the notebook with RISE.
 */
const plugin: JupyterFrontEndPlugin<IRisePreviewTracker> = {
  id: 'rise-jupyterlab:plugin',
  autoStart: true,
  requires: [ITranslator],
  optional: [
    INotebookTracker,
    ICommandPalette,
    ILayoutRestorer,
    ISettingRegistry
  ],
  provides: IRisePreviewTracker,
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,
    notebookTracker: INotebookTracker | null,
    palette: ICommandPalette | null,
    restorer: ILayoutRestorer | null,
    settingRegistry: ISettingRegistry | null
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

    let settings: ISettingRegistry.ISettings | null = null;
    if (settingRegistry) {
      settingRegistry.load(plugin.id).then(config => {
        settings = config;
      });
    }

    const factory = new RisePreviewFactory(getRiseUrl, commands, {
      name: 'rise',
      fileTypes: ['notebook'],
      modelName: 'notebook'
    });

    if (restorer) {
      restorer.restore(tracker, {
        // Need to modify to handle auto full screen
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

    function getRiseUrl(path: string, activeCellIndex?: number): string {
      const baseUrl = PageConfig.getBaseUrl();
      let url = `${baseUrl}rise/${path}`;
      if (typeof activeCellIndex === 'number') {
        url += URLExt.objectToQueryString({ activeCellIndex });
      }
      return url;
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
      execute: async () => {
        const current = notebookTracker.currentWidget;
        if (!current) {
          return;
        }
        await current.context.save();
        window.open(
          getRiseUrl(current.context.path, current.content.activeCellIndex)
        );
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

          const widget: RisePreview = await commands.execute(
            'docmanager:open',
            {
              path: context.path,
              factory: 'rise',
              options: {
                mode: 'split-right'
              }
            }
          );

          const updateActiveIndex = (notebook: Notebook) => {
            widget.setActiveCellIndex(notebook.activeCellIndex, false);
          };
          widget.setActiveCellIndex(current.content.activeCellIndex);
          current.content.activeCellChanged.connect(updateActiveIndex);

          widget.disposed.connect(() => {
            current.content.activeCellChanged.disconnect(updateActiveIndex);
          });

          if (args['fullscreen'] === true) {
            widget.ready
              .then(() => {
                showDialog({
                  title: trans.__('Switch to full screen'),
                  body: trans.__(
                    'The slideshow is set to automatically open in full screen. Your web browser requires your confirmation to do so.'
                  )
                }).then(result => {
                  if (result.button.accept) {
                    commands.execute(CommandIDs.riseFullScreen, {
                      id: widget.id
                    });
                  }
                });
              })
              .catch(reason => {
                console.log(reason);
              });
          }
        }
      },
      isEnabled
    });

    commands.addCommand(CommandIDs.riseFullScreen, {
      label: trans.__('Full screen slideshow'),
      caption: trans.__('Toggle full screen the current active slideshow'),
      icon: fullScreenIcon,
      execute: async args => {
        if (args['id']) {
          app.shell.activateById(args['id'] as string);
        }
        const current = args['id']
          ? toArray(app.shell.widgets('main')).find(
              widget => widget.id === args['id']
            )
          : app.shell.currentWidget;
        if (current && tracker.has(current)) {
          const iframe = (current as RisePreview).content.node.querySelector(
            'iframe'
          );
          if (iframe) {
            if (
              !document.fullscreenElement &&
              !iframe.contentDocument?.fullscreenElement
            ) {
              const goFullScreen = () => {
                iframe?.contentWindow?.document
                  .querySelector('div.reveal')
                  ?.requestFullscreen();
              };
              if (iframe.contentDocument?.readyState === 'complete') {
                goFullScreen();
              } else {
                iframe.contentWindow?.addEventListener('load', goFullScreen);
              }
            } else {
              if (document.exitFullscreen) {
                await document.exitFullscreen();
              }
            }
          }
        }
      },
      isEnabled: () =>
        !!app.shell.currentWidget && tracker.has(app.shell.currentWidget)
    });

    commands.addCommand(CommandIDs.riseSetSlideType, {
      label: args => trans.__('Toggle slideshow %1 type', args['type']),
      caption: args =>
        trans.__('(Un)set active cell as a %1 cell', args['type']),
      execute: args => {
        const value = args['type'];
        const current = app.shell.currentWidget;
        if (current && notebookTracker.has(current)) {
          const cellModel = (current as NotebookPanel).content.activeCell
            ?.model;
          if (cellModel) {
            const currentValue =
              (cellModel.metadata.get('slideshow') as
                | ReadonlyPartialJSONObject
                | undefined) ?? {};
            if (value !== currentValue['slide_type']) {
              const newValue = { ...currentValue };
              if (value) {
                newValue['slide_type'] = value;
              } else {
                delete newValue['slide_type'];
              }

              if (Object.keys(newValue).length > 0) {
                cellModel.metadata.set('slideshow', newValue);
              } else {
                cellModel.metadata.delete('slideshow');
              }
            }
          }
        }
      },
      isToggled: args => {
        const value = args['type'];
        const current = app.shell.currentWidget;
        if (current && notebookTracker.has(current)) {
          const cellModel = (current as NotebookPanel).content.activeCell
            ?.model;
          if (cellModel) {
            const currentValue =
              (cellModel.metadata.get('slideshow') as
                | ReadonlyPartialJSONObject
                | undefined) ?? {};
            return currentValue['slide_type'] === value && !!value;
          }
        }

        return false;
      },
      isEnabled: args =>
        ['slide', 'subslide', 'fragment', 'skip', 'notes'].includes(
          (args['type'] as string) ?? ''
        )
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

        // Don't trigger auto launch in stand-alone Rise application.
        if (app.name !== 'Rise') {
          await panel.context.ready;

          let autolaunch: boolean =
            // @ts-expect-error Unknown type
            (panel.content.model?.metadata.get('rise') ?? {})['autolaunch'] ??
            false;
          if (settings) {
            // @ts-expect-error unknown type
            autolaunch |= settings.get('autolaunch').composite;
          }

          if (autolaunch) {
            await commands.execute(CommandIDs.risePreview, {
              fullscreen: true
            });
          }
        }
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
