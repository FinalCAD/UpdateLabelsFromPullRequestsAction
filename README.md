# UpdateLabelsFromPullRequestsAction

This action checks if associated pull requests contain certain labels. If any of these labels are found in any associated pull requests, the current pull request is labeled with the labels found.

## Inputs
### `current-pr-number`
[**Required**] Number of the current PullRequest that triggered the action

### `interesting-labels`
[**Required**] Labels to be sought in associated pull requests


### `repo-token`
[**Required**] Github token used to make API calls

## How to update ?
- Install `vercel/ncc` by running this command in your terminal. 
```
npm i -g @vercel/ncc
```
- Compile your index.js file. 
```
ncc build index.js --license licenses.txt
```

Official documentation can be found [here](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github)