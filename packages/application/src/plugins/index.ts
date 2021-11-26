/* eslint-disable no-inner-declarations */
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { RiseApp } from '../app';
import { plugin } from './rise';

/**
 * The default paths for a Rise app.
 */
const paths: JupyterFrontEndPlugin<JupyterFrontEnd.IPaths> = {
  id: 'rise-extension:paths',
  autoStart: true,
  provides: JupyterFrontEnd.IPaths,
  activate: (app: JupyterFrontEnd): JupyterFrontEnd.IPaths => {
    if (!(app instanceof RiseApp)) {
      throw new Error(`${paths.id} must be activated in Rise.`);
    }
    return app.paths;
  }
};

export default [paths, plugin];
