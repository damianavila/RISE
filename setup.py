import os
from IPython.html.nbextensions import install_nbextension
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


def install(use_symlink=False, profile='default'):
    # Install the livereveal code.
    install_nbextension(livereveal_dir, symlink=use_symlink,
                        overwrite=use_symlink)

    # Enable the extension in the given profile.
    profile_dir = locate_profile(profile)
    custom_js = os.path.join(profile_dir, 'static',
                             'custom', 'custom.js')
    add_if_not_in_custom_js(custom_js, 'LIVE_REVEAL', custom_js_entry)


def add_if_not_in_custom_js(custom_js_fpath, ext_name, custom_js_content):
    start_line = '// {} START'.format(ext_name.upper())
    end_line = '// {} END'.format(ext_name.upper())
    
    with open(custom_js_fpath, 'r') as fh:
        lines = list(fh)
    
    should_add = True
    for line in lines:
        if line.strip() == start_line:
            should_add = False
            break
    
    if should_add:
        print('Writing the custom.js entry.')
        with open(custom_js_fpath, 'w') as fh:
            for line in lines:
                fh.write(line)
            fh.write('\n{}'.format(start_line))
            fh.write(custom_js_content)
            fh.write('\n{}'.format(end_line))
    else:
        print('custom.js entry already exists.')


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
    install_parser.add_argument('--profile', action='store', default='default',
                                help=("The name of the profile to use."))                                  
    
    args = parser.parse_args(sys.argv[1:])

    install(use_symlink=args.develop, profile=args.profile)


if __name__ == '__main__':
    main()
