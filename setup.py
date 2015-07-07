import os
from notebook.nbextensions import install_nbextension
from notebook.services.config import ConfigManager
from jupyter_core.paths import jupyter_config_dir as get_jupyter_config_dir

livereveal_dir = os.path.join(os.path.dirname(__file__), 'livereveal')
jupyter_config_dir = get_jupyter_config_dir()

def install(config_dir, use_symlink=False, enable=True):
    # Install the livereveal code.
    install_nbextension(livereveal_dir, symlink=use_symlink,
                        overwrite=use_symlink, user=True)

    if enable:
        cm = ConfigManager(config_dir=config_dir)
        cm.update('notebook', {"load_extensions": {"livereveal/main": True}})

def main():
    import argparse
    import sys

    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title='subcommands',
                                       description='valid subcommands',
                                       help='additional help')

    install_parser = subparsers.add_parser('install')
    install_parser.add_argument('--jupyter-config-dir', action='store', default=jupyter_config_dir,
                                help="The path of the Jupyter config dir to use.")  
    install_parser.add_argument('--develop', action='store_true',
                                help="Install livereveal  as a symlink to the source.")
    install_parser.add_argument('--no-enable', action='store_true',
                                help="Install but don't enable the extension.")                                
    
    args = parser.parse_args(sys.argv[1:])

    install(config_dir=args.jupyter_config_dir,
            use_symlink=args.develop,
            enable=(not args.no_enable))


if __name__ == '__main__':
    main()
