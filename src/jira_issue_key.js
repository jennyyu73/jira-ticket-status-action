function getJiraIssueKey(message) {
  const issueKey = message.match(/[A-Z]+-[0-9]+/);
  if (issueKey == null) {
    return null;
  }
  return issueKey[0];
}

module.exports = getJiraIssueKey;
