from ._version import version_info, __version__


def _jupyter_nbextension_paths():
    return [dict(section="notebook",
                 src="static",
                 dest="rise",
                 require="rise/main")]
