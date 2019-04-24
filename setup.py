#!/usr/bin/env python
# coding: utf-8

# Copyright (c) - Damian Avila

# pylint: disable = C0103

"""
Packaging
"""

# inspired from
# http://jupyter-notebook.readthedocs.io/en/stable/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Example---Server-extension-and-nbextension

import os
from setuptools import setup, find_packages

NAME = "rise"

INSTALL_REQUIRES = [
    'notebook>=5.5.0',
]

with open('README.md') as readme:
    README = readme.read()

# Enable the nbextension (like jupyter nbextension enable --sys-prefix)
DATA_FILES = [
    ("etc/jupyter/nbconfig/notebook.d", [
        "jupyter-config/nbconfig/notebook.d/rise.json"
    ]),
]

# Install the nbextension (like jupyter nbextension install --sys-prefix).
# More precisely, everything in the rise/static directory and its
# subdirectories should be installed
nbext = ["share", "jupyter", "nbextensions", NAME]
for (path, dirs, files) in os.walk(os.path.join("rise", "static")):
    # Files to install
    srcfiles = [os.path.join(path, f) for f in files]
    # Installation path components, removing rise/static from "path"
    dst = nbext + path.split(os.sep)[2:]
    DATA_FILES.append((os.path.join(*dst), srcfiles))

# version string is extracted from toplevel package.json
import json
with open('package.json') as package_json:
    content = package_json.read()
version = json.loads(content)['version']
# from npm server into python semver
if "-dev." in version:
    version = version.replace("-dev.", ".dev")

setup_args = dict(
    name=NAME,
    version=version,
    packages=find_packages(),
    data_files=DATA_FILES,
    include_package_data=True,
    install_requires=INSTALL_REQUIRES,
    python_requires='>=2.7, !=3.0.*, !=3.1.*, !=3.2.*, !=3.3.*, <4',
    description="Reveal.js - Jupyter/IPython Slideshow Extension",
    long_description=README,
    author="Damián Avila",
    author_email="damianavila82@yahoo.com.ar",
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
    zip_safe=False,
)

if __name__ == '__main__':
    setup(**setup_args)
