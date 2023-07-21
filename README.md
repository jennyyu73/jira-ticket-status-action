GitHub Action to check JIRA story for labels matching a required/approved convention.

The primary use case for this is to prevent someone from merging a PR without external approval, namely if a Jira ticket is not in an approved status.
Jira status for a ticket is retrieved to determine if a PR should be mergeable or not, and so the specific ticket should be referenced either in the commit message or in the name of the branch, in the format `BOARD-123`. The list of "approved" statuses should be in a comma-separated string like in the example below. 

#Inputs
Please check the `action.yml` for a full list of required and optional inputs.

#Sample Action

```yaml
name: Jira Status Merge
on:
  pull_request:

jobs:
  job:
    name: Ticket Labels
    runs-on: ubuntu-latest
    steps:
      - name: Required JIRA Approvals
        uses: jennyyu73/jira-ticket-status-action@main
        with:
          commit_message: ${{ github.event.commits[0]['message'] }}
          branch_name: ${{ github.head_ref || github.ref_name }} 
          jira_user: github_jira_auth@subtlemedical.com
          jira_token: ${{ secrets.gh_jira_auth }}
          jira_url: MYORG.atlassian.net
          jira_boards: MYBOARD
          status_or_labels: status
          merge_statuses: "Done,Waiting for Release,Released,Resolved"
```
Make sure to configure your Github secrets to include your Jira access token.

# Running Tests

```bash
npm install
npm test
```

# Ready for release

1. Install `vercel/ncc` by running this command in your terminal. `npm i -g @vercel/ncc`

2. Compile your index.js file. `ncc build index.js --license licenses.txt`
