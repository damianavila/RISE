
<b>Step 0:</b>


Go here http://archive.ipython.org/release/ and download latest ipython >= 1.0.0, install in system  python path or your customised python path.


By default some Python path comes with IPython 0.13.2 which will not support for live slideshow.
So please update Ipython >= 1.0.0 by download source from above link, extract it and cd into extracted directory.

<pre>
$ sudo python setup.py build install 
</pre>
Or 

$ your_python_path setup.py build install 


PS:

From Ipython 2.1.0 onwards, ipython profile location is changed from u'/home/user/.config/ipython' into u'/home/user/.ipython'
 



Then do the following 5 steps, 

<b>Step 1:</b>
<pre>
$ ipython profile create live
</pre>


<b>Step 2:</b>

Remove default custom.js & custom.css files.
<pre>
$ rm -rf ~/.ipython/profile_live/static/custom/*
</pre>

Download notebook slideshow extensions 
<pre>
$ git clone https://github.com/ipython-contrib/IPython-notebook-extensions.git ~/.ipython/profile_live/static/custom/
</pre>


<b>Step 3:</b>

Download zip file https://github.com/damianavila/live_reveal Or https://github.com/arulalant/live_reveal/ and extract it or clone it.

<pre>
$ cp live_reveal/*  ~/.ipython/profile_live/static/custom/
</pre>


<b>Step 4:</b>

Install MathJx inside our ipython [locally] 

Ref : http://ipython.org/ipython-doc/dev/install/install.html

$ python or your_python_path
<pre>
>>> from IPython.external.mathjax import install_mathjax
>>> install_mathjax() </pre>

execute the above two lines inside python shell, which will create folder called 'nbextensions' inside ~/.ipython. 

<b>Step 5:</b>

Go to notebooks directory and open terminal there, then

<pre>
$ python notebook --profile=live --ip=*
</pre>

or

<pre>
$ python notebook --profile=live 
</pre>

or

$ your_python_path notebook --profile=live 

Now you can see live presentation or live slideshow option button as shown in the below example

http://nbviewer.ipython.org/github/fperez/nb-slideshow-template/blob/master/install-support.ipynb

Arulalan.T

17.06.2014




