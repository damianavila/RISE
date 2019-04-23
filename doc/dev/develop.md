## Development

You can install RISE in development mode in this way:

### Requirements

Use your usual package manager to install the required build tools.
Essentially you will need:

* `git`,
* `npm` and `nodejs`,
* and of course `jupyter`;
* `sphinx` comes in handy to produce the documentation.

### Clone the git repo

    git clone https://github.com/damianavila/RISE.git
    cd RISE

### Prepare a development tree

**Step 1.** Install the JS dependencies:

    npm install

**Step 2.** Copy reveal (plus others) into the static folder and reset reveal.js styling:

    npm run build

To remove `reveal.js` from the static folder you can use `npm run clean-reveal`.

**Step 3.** Build the CSS assets:

    npm run build-css

### Install RISE in developer mode

Second, let's install RISE in a editable form:

    pip install -e .
    jupyter-nbextension install rise --py --sys-prefix --symlink
    jupyter-nbextension enable rise --py --sys-prefix

**Notes**:

* the `--symlink` argument is meant to allow you to modify the
  JavaScript code in-place. This feature however is probably not available in Win.

* If you cannot use this *symlink* trick, you will need to
  "re-install" the nbextension to actually see any changes you made on th JS files.

* Also please make sure to properly and thoroughly reload your page in the browser;
  using *Shift* when reloading is generally a good idea.

### Convenience

If you change the `less` source often, it can be convenient to enable
per-save automatic building of CSS, and for that you can use:

    npm run watch-less

which will update the `css` code from `less` each time a change
happens on the disk. Kill with Control-C when you are done.

### Plugins development

We currently have a custom plugin for the notes: `notes_rise`
If you need to modify this part of the codebase, after you are happy with your changes, you need to login to npm and push the package containing your changes (the package will be build and upload by the `npm publish` command):

```
cd /plugin/notes/
npm login
npm publish
```

Finally, you need to update the main package.json file at the root directory to grab the new version you just published.
