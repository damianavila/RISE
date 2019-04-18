## Releases

Instructions and notes for preparing and publishing a release.

### Pre-Release check

**Step 1.** Clean your local repo copy:

    git clean -fdx

**Step 2.** Build the JS and CSS:

    npm install
    npm run build

**Step 3.** Check for updated version numbers in

* `package.json`
* `conda.recipe/meta.yaml`

### Release

**Step 4.** Tag the repo with:

    git tag -a release_tag -m "Release msg"
    git push origin release_tag

**Step 5.** Build sdist and wheels packages:

    python setup.py sdist
    python setup.py bdist_wheel

**Step 6.** Upload *sdist* and *wheels* to PyPI:

    twine upload dist/*

**Step 7.** Push changes to conda-forge:

The conda recipe to build the RISE pacckage is maintained in a separate github repo at https://github.com/conda-forge/rise-feedstock

* First read this section: https://github.com/conda-forge/rise-feedstock#updating-rise-feedstock
* You need to update the version number here: https://github.com/conda-forge/rise-feedstock/blob/master/recipe/meta.yaml#L1
* You need to update the sha number here: https://github.com/conda-forge/rise-feedstock/blob/master/recipe/meta.yaml#L9
* (Optional) You need to update any dependencies if you have new ones or remove old ones.
* (Optional) You may want to update the recipe, for instance, eventually, we will get rid of the post-link steps (see, https://github.com/damianavila/RISE/pull/444).
