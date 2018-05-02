#!/usr/bin/env python
# coding: utf-8

# pylint: disable = C0103

"""
Packaging
"""

# Copyright (c) - Damian Avila

from __future__ import print_function

import sys
import os
from setuptools import setup, find_packages

from rise._version import __version__ as version

NAME = "rise"

# Minimal Python version sanity check

PYVER = sys.version_info
if PYVER[:2] < (2, 7) or (PYVER[0] >= 3 and PYVER[:2] < (3, 4)):
    error = "ERROR: %s requires Python version 2.7 or 3.4 or above." % NAME
    print(error, file=sys.stderr)
    sys.exit(1)

# Main

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))
pkg_root = pjoin(here, NAME)
data_files = []

paths = []
for (path, directories, filenames) in os.walk(pjoin(pkg_root, "static")):
    target_dir = os.path.normpath(
        os.path.join('share/jupyter/nbextensions/rise',
                     os.path.relpath(pjoin(path), pjoin(pkg_root, 'static'))))
    files = []
    for filename in filenames:
        paths.append(os.path.relpath(pjoin(path, filename), pkg_root))
        files.append(os.path.relpath(pjoin(path, filename), here))
    # nbconfigurator is configured to use this
    if target_dir == 'share/jupyter/nbextensions/rise':
        files.append('README.md')
    data_files.append((target_dir, files))

data_files.append(('etc/jupyter/nbconfig/notebook.d', ['rise.json']))

data_files

INSTALL_REQUIRES = [
    'notebook>=5.5',
]

with open('./README.md') as readme:
    README = readme.read()

for d in data_files:
    print(d)

setup_args = dict(
    name=NAME,
    version=version,
    packages=find_packages(),
    package_data={NAME: paths},
    data_files=data_files,
    include_package_data=True,
    install_requires=INSTALL_REQUIRES,
    description="Reveal.js - Jupyter/IPython Slideshow Extension",
    long_description=README,
    author="Damián Avila",
    author_email="info@oquanta.info",
    url="http://github.com/damianavila/RISE",
    license="BSD-3-Clause",
    platforms="Linux, Mac OS X, Windows",
    keywords=["jupyter", "ipython", "presentation", "slides", "revealjs"],
    classifiers=[
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
    ],
)

if __name__ == '__main__':
    setup(**setup_args)
