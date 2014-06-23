
step 0:
======

Go here http://archive.ipython.org/release/ and download latest ipython >= 1.0.0, install in system  python path or your customised python path.


By default some Python path comes with IPython 0.13.2 which will not support for live slideshow.
So please update Ipython >= 1.0.0 by download source from above link, extract it and cd into extracted directory.

$ sudo python setup.py build install 

Or 

$ your_python_path setup.py build install 


PS:
...

From Ipython 2.1.0 onwards, ipython profile location is changed from u'/home/user/.config/ipython' into u'/home/user/.ipython'
... 



Then do the following,
step 1:
======

$ ipython profile create live

step 2:
=======

$ git clone https://github.com/ipython-contrib/IPython-notebook-extensions.git ~/.ipython/profile_live/static/custom/


step 3:
=======

Download zip file https://github.com/damianavila/live_reveal Or https://github.com/arulalant/live_reveal/ and extract it or clone it.

$ cp live_reveal/*  ~/.ipython/profile_live/static/custom/


step 4:
======

Install MathJx inside our ipython [locally] 

Ref : http://ipython.org/ipython-doc/dev/install/install.html

$ python or your_python_path
>>> from IPython.external.mathjax import install_mathjax
>>> install_mathjax()

execute the above two lines inside python shell, which will create folder called 'nbextensions' inside ~/.ipython. 

step 5:
======

Go to notebooks directory and open terminal there, then

$ python notebook --profile=live --ip=*

or

$ python notebook --profile=live 

or

$ your_python_path notebook --profile=live 

Now you can see live presentation or live slideshow option button as shown in the below example

http://nbviewer.ipython.org/github/fperez/nb-slideshow-template/blob/master/install-support.ipynb

Arulalan.T
17.06.2014




