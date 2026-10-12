# Security policy

## Reporting a vulnerability

Please do not publish details of a suspected vulnerability in a public issue.

Open a private security advisory for this repository if GitHub private vulnerability reporting is enabled. Otherwise, contact the repository maintainer privately through their GitHub profile.

Include the affected area, steps to reproduce, and potential impact. Avoid sharing real user data, passwords, tokens, or production secrets.

## Deployment notes

This project is a developer starting point and should be reviewed before production use. In particular:

- Keep the .NET target and its dependencies on a supported release.
- Store credentials in user secrets or a managed secret store.
- Use HTTPS and secure production cookie settings.
- Review role assignments and authorization rules.
- Apply database migrations through a controlled deployment process.
