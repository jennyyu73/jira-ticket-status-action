const core = require('@actions/core');
const getJiraIssueKey = require('./jira_issue_key');
const { jiraLabels, jiraStatus } = require('./fetch_issue');
const unsatisfiedRequirements = require('./missing_labels');

async function run() {
  // get the JIRA number from the commit message or the branch name
  const storyNum =
    getJiraIssueKey(core.getInput('commit_message')) ||
    getJiraIssueKey(core.getInput('branch_name'));
  if (storyNum == null) {
    console.log('No JIRA issue key found');
    return;
  }
  console.log('JIRA issue key:', storyNum);

  // check the JIRA board referenced falls within the required JIRA boards specified, if any
  const jiraBoards = core.getInput('jira_boards');
  console.log('jiraBoards:', jiraBoards);
  if (jiraBoards) {
    const storyBoard = storyNum.split('-')[0];
    if (!jiraBoards.split(',').includes(storyBoard)) {
      console.log(
        `Jira ticket referenced does not originate from an approved board: ${storyBoard}`
      );
      core.setFailed(
        `Jira ticket referenced does not originate from an approved board: ${storyBoard}`
      );
      return;
    }
  }

  // fetch the jira API for the story information and checks if able to merge PR
  if (
    core.getInput('status_or_labels') === 'status' ||
    core.getInput('status_or_labels') === 'both'
  ) {
    let statusDetails = await jiraStatus(
      storyNum,
      core.getInput('jira_user'),
      core.getInput('jira_token'),
      core.getInput('jira_url')
    );
    console.log('Retrieved JIRA issue status:', statusDetails);

    const mergeStatuses = core.getInput('merge_statuses').split(',');
    if (mergeStatuses && !mergeStatuses.includes(statusDetails.name)) {
      console.log(
        `Pull request should not be merged yet based on current ticket status: ${statusDetails.name}`
      );
      core.setFailed(
        `Pull request should not be merged yet based on current ticket status: ${statusDetails.name}`
      );
      return;
    }
  }

  if (
    core.getInput('status_or_labels') === 'labels' ||
    core.getInput('status_or_labels') === 'both'
  ) {
    let labels = await jiraLabels(
      storyNum,
      core.getInput('jira_user'),
      core.getInput('jira_token'),
      core.getInput('jira_url')
    );

    if (labels == null) {
      labels = core.getInput('default_labels').split('|');
    } else {
      core
        .getInput('default_labels')
        .split('|')
        .forEach((label) => {
          if (!labels.includes(label)) {
            labels.push(label);
          }
        });
    }

    //Parse out the labels on the story
    console.log(`Testing labels: ${labels.join(',')}`);
    const result = unsatisfiedRequirements(
      labels,
      core.getInput('required_suffix'),
      core.getInput('approved_suffix')
    );
    console.log(`unsatisfiedRequirements results: ${result.join(',')}`);
    if (result.length > 0) {
      core.setFailed(
        `Jira ticket indicates the following labels are still needed: ${result.join(
          ', '
        )}`
      );
    }
  }
}

module.exports = run;
