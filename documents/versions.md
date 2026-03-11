# How to change version and commit with a tag

1. Increment the version in environment.qa.ts (or environment.prod.ts)  version
2. Increment the version in plantour-server.csproj Version
3. Open the root project folder in terminal
4. git add .
5. git commit -m "Bump to version X.Y.Z"
6. git tag -a vX.Y.Z -m "Release to X.Y.Z"
7. git push origin HEAD --follow-tags

# How to see a list of tagged commits
git log --oneline --decorate --tags --no-walk

# How to clone a repo by the tag
git clone --branch <tag_name> --depth 1 <repository_url>