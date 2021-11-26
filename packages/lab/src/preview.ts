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

import { refreshIcon } from '@jupyterlab/ui-components';

import { CommandRegistry } from '@lumino/commands';

import { Token } from '@lumino/coreutils';

import { Message } from '@lumino/messaging';

import { Signal } from '@lumino/signaling';

import { Widget } from '@lumino/widgets';

import { RISEIcon } from './icons';

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

    const { getRiseUrl, context, renderOnSave } = options;
    this.getRiseUrl = getRiseUrl;
    this._path = context.path;

    this.content.title.icon = RISEIcon;

    this._renderOnSave = renderOnSave ?? false;

    context.pathChanged.connect(() => {
      this.path = context.path;
    });

    const reloadButton = new ToolbarButton({
      icon: refreshIcon,
      tooltip: 'Reload Preview',
      onClick: () => {
        this.reload();
      }
    });

    const renderOnSaveCheckbox = new Private.CheckBox({
      checked: this._renderOnSave,
      onChange: (event: Event) => {
        this._renderOnSave = (event.target as any)?.checked ?? false;
      }
    });

    this.toolbar.addItem(
      'open',
      new ToolbarButton({
        icon: RISEIcon,
        tooltip: 'Open in a new browser tab',
        onClick: () => {
          options.commands.execute('rise-jupyterlab:open');
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
    if (reload) {
      this.content.url = this.getRiseUrl(this.path, index);
    } else {
      const iframe = this.content.node.querySelector('iframe')!;
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

  private _renderOnSave: boolean;
  protected getRiseUrl: (path: string, index?: number) => string;
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
    getRiseUrl: (path: string) => string;

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
    }
  }

  /**
   * Simple checkbox
   */
  export class CheckBox extends Widget {
    constructor(options: CheckBox.IOptions = {}) {
      const node = document.createElement('label');
      node.insertAdjacentHTML(
        'afterbegin',
        '<input name="renderOnSave" type="checkbox"></input>Render on Save'
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
