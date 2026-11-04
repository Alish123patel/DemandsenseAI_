# DemandSense AI --- Antigravity Prompt Pack

This folder contains the project brief and one Markdown prompt for each
development phase. Upload the relevant `.md` file to Antigravity (or
open it in the workspace) and ask the agent to follow it.

## Recommended workflow

1.  Keep this prompt pack in the root of your `DemandSense-AI` project,
    or in a separate `project_docs/` folder.
2.  Start with `01_MASTER_PROJECT_BRIEF.md`.
3.  Complete phases in order. Do not ask Antigravity to implement all
    phases at once.
4.  For each phase, give Antigravity the matching `PHASE_XX_...md` file
    and ask it to:
    -   read the full file;
    -   inspect the current repository;
    -   report its plan and files it intends to change;
    -   wait for approval before making substantial changes;
    -   implement only that phase;
    -   run the checks listed in the file;
    -   report test results and unresolved issues.
5.  If you want changes, use `CHANGE_REQUEST_TEMPLATE.md` and describe
    the change in Antigravity chat.
6.  Commit to Git after a phase passes its acceptance checklist.

## Important

-   These documents are specifications, not proof that the application
    works. Verify commands and tests on your machine.
-   Do not let the agent fabricate model scores, predictions, datasets,
    business metrics, or test results.
-   Do not commit secrets, `.env` files, virtual environments,
    `node_modules`, raw datasets, or large generated artifacts.
-   The dataset schema and modeling approach must be checked against the
    actual downloaded data before implementation.
-   Deployment provider free tiers and limits can change. Verify current
    terms before choosing a provider.
