#!/usr/bin/env python
# coding: utf-8

# Copyright (c) - Damian Avila

from __future__ import print_function

name = "rise"

# Minimal Python version sanity check

import sys

v = sys.version_info
if v[:2] < (2, 7) or (v[0] >= 3 and v[:2] < (3, 4)):
    error = "ERROR: %s requires Python version 2.7 or 3.4 or above." % name
    print(error, file=sys.stderr)
    sys.exit(1)

# Main

import os
from distutils.core import setup

pjoin = os.path.join
here = os.path.abspath(os.path.dirname(__file__))
pkg_root = pjoin(here, name)

packages = []
for d, _, _ in os.walk(pkg_root):
    if os.path.exists(pjoin(d, "__init__.py")):
        packages.append(d[len(here)+1:].replace(os.path.sep, "."))

paths = []
for (path, directories, filenames) in os.walk(pjoin(pkg_root, "static")):
    for filename in filenames:
        paths.append(os.path.relpath(pjoin(path, filename), pkg_root))

version_ns = {}
with open(pjoin(here, name, '_version.py')) as f:
    exec(f.read(), {}, version_ns)

with open('./README.md') as readme:
    README = readme.read()

setup_args = dict(
    name=name,
    version=version_ns['__version__'],
    packages=packages,
    package_data={name: paths},
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
    ],
)

if 'develop' in sys.argv or any(bdist in sys.argv for bdist in ['bdist_wheel', 'bdist_egg']):
    import setuptools

setuptools_args = {}

install_requires = setuptools_args['install_requires'] = [
    'notebook>=5.0.0',
]

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
