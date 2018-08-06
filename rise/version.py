# version string is extracted from toplevel package.json
from pkg_resources import resource_exists, resource_string, parse_version
import json

# locate 'package.json' that is packaged as part of MANIFEST.in
__version__ = '0.0.0'
if resource_exists('rise', 'package.json'):
    try:
        package_json = resource_string('rise', 'package.json')
        __version__ = json.loads(package_json)['version']
    except:
        print("Could not figure out RISE version - using {}"
          " (could not parse package.json)"
              .format(__version__))
else:
    print("Could not figure out RISE version - using {}"
          " (package.json not found)"
          .format(__version__))

# result is a <Version> object
# see https://setuptools.readthedocs.io/en/latest/pkg_resources.html#parsing-utilities
version_info = parse_version(__version__)
