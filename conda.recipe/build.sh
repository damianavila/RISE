"${PYTHON}" setup.py install
"${PREFIX}/bin/jupyter-nbextension" install rise --py --sys-prefix
