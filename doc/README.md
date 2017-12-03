You can build the docs with:

```
cd doc
make html
```

update the "build and deploy version living at line 63 in conf.py:

```
# Be sure to bump +1 the _n version every time you deploy the updated docs
# Build and deploy version: 5.1.0_1
```

then add and commit the changes:

```
git add conf.py
git commit -m "Bump build and deploy version"
```

finally, make a subtree and push it to gh-pages with:

```
cd ..
git subtree split --prefix doc/_build/html -b gh-pages
git push -f origin gh-pages:gh-pages
git branch -D gh-pages
```
