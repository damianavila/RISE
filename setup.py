import os
from notebook.nbextensions import install_nbextension
from notebook.services.config import ConfigManager

livereveal_dir = os.path.join(os.path.dirname(__file__), 'livereveal')

def install(use_symlink=False, enable=True, user=False):
    # Install the livereveal code.
    install_nbextension(livereveal_dir, symlink=use_symlink,
                        overwrite=use_symlink, user=user)

    if enable:
        cm = ConfigManager()
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
                                help="Install livereveal  as a symlink to the source.")
    install_parser.add_argument('--user', action='store_true',
                                help="Install as user")
    install_parser.add_argument('--no-enable', action='store_true',
                                help="Install but don't enable the extension.")

    args = parser.parse_args(sys.argv[1:])

    install(use_symlink=args.develop,
            enable=(not args.no_enable), user=args.user)


if __name__ == '__main__':
    main()
