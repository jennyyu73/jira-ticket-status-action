const JiraApi = require('jira-client');

async function jiraLabels(story, user, token, url) {
  const issue = await jiraIssue(story, user, token, url);
  return issue.fields.labels;
}

async function jiraStatus(story, user, token, url) {
  const issue = await jiraIssue(story, user, token, url);
  return issue.fields.status;
}

function jiraIssue(story, user, token, url) {
  const jira = new JiraApi({
    protocol: 'https',
    host: url,
    username: user,
    password: token,
    apiVersion: '2',
    strictSSL: true
  });

  return jira
    .findIssue(story)
    .then((issue) => issue)
    .catch((err) => {
      console.error(err);
    });
}

module.exports = { jiraLabels, jiraStatus };
