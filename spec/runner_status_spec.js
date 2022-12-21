/* eslint-disable */
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

const mockCoreLabels = {
  getInput: jest.fn().mockImplementation((name) => {
    if (name == 'status_or_labels') {
      return 'status';
    }
    if (name == 'jira_boards') {
      return 'PLAT,ABC';
    }
    if (name == 'branch_name') {
      return 'ABC-123-Branch-status-test';
    }
    if (name == 'merge_statuses') {
      return 'Completed,Done';
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

describe('run', () => {
  beforeEach(async () => {
    await run();
  });

  it('should call getJiraIssueKey with the message text', function () {
    expect(mockCoreLabels.getInput).toHaveBeenCalledWith('merge_statuses');
  });

  it('should call jiraLabels with the jira story and access parameters', function () {
    expect(mockFetchIssue.jiraStatus).toHaveBeenCalledWith(
      'ABC-123',
      'jira_user',
      'jira_token',
      'jira_url'
    );
  });

  it('should add the default labels and get the unsatisfied requirements', function () {
    expect(mockCoreLabels.setFailed).toHaveBeenCalledWith(
      `Pull request should not be merged yet based on current ticket status: In Progress`
    );
  });
});
