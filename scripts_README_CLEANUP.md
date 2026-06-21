# Helper script placeholder — not required but kept for reference
# This repository uses a GitHub Actions workflow (.github/workflows/cleanup.yml)
# to perform the destructive cleanup (force-push and branch deletions).
# To run the cleanup, go to Actions → Repo cleanup and sync → Run workflow.

# Local equivalent commands (run in a clone):
# 1) Backup
#    git clone --mirror https://github.com/JHNder4DW/ThePoint.git ThePoint-mirror
# 2) Create local branches from remote cleans
#    git fetch origin
#    git checkout origin/original-clean -b original-clean
#    git checkout origin/red-clean -b red-clean
# 3) Apply changes (already done by workflow)
# 4) Force push replacements (DESSTRUCTIVE)
#    git push origin original-clean:refs/heads/main --force
#    git push origin red-clean:refs/heads/red-theme --force
# 5) Delete unwanted branches
#    git push origin --delete RR original-backup revert-6-vercel/install-vercel-speed-insights-irv6jp vercel/install-vercel-speed-insights-irv6jp original-clean red-clean