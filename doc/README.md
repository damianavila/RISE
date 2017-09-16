You can build the docs with:

```
cd doc
make html
```

then, you need to commit the generated `_build` directory:

```
git add _build
git commit -m "Add built docs"
```

make a subtree and push it to gh-pages with:

```
cd ..
git subtree split --prefix doc/_build/html -b gh-pages
git push -f origin gh-pages:gh-pages
git branch -D gh-pages
```
