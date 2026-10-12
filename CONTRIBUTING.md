# Contributing

Thanks for taking the time to improve Leadwise CRM.

## Before you start

- Check the existing issues before starting a large change.
- For a significant feature, open an issue first so the approach can be discussed.
- Keep pull requests focused on one problem or improvement.

## Local setup

Follow the setup steps in [README.md](README.md). Use a local database and keep credentials out of tracked files.

## Code and UI changes

- Follow the existing C# and Razor conventions.
- Prefer clear names and small methods over comments that repeat the code.
- Add comments when they explain a decision or non-obvious behavior.
- Keep pages usable on mobile, tablet, and desktop.
- Preserve keyboard access, visible focus, and useful form labels.
- Avoid adding dependencies unless they solve a clear problem.

## Before opening a pull request

1. Run `dotnet restore`.
2. Run `dotnet build --no-restore`.
3. Test the changed flows locally, including validation and authorization where relevant.
4. Describe the change, how it was tested, and any follow-up work.

Please be respectful and constructive in reviews and discussions.
