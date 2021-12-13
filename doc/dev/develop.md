## Development

---

**_Note_** this page is up-to-date for the jlab3 branch that has a new directory
layout; see the _Folder structure_ section below

---

You can install RISE in development mode in this way:

### Requirements

Use your usual package manager to install the required build tools.
Essentially you will need:

- `git`,
- `yarn` and `nodejs`,
- and of course `jupyter`,
- finally `sphinx` comes in handy to produce the documentation.

### Clone the git repo

    git clone https://github.com/damianavila/RISE.git
    cd RISE
    ROOT=$(pwd)

### Build frontend extensions

    yarn install
    yarn run build

Internally this will

1. fetch and patch the source code for `reveal.js`
2. pull the code for `reveal.js` from `rise-reveal` for the notebook extension
3. Generate the notebook extension assets
4. Generate the JupyterLab extension assets
5. Generate the stand-alone application assets

**Notes**:

- this is all that is needed at that stage
- later on you might want to take a look at `package.json` that has finer-grained targets,
  that the `build` target groups for your convenience
- in particular, if you only need to redo css, you can do `npm run build-css`
- also note that you can remove `reveal.js` from the static folder with `npm run clean-reveal`.

### Install RISE in developer mode

Second, let's install RISE in a editable form:

    pip install -e .
    jupyter server extension enable rise
    # jupyter serverextension enable rise
    jupyter labextension develop --overwrite .
    jupyter-nbextension install rise --py --sys-prefix --symlink
    jupyter-nbextension enable rise --py --sys-prefix

**Notes**:

- the `--symlink` argument is meant to allow you to modify the
  JavaScript code in-place. This feature however is probably not available in Win.

- If you cannot use this _symlink_ trick, you will need to
  "re-install" the nbextension to actually see any changes you made on the JS files.

- Also please make sure to properly and thoroughly reload your page in the browser;
  using _Shift_ when reloading is generally a good idea.

### Convenience

If you change the JupyterLab extension, the stand alone application or
the `less` source often, it can be convenient to enable
post-save automatic building of frontend assets, and for that you can use (in the root folder):

    yarn run watch

which will update the `css` and `javascript` code each time a change
happens on the disk. Kill with Control-C when you are done.

### Plugins development

We currently have a custom plugin for the notes: `notes_rise` If you need to
modify this part of the codebase, after you are happy with your changes, you
need to login to npm and push the package containing your changes (the package
will be build and upload by the `npm publish` command):

```
cd /plugin/notes/
npm login
npm publish
```

Finally, you need to update the main package.json file at the root directory to
grab the new version you just published.

### Folder structure

The package is now a unique Python package `rise` (at the folder root) that
will distribute the frontend for the classical notebook (in `rise/nbextension`)
and JupyterLab (in `rise/labextension`).

The development of the frontend code is mainly in packages (development version
that needs to be transpiled before being distributed within the Python package):

- _Classical notebook_ extension: It contains the extension for the classical notebook.
  - Javascript file is `rise/nbextension/main.js`
  - CSS file is `packages/classic/src/less/main.less`  
    It will be transpiled to `rise/nbextension/main.css`
- _JupyterLab_ extension: It contains the extension for JupyterLab (settings, keyboard shortcuts, toolbar button and preview panel)
  - This is the folder `packages/lab`
- _Standalone application_ (based on JupyterLab) - the place where Reveal is used to modify the DOM:
  - Definition of the application (what and how to load JupyterLab base packages) is in the folder `app`
  - Customization of the application for RISE is in the folder `packages/application`
    - In particular the entry point for opening the notebook with Reveal is in `packages/application/src/plugins/index.ts#opener`. And in particular the conversion of the notebook is done by `RevealUtils.startReveal`.
    - The other important file is `packages/application/src/app/index.ts`in which the main application object
      (including the shell) is defined.
