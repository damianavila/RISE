#!/usr/bin/env python
# coding: utf-8

# pylint: disable = C0103

"""
Packaging
"""

# Copyright (c) - Damian Avila

import os
from setuptools import setup, find_packages

from rise._version import __version__ as version

NAME = "rise"

# Minimal Python version sanity check

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

INSTALL_REQUIRES = [
    'notebook>=5.5',
]

with open('./README.md') as readme:
    README = readme.read()

setup_args = dict(
    name=NAME,
    version=version,
    packages=find_packages(),
    package_data={NAME: paths},
    data_files=data_files,
    include_package_data=True,
    install_requires=INSTALL_REQUIRES,
    python_requires='>=2.7,>=3.4',
    description="Reveal.js - Jupyter/IPython Slideshow Extension",
    long_description=README,
    author="Damián Avila",
    author_email="info@oquanta.info",
    project_urls={
        'source': "http://github.com/damianavila/RISE",
        'documentation': "http://rise.readthedocs.io",
        'gitter': "https://gitter.im/damianavila/RISE",
    },
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
