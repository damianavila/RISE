import os
from IPython.html.nbextensions import install_nbextension
from IPython.html.services.config import ConfigManager
from IPython.utils.path import locate_profile


livereveal_dir = os.path.join(os.path.dirname(__file__), 'livereveal')


custom_js_entry = """

// to prevent timeout
requirejs.config({
    waitSeconds: 60
});

$([IPython.events]).on('app_initialized.NotebookApp', function(){

     require(['nbextensions/livereveal/main'],function(livereveal){
       // livereveal.parameters('theme', 'transition', 'fontsize', static_prefix);
       //   * theme can be: simple, sky, beige, serif, solarized
       //   (you will need aditional css for default, night, moon themes).
       //   * transition can be: linear, zoom, fade, none
       livereveal.parameters('simple', 'zoom');
       console.log('Live reveal extension loaded correctly');
     });

});
"""


def install(use_symlink=False, profile='default', enable=True):
    # Install the livereveal code.
    install_nbextension(livereveal_dir, symlink=use_symlink,
                        overwrite=use_symlink, user=True)

    if enable:
        # Enable the extension in the given profile.
        profile_dir = locate_profile(profile)
        cm = ConfigManager(profile_dir=profile_dir)
        cm.update('notebook', {"load_extensions": {"livereveal/main": True}})


def main():
    import argparse
    import sys

    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title='subcommands',
                                       description='valid subcommands',
                                       help='additional help')

    install_parser = subparsers.add_parser('install')
    install_parser.add_argument('--develop', action='store_true',
                                help=("Install livereveal  as a "
                                      "symlink to the source."))
    install_parser.add_argument('--no-enable', action='store_true',
                                help="Install but don't enable the extension.")
    install_parser.add_argument('--profile', action='store', default='default',
                                help=("The name of the profile to use."))                                  
    
    args = parser.parse_args(sys.argv[1:])

    install(use_symlink=args.develop, profile=args.profile,
            enable=(not args.no_enable))


if __name__ == '__main__':
    main()
