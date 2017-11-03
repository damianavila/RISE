Releases
--------
Instructions and notes for preparing and performing a release.

Pre-Release check
=================

1. Clean your local repo copy::

    git clean -fdx

2. Build the JS and CSS::

    npm install
    npm run build-reveal
    npm run reset-reveal
    npm run build-css

3. Check for updated version numbers at ``rise/_version.py`` and
   ``conda.recipe/meta.yaml``

Release
=======

4. Tag the repo with::

    git tag -a release_tag -m "Release msg"
    git push origin release_tag

5. Build sdist and wheels packages::

    python setup.py sdist
    python setup.py bdist_wheel

6. Build the conda packages

For linux and osx packages::

    RISE_RELEASE=1 conda build conda.recipe --python=3.6
    RISE_RELEASE=1 conda build conda.recipe --python=3.5
    RISE_RELEASE=1 conda build conda.recipe --python=2.7

and::

    conda convert /path/to/conda-bld/linux-64/rise-<version_number>-py36_0.tar.bz2 -p linux-32 -p linux-64 -p osx-64 -o conda_dist
    conda convert /path/to/conda-bld/linux-64/rise-<version_number>-py35_0.tar.bz2 -p linux-32 -p linux-64 -p osx-64 -o conda_dist
    conda convert /path/to/conda-bld/linux-64/rise-<version_number>-py27_0.tar.bz2 -p linux-32 -p linux-64 -p osx-64 -o conda_dist


For Win packages you need to build in a Win VM (shared folders will make
you things easier)::

    set RISE_RELEASE=1
    conda build conda.recipe --python=3.6
    conda build conda.recipe --python=3.5
    conda build conda.recipe --python=2.7

If the build hangs, there is probably a permission error, try to run
again with ``--croot %TEMP%``

then, convert them in the same Win VM::

    conda convert C:\path\to\conda-bld\win-64\rise-<version_number>-py36_0.tar.bz2 -p win-64 -p win-32 -o conda_dist
    conda convert C:\path\to\conda-bld\win-64\rise-<version_number>-py35_0.tar.bz2 -p win-64 -p win-32 -o conda_dist
    conda convert C:\path\to\conda-bld\win-64\rise-<version_number>-py27_0.tar.bz2 -p win-64 -p win-32 -o conda_dist

.. note::
   You can increment the build number with the ``RISE_BUILD_NUMBER``
   environment variable.

7. Upload sdist and wheels to PyPI::

    twine upload dist/*

8. Upload conda packages to anaconda.org/damianavila82
   (5 platforms x 3 pythons)::

    anaconda upload -u damianavila82 conda_dist/linux-32/*
    anaconda upload -u damianavila82 conda_dist/linux-64/*
    anaconda upload -u damianavila82 conda_dist/osx-64/*
    anaconda upload -u damianavila82 conda_dist/win-32/*
    anaconda upload -u damianavila82 conda_dist/win-64/*
