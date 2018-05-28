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

from rise._version import __version__ as version

NAME = "rise"

INSTALL_REQUIRES = [
    'notebook>=5.5.0',
]

with open('./README.md') as readme:
    README = readme.read()

DATA_FILES = [
    # like `jupyter nbextension install --sys-prefix`
    ("share/jupyter/nbextensions/rise", [
        "rise/static/main.js",
    ]),
    # like `jupyter nbextension enable --sys-prefix`
    ("etc/jupyter/nbconfig/notebook.d", [
        "jupyter-config/nbconfig/notebook.d/rise.json"
    ]),
]

setup_args = dict(
    name=NAME,
    version=version,
    packages=find_packages(),
    data_files=DATA_FILES,
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
    zip_safe=False,
)

if __name__ == '__main__':
    setup(**setup_args)
