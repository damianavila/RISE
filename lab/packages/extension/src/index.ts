import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Open the notebook with RISE.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'rise-jupyterlab:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('rise-jupyterlab extension activated');
  }
};

export default plugin;
