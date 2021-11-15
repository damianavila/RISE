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
from pathlib import Path

from setuptools import setup, find_packages

HERE = Path(__file__).parent.resolve()

name = "rise"

lab_path = (HERE / name.replace("-", "_") / "labextension")

# Representative files that should exist after a successful build
ensured_targets = [
    str(lab_path / "package.json"),
    str(lab_path / "static/style.js")
]

labext_name = "rise-jupyterlab"

INSTALL_REQUIRES = [
    "jupyter_server>=1.6,<2"
    "jupyterlab>=3,<4"
]

with open('README.md') as readme:
    README = readme.read()

# Enable the nbextension (like jupyter nbextension enable --sys-prefix)
DATA_FILES = [
    ("etc/jupyter/nbconfig/notebook.d", [
        "jupyter-config/nbconfig/notebook.d/rise.json"
    ]),
    ("share/jupyter/labextensions/%s" % labext_name, ["install.json"]),
]

# Install the nbextension (like jupyter nbextension install --sys-prefix).
# More precisely, everything in the rise/static directory and its
# subdirectories should be installed
nbext = ["share", "jupyter", "nbextensions", name]
for (path, dirs, files) in os.walk(os.path.join("rise", "nbextension")):
    # Files to install
    srcfiles = [os.path.join(path, f) for f in files]
    # Installation path components, removing rise/static from "path"
    dst = nbext + path.split(os.sep)[2:]
    DATA_FILES.append((os.path.join(*dst), srcfiles))

labext = ["share", "jupyter", "labextensions", labext_name]
for (path, dirs, files) in os.walk(os.path.join("rise", "labextension")):
    # Files to install
    srcfiles = [os.path.join(path, f) for f in files]
    # Installation path components, removing rise/static from "path"
    dst = labext + path.split(os.sep)[2:]
    DATA_FILES.append((os.path.join(*dst), srcfiles))

# version string is extracted from toplevel package.json
import json
with open('package.json') as package_json:
    content = package_json.read()
version = json.loads(content)['version']
# from npm server into python semver
if "-dev" in version:
    version = version.replace("-dev", ".dev")

setup_args = dict(
    name=name,
    version=version,
    packages=find_packages(),
    data_files=DATA_FILES,
    include_package_data=True,
    install_requires=INSTALL_REQUIRES,
    python_requires='>=3.6, <4',
    description="Reveal.js - Jupyter/IPython Slideshow Extension",
    long_description=README,
    long_description_content_type='text/markdown',
    author="Damian Avila",
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
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 3",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
    ],
    zip_safe=False,
)

# FIXME & add pyproject.toml
# try:
#     from jupyter_packaging import (
#         wrap_installers,
#         npm_builder,
#         get_data_files
#     )
#     post_develop = npm_builder(
#         build_cmd="install:extension", source_dir="src", build_dir=lab_path
#     )
#     setup_args["cmdclass"] = wrap_installers(post_develop=post_develop, ensured_targets=ensured_targets)
#     setup_args["data_files"] = get_data_files(data_files_spec)
# except ImportError as e:
#     import logging
#     logging.basicConfig(format="%(levelname)s: %(message)s")
#     logging.warning("Build tool `jupyter-packaging` is missing. Install it with pip or conda.")
#     if not ("--name" in sys.argv or "--version" in sys.argv):
#         raise e

if __name__ == '__main__':
    setup(**setup_args)
