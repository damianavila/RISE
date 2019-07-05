Changelog
---------

Versions
========

1. **RISE** master branch will be following the **Jupyter** codebase.

2. There is also "released" tagged [branches](https://github.com/damianavila/RISE/releases)
compatible with previous IPython versions:

    *  1.x tag compatible with **IPython** 1.x series
    *  2.x tag compatible with **IPython** 2.x series
    *  3.x tag compatible with **IPython** 3.x series
    *  3.x.1 tag also compatible with `notebook` 4.x series, but using old installation mechanism
    *  4.0.0b1 tag compatible with the `notebook` 4.2 and above, beta release, please test and report any issues
    *  5.0.0 tag compatible with `notebook` >= 5.0.0
    *  5.1.0 tag compatible with `notebook` >= 5.0.0
    *  5.2.0 tag compatible with `notebook` >= 5.0.0
    *  5.3.0 tag compatible with `notebook` >= 5.5.0
    *  5.4.1 tag compatible with `notebook` >= 5.5.0
    *  5.5.0 tag compatible with `notebook` >= 5.5.0

3. With **Jupyter** landing we will provide a conda and pip-installable packages too

**NOTE**: We will only maintain the latest released version.

Changes
=======

* 5.5.1

  * bugfix: a few users have reported broken initialisation phase, with the 2 icons '?' and 'X' not showing up; it appears that problem is linked to having undefined the 'f' Jupyter keyboard shortcut; this hotfix solves that issue.

* 5.5.0

  * Updates channel to conda-forge (https://github.com/damianavila/RISE/pull/422)
  * New keys shortcuts to toggle slidetype, update examples, fix auto-select feature broken with an initial invisible 'skip' cell, make auto_select_timeout configurable, hide chalkboard buttons (https://github.com/damianavila/RISE/pull/436)
  * Install the nbextension as part of "pip install" (https://github.com/damianavila/RISE/pull/444)
  * Release docs updates (https://github.com/damianavila/RISE/pull/457)
  * Remove duplicated text in notes view (https://github.com/damianavila/RISE/pull/458)
  * Fix x-scrolling bar in markdown cells containing code (https://github.com/damianavila/RISE/pull/459)
  * Upload author email and blog url, also bump notes_rise version (https://github.com/damianavila/RISE/pull/460)
  * Migrate pdfexport docs from rst to md (https://github.com/damianavila/RISE/pull/461)
  * Enhance docs, new versioning stuff, reference latest notes_rise and fix remaining old email (https://github.com/damianavila/RISE/pull/463)
  * More docs updates towards the upcoming release (https://github.com/damianavila/RISE/pull/464)
  * Fix formatting in installation.rst (https://github.com/damianavila/RISE/pull/465)
  * Fix some typos and examples, add more docs, fix margin-bottom css (https://github.com/damianavila/RISE/pull/467)
  * Add redirection page in gh-pages pointing to the official docs (commit a161a65ea93062ebf7715a5fccc152b70c6f6262)
  * Create 5.4.2 conda packages on conda-forge (https://github.com/conda-forge/rise-feedstock/pull/21)
  * Fix changelog formatting (https://github.com/damianavila/RISE/pull/470)

* 5.4.1

  * Support chalkboard functionality (https://github.com/damianavila/RISE/pull/355)
  * Support speaker notes (https://github.com/damianavila/RISE/issues/174)
  * Use a version number that npm can understand (https://github.com/damianavila/RISE/pull/410)
  * Enhancement in setup.py and reduction of hard-written versions(https://github.com/damianavila/RISE/pull/399)
  * Include LICENSE.md file in wheels (https://github.com/damianavila/RISE/pull/394)
  * Fix python_requires (https://github.com/damianavila/RISE/pull/390)
  * Remove conda recipe from the repo (https://github.com/damianavila/RISE/issues/405)
  * Make the configurator comtaible with notebook 5.x versions (https://github.com/damianavila/RISE/pull/414)
  * Docs fixes in exportation section (https://github.com/damianavila/RISE/pull/415)
  * Make RISE compatible with python 3.7 (https://github.com/damianavila/RISE/issues/406)
  * Update changelog (https://github.com/damianavila/RISE/pull/416)
  * Add new JS files to the manifest (https://github.com/damianavila/RISE/pull/417)
  * Bump 5.4.0 version (https://github.com/damianavila/RISE/pull/418)

* 5.4.0 packages were removed from PyPI because they were broken.

* 5.3.0

  * Auto enable nbextension when installing with pip (https://github.com/damianavila/RISE/pull/342)
  * Making rise compliant with nbextensions_configurator (https://github.com/damianavila/RISE/pull/344)
  * Documentation general review, fixes and improvements (https://github.com/damianavila/RISE/pull/347)
  * Mixup between `note` and `notes` (https://github.com/damianavila/RISE/pull/372)
  * Keep `?` from popping up keyboard shortcuts (https://github.com/damianavila/RISE/pull/373)
  * Create shortcut to go to the configurator (https://github.com/damianavila/RISE/pull/376)
  * General review of `setup.py` (https://github.com/damianavila/RISE/pull/387)

* 5.2.0

  * Source code cleanup and normalization (https://github.com/damianavila/RISE/pull/311)
  * Add some docs updates (https://github.com/damianavila/RISE/pull/312)
  * Add sidebar for all doc pages (https://github.com/damianavila/RISE/pull/314)
  * Improve customization reference docs (https://github.com/damianavila/RISE/pull/318)
  * Set new defaults for ``auto_select`` and ``start_slideshow_at`` options (https://github.com/damianavila/RISE/pull/323)
  * Refactor actions and fix wide toolbar button (https://github.com/damianavila/RISE/pull/324)
  * Update docs deployment instructions (https://github.com/damianavila/RISE/pull/325) and (https://github.com/damianavila/RISE/pull/326)
  * Make the output observer aware of the scrolling needs (https://github.com/damianavila/RISE/pull/327)
  * Add basic usage gif into the docs (https://github.com/damianavila/RISE/pull/328)
  * Fix list not correctly displayed in docs (https://github.com/damianavila/RISE/pull/338)
  * Add disable and removal section, add note about browser zoom in/out, add PDF export section and add a real changelog for 5.1.1 (https://github.com/damianavila/RISE/pull/339)

Previous lazy changelogs:

* 5.1.0: https://github.com/damianavila/RISE/milestone/5?closed=1
* 5.0.0: https://github.com/damianavila/RISE/milestone/4?closed=1
* 4.x series: https://github.com/damianavila/RISE/milestone/1?closed=1
