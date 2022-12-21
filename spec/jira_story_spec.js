describe('getJiraIssueKey', () => {
  const getJiraIssueKey = require('../src/jira_issue_key');

  it('should find UGC story number', () => {
    const result = getJiraIssueKey(
      'something testing ABC-123 testing something'
    );
    expect(result).toEqual('ABC-123');
  });

  it('should find UGC story number in multiline strings.', () => {
    const result = getJiraIssueKey(
      'something testing \nABC-123\n testing something'
    );
    expect(result).toEqual('ABC-123');
  });

  it('should return null if no story number present', () => {
    const result = getJiraIssueKey(
      'something testing NOJIRA testing something'
    );
    expect(result).toEqual(null);
  });

  it('should find UGC story number in dashed string.', () => {
    const result = getJiraIssueKey('branch-name-ABC-123-branch-name');
    expect(result).toEqual('ABC-123');
  });
});
