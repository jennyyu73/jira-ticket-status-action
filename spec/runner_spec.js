/* eslint-disable */
const mockJiraIssueKey = jest.fn(() => 'ABC-123');
jest.mock('../src/jira_issue_key', () => mockJiraIssueKey);

const mockFetchIssue = {
  jiraLabels: jest.fn().mockImplementation((story, user, token, url) => {
    return ['test-required', 'test_waiting'];
  }),

  jiraStatus: jest.fn().mockImplementation((story, user, token, url) => {
    return {
      self: 'https://your-domain.atlassian.net/rest/api/3/status/10000',
      description: 'The issue is currently being worked on.',
      iconUrl: 'https://your-domain.atlassian.net/images/icons/progress.gif',
      name: 'In Progress',
      id: '10000',
      statusCategory: {
        self: 'https://your-domain.atlassian.net/rest/api/3/statuscategory/1',
        id: 1,
        key: 'in-flight',
        colorName: 'yellow',
        name: 'In Progress'
      }
    };
  })
};
jest.mock('../src/fetch_issue', () => {
  return mockFetchIssue;
});

let mockCoreLabels = {
  getInput: jest.fn().mockImplementation((name) => {
    if (name == 'status_or_labels') {
      return 'labels';
    }
    if (name == 'jira_boards') {
      return '';
    }
    if (name == 'default_labels') {
      return 'design-required|product-required';
    }
    if (name == 'required_suffix') {
      return 'required';
    }
    if (name == 'approved_suffix') {
      return 'approved';
    } else {
      return name;
    }
  }),
  setFailed: jest.fn().mockImplementation((message) => {
    return message;
  })
};
jest.mock('@actions/core', () => {
  return mockCoreLabels;
});

const run = require('../src/runner');

describe('run with labels', () => {
  beforeEach(async () => {
    await run();
  });

  it('should call getJiraIssueKey with the message text', function () {
    expect(mockCoreLabels.getInput).toHaveBeenCalledWith('commit_message');
    expect(mockJiraIssueKey).toHaveBeenCalledWith('commit_message');
  });

  it('should call jiraLabels with the jira story and access parameters', function () {
    expect(mockFetchIssue.jiraLabels).toHaveBeenCalledWith(
      'ABC-123',
      'jira_user',
      'jira_token',
      'jira_url'
    );
  });

  it('should add the default labels and get the unsatisfied requirements', function () {
    expect(mockCoreLabels.setFailed).toHaveBeenCalledWith(
      'Jira ticket indicates the following labels are still needed: test-approved, design-approved, product-approved'
    );
  });
});
