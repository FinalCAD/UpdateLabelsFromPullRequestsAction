const core = require('@actions/core');
const github = require('@actions/github');

const githubToken = process.env.GITHUB_TOKEN;
const ghClient = new github.getOctokit(githubToken);

async function getCurrentPullRequestId(owner, repo, pull_number) {
  let result = await ghClient.graphql(`{
      repository(owner: "${owner}", name: "${repo}") {
        pullRequest(number: ${pull_number}) {
          id
        }
      }
    }`, {});

  return result.repository.pullRequest.id;
}

async function getAssociatedPullRequests(owner, repo, pull_number) {
  let edges = await ghClient.graphql(`{
        repository(owner: "${owner}", name: "${repo}") {
          pullRequest(number: ${pull_number}) {
            commits(first: 100) {
              edges {
                node {
                  commit {
                    associatedPullRequests(first: 100) {
                      edges {
                        node {
                          number
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`, {});

  pullRequestNumbers = [];
  edges.repository.pullRequest.commits.edges.forEach(element => {
    element.node.commit.associatedPullRequests.edges.forEach(element2 => {
      pullRequestNumbers.push(element2.node.number);
    });
  });
  return pullRequestNumbers;
}

async function getRelevantLabels(owner, repo, pull_number, labelsSought) {
  let edges = await ghClient.graphql(`{
        repository(owner: "${owner}", name: "${repo}") {
          pullRequest(number: ${pull_number}) {
            labels(first: 10) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }`, {});

  let labels = edges.repository.pullRequest.labels.edges.map(e => {
    return e.node;
  });

  labelIds = [];
  for (const label of labels) {
    var name = label.name;
    if (labelsSought.some(l => name.toUpperCase() == l.toUpperCase())) {
      labelIds.push(label.id);
    }
  }
  return labelIds;
}

async function addLabelsToPullRequest(currentPullRequestId, labelIds) {
  await ghClient.graphql(`
  mutation AddLabel {
    addLabelsToLabelable(
      input: {labelableId: "${currentPullRequestId}", labelIds: ${JSON.stringify(labelIds)}}
    ) {
      clientMutationId
    }
  }`, {});
}

async function run() {
  const context = await github.context;
  let owner = context.payload.repository.full_name.split('/')[0];
  let repo = context.payload.repository.full_name.split('/')[1];
  let currentPullRequestNumber = core.getInput('initial-pr-number');
  let labelsToFind = core.getInput('interesting-labels').split(',');
  console.info("Labels wanted : " + labelsToFind.join(','));

  let currentPullRequestId = await getCurrentPullRequestId(owner, repo, currentPullRequestNumber);
  console.info("Currently working to label current PR : " + currentPullRequestNumber + " - "  + currentPullRequestId)

  let associatedItems = await getAssociatedPullRequests(owner, repo, currentPullRequestNumber);
  console.info("Associated pull requests found : " + associatedItems.join(','));

  finalLabelIds = [];
  for (let item of associatedItems) {
    let labels = await getRelevantLabels(owner, repo, item, labelsToFind);
    finalLabelIds = finalLabelIds.concat(labels);
  }
  let uniqueLabelIds = [...new Set(finalLabelIds)];

  await addLabelsToPullRequest(currentPullRequestId, uniqueLabelIds);
}

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}