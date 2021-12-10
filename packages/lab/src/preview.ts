import {
  IFrame,
  ToolbarButton,
  IWidgetTracker,
  Toolbar
} from '@jupyterlab/apputils';

import {
  ABCWidgetFactory,
  DocumentRegistry,
  DocumentWidget
} from '@jupyterlab/docregistry';

import { INotebookModel } from '@jupyterlab/notebook';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { refreshIcon } from '@jupyterlab/ui-components';

import { CommandRegistry } from '@lumino/commands';

import { PromiseDelegate, Token } from '@lumino/coreutils';

import { Message } from '@lumino/messaging';

import { Signal } from '@lumino/signaling';

import { Widget } from '@lumino/widgets';

import { fullScreenIcon, RISEIcon } from './icons';

/**
 * A class that tracks Rise Preview widgets.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IRisePreviewTracker extends IWidgetTracker<RisePreview> {}

/**
 * The Rise Preview tracker token.
 */
export const IRisePreviewTracker = new Token<IRisePreviewTracker>(
  'rise-jupyterlab:IRisePreviewTracker'
);

/**
 * A DocumentWidget that shows a Rise preview in an IFrame.
 */
export class RisePreview extends DocumentWidget<IFrame, INotebookModel> {
  /**
   * Instantiate a new RisePreview.
   * @param options The RisePreview instantiation options.
   */
  constructor(options: RisePreview.IOptions) {
    super({
      ...options,
      content: new IFrame({
        sandbox: [
          'allow-same-origin',
          'allow-scripts',
          'allow-downloads',
          'allow-modals',
          'allow-popups'
        ]
      })
    });

    this._ready = new PromiseDelegate<void>();
    // `setActiveCellIndex` needs to be called at least once.
    // after instantiation.
    this._ready.reject('Not loading at instantiation.');

    const { getRiseUrl, context, renderOnSave, translator } = options;
    this.getRiseUrl = getRiseUrl;
    this._path = context.path;

    const trans = (translator ?? nullTranslator).load('rise');

    this.content.title.icon = RISEIcon;

    this._renderOnSave = renderOnSave ?? false;

    context.pathChanged.connect(() => {
      this.path = context.path;
    });

    const reloadButton = new ToolbarButton({
      icon: refreshIcon,
      tooltip: trans.__('Reload Preview'),
      onClick: () => {
        this.reload();
      }
    });

    const renderOnSaveCheckbox = new Private.CheckBox({
      checked: this._renderOnSave,
      onChange: (event: Event) => {
        this._renderOnSave = (event.target as any)?.checked ?? false;
      },
      translator
    });

    this.toolbar.addItem(
      'fullscreen',
      new ToolbarButton({
        icon: fullScreenIcon,
        tooltip: trans.__('Open the slideshow in full screen'),
        onClick: () => {
          options.commands.execute('RISE:fullscreen-plugin');
        }
      })
    );

    if (context) {
      this.toolbar.addItem('renderOnSave', renderOnSaveCheckbox);
      void context.ready.then(() => {
        context.fileChanged.connect(() => {
          if (this.renderOnSave) {
            this.reload();
          }
        });
      });
    }

    this.toolbar.addItem('spacer', Toolbar.createSpacerItem());

    this.toolbar.addItem('reload', reloadButton);
  }

  /**
   * Promise that resolves when the slideshow is ready
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * Dispose the preview widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    Signal.clearData(this);
  }

  /**
   * Reload the preview.
   */
  reload(): void {
    const iframe = this.content.node.querySelector('iframe')!;
    if (iframe.contentWindow) {
      iframe.contentWindow.location.reload();
    }
  }

  /**
   * Whether the preview reloads when the context is saved.
   */
  get renderOnSave(): boolean {
    return this._renderOnSave;
  }

  setActiveCellIndex(index: number, reload = true): void {
    const iframe = this.content.node.querySelector('iframe')!;
    if (reload) {
      this._ready = new PromiseDelegate<void>();
      const setReady = () => {
        iframe.contentWindow!.removeEventListener('load', setReady);
        const waitForReveal = setInterval(() => {
          if (iframe.contentDocument!.querySelector('.reveal')) {
            clearInterval(waitForReveal);
            this._ready.resolve();
          }
        }, 500);
      };

      this.content.url = this.getRiseUrl(this.path, index);
      iframe.contentWindow!.addEventListener('load', setReady);
    } else {
      if (iframe.contentWindow) {
        iframe.contentWindow.history.pushState(
          null,
          '',
          this.getRiseUrl(this.path, index)
        );
      }
    }
  }

  protected get path(): string {
    return this._path;
  }
  protected set path(v: string) {
    if (v !== this._path) {
      this._path = v;
      this.setActiveCellIndex(0);
    }
  }

  protected getRiseUrl: (path: string, index?: number) => string;
  private _ready: PromiseDelegate<void>;
  private _renderOnSave: boolean;
  private _path: string;
}

/**
 * A namespace for RisePreview statics.
 */
export namespace RisePreview {
  /**
   * Instantiation options for `RisePreview`.
   */
  export interface IOptions
    extends DocumentWidget.IOptionsOptionalContent<IFrame, INotebookModel> {
    /**
     * Application commands registry
     */
    commands: CommandRegistry;
    /**
     * The Rise URL function.
     */
    getRiseUrl: (path: string, index?: number) => string;

    /**
     * Whether to reload the preview on context saved.
     */
    renderOnSave?: boolean;
  }
}

export class RisePreviewFactory extends ABCWidgetFactory<
  RisePreview,
  INotebookModel
> {
  defaultRenderOnSave = false;

  constructor(
    private getRiseUrl: (path: string) => string,
    private commands: CommandRegistry,
    options: DocumentRegistry.IWidgetFactoryOptions<RisePreview>
  ) {
    super(options);
  }

  protected createNewWidget(
    context: DocumentRegistry.IContext<INotebookModel>
  ): RisePreview {
    return new RisePreview({
      context,
      commands: this.commands,
      getRiseUrl: this.getRiseUrl,
      renderOnSave: this.defaultRenderOnSave
    });
  }
}

namespace Private {
  /**
   * Namespace for the checkbox widget
   */
  export namespace CheckBox {
    /**
     * Constructor options for the checkbox
     */
    export interface IOptions {
      /**
       * Checkbox initial value
       */
      checked?: boolean;
      /**
       * Callback on checked status changes
       */
      onChange?: (ev: Event) => void;
      /**
       * Translator
       */
      translator?: ITranslator;
    }
  }

  /**
   * Simple checkbox
   */
  export class CheckBox extends Widget {
    constructor(options: CheckBox.IOptions = {}) {
      const trans = (options.translator ?? nullTranslator).load('rise');
      const node = document.createElement('label');
      node.insertAdjacentHTML(
        'afterbegin',
        `<input name="renderOnSave" type="checkbox"></input>${trans.__(
          'Render on Save'
        )}`
      );
      super({ node });
      this.input = node.childNodes.item(0) as HTMLInputElement;
      this.checked = options.checked ?? false;
      const noOp = () => {
        // no-op
      };
      this.onChange = options.onChange ?? noOp;
    }

    /**
     * Checkbox status
     */
    get checked(): boolean {
      return this.input.checked;
    }
    set checked(v: boolean) {
      this.input.checked = v;
    }

    /**
     * Checkbox status callback
     */
    protected onChange: (event: Event) => void;

    protected onAfterAttach(msg: Message): void {
      super.onAfterAttach(msg);
      this.input.addEventListener('change', this.onChange);
    }

    protected onBeforeDetach(msg: Message): void {
      this.input.removeEventListener('change', this.onChange);
      super.onBeforeDetach(msg);
    }

    protected input: HTMLInputElement;
  }
}
