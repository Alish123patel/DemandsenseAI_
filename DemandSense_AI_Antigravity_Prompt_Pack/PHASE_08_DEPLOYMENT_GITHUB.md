# Phase 8 --- Deployment, GitHub & Portfolio Release

## Objective

Prepare a reproducible public release with a clean GitHub repository,
live frontend/backend deployment, documentation and portfolio-ready
evidence.

## Prompt for Antigravity

Read the master brief and inspect the tested application. Implement
**Phase 8 only**.

### GitHub preparation

1.  Review `.gitignore`.
2.  Search for secrets, API keys, local paths, private data, `.env`
    files, virtual environments, `node_modules`, raw datasets and large
    artifacts.
3.  Ensure no private or restricted data is committed.
4.  Add complete README sections:
    -   project overview;
    -   features;
    -   architecture;
    -   technology stack;
    -   screenshots;
    -   dataset source and acquisition steps;
    -   local setup;
    -   frontend/backend startup;
    -   model training and evaluation reproduction;
    -   API documentation;
    -   deployment;
    -   limitations and responsible-use notes.
5.  Add a license only after the user selects/approves one. Do not
    assume rights to redistribute the dataset.
6.  Add a concise contribution/development guide if useful.
7.  Prepare a release checklist and suggested commit sequence.

### Deployment preparation

Propose a deployment plan for frontend and backend (for example Vercel
and Render), but verify current provider requirements and free-tier
limits before relying on them.

1.  Create production build configuration.
2.  Use environment variables for API URLs and allowed CORS origins.
3.  Configure backend startup command and health checks.
4.  Ensure model artifacts are available to the backend through a
    documented, reliable method.
5.  Check artifact size and provider storage limits.
6.  Do not store uploaded user datasets permanently unless explicitly
    designed and disclosed.
7.  Do not expose credentials in frontend bundles or GitHub.
8.  Add deployment instructions and troubleshooting notes.

### Release quality

-   Test deployed frontend-to-backend communication.
-   Verify `/health` and model readiness.
-   Perform one valid upload and forecast using approved test data.
-   Verify errors are understandable.
-   Confirm the live app does not show development placeholder data as
    real results.
-   Add screenshots of actual working screens.
-   Record deployed URLs only after deployment succeeds.

### Constraints

-   Do not deploy without the user's approval of provider/account
    actions.
-   Do not claim a deployment is live until it has been verified.
-   Do not commit secrets or raw dataset files.
-   Do not upload dataset files to a public repository unless their
    license and redistribution rights explicitly allow it.
-   Never invent live URLs.

### Workflow

First return a deployment readiness audit: build status, tests, artifact
sizes, environment variables, hosting requirements, data/license
concerns and proposed provider configuration. Wait for approval before
making deployment-related changes or publishing.

### Verification

Report actual Git status, secret scan findings, build/test results,
deployment checks, and verified public URLs (if deployment has been
completed).

### Completion report

Provide GitHub repository setup/push commands, deployment instructions,
live URLs only if verified, README status, screenshots list, and
remaining limitations. Stop after Phase 8.
