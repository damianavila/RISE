# jupyterlab_rise

A JupyterLab extension to turn your Jupyter Notebooks into a live presentation


## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab_rise
```

## Development

For a development install (requires npm version 4 or later), if you are using conda: 

```bash
conda create -n jupyterlab_rise_dev
source activate jupyterlab_rise_dev
conda install -c https://repo.continuum.io/pkgs/main nodejs jupyterlab python=3.6
```

and then do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension install .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

For more information, JupyterLab extensions docs live at:

* http://jupyterlab.readthedocs.io/en/latest/developer/extension_dev.html
* http://jupyterlab.readthedocs.io/en/latest/developer/xkcd_extension_tutorial.html
