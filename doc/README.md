You can build the docs with:

```
cd doc/
make html
```

then modify .gitignore and add the `_build` folder *temporarily*
so you can deploy the new docs:

```
cd ..
sed -i "" '/doc\/_build\//d' ./.gitignore
git add .gitignore
git add doc/_build/
git commit -m "Edit .gitignore and add new docs to deploy them"
```

make a subtree and push it to gh-pages with:

```
git subtree split --prefix doc/_build/html -b gh-pages
git push -f origin gh-pages:gh-pages
git branch -D gh-pages
```

finally, reset the last commit and checkout .gitignore:

```
git reset HEAD~
git checkout -- .gitignore
```
