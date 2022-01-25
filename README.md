# UpdateLabelsFromPullRequestsAction

This action checks if associated pull requests contain certain labels. If any of these labels are found in any associated pull requests, the current pull request is labeled with the labels found.

## Inputs
### `current-pr-number`
[**Required**] Number of the current PullRequest that triggered the action

### `interesting-labels`
[**Required**] Labels to be sought in associated pull requests