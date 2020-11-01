# rise-jupyterlab

A JupyterLab extension to turn your Jupyter Notebooks into a live presentation

## Requirements

* JupyterLab >= 2.0

## Install

```bash
jupyter labextension install rise-jupyterlab
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the RISE repo to your local environment
# Move to lab directory
# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Install the local rise-reveal patched stuff
jupyter labextension link ../rise-reveal
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Build JupyterLab
jupyter lab build
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

### Uninstall

```bash
jupyter labextension uninstall rise-jupyterlab
```

