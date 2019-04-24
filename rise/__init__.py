import pkg_resources

__version__ = pkg_resources.require("rise")[0].version
version_info = pkg_resources.parse_version(__version__)

def _jupyter_nbextension_paths():
    return [dict(section="notebook",
                 src="static",
                 dest="rise",
                 require="rise/main")]
