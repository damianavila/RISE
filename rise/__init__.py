from ._version import __version__
from .app import RiseApp
from .serverextension import load_jupyter_server_extension

def _jupyter_nbextension_paths():
    return [
        dict(
            section="notebook",
            src="nbextension",
            dest="rise",
            require="rise/main"
        )
    ]


def _jupyter_server_extension_paths():
    return [
        {
            'module': 'rise'
        }
    ]


def _jupyter_server_extension_points():
    return [{"module": "rise", "app": RiseApp}]


def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': 'rise-jupyterlab'
    }]
