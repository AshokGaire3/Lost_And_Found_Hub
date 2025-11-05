# Git Quick Reference

A short collection of common Git commands for everyday use.

## Configure (one-time)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Start / clone

```bash
git init                     # initialize a repo
git clone <repo-url>         # clone remote repo
```

## Basic workflow

```bash
git status                   # what changed
git add <file|.>             # stage changes
git commit -m "message"     # commit staged changes
git push origin main         # push to remote (branch may vary)
```

## Branching

```bash
git checkout -b feature/foo  # create + switch to branch
git checkout main            # switch to branch
git merge feature/foo        # merge branch into current
git branch -d feature/foo    # delete local branch
```

## Remote

```bash
git remote -v                # list remotes
git fetch origin             # fetch updates from remote
git pull --rebase origin main# pull (rebase preferred)
```

## Inspect history

```bash
git log --oneline --graph --decorate --all
git show <commit>
```

## Undo / Amend

```bash
git restore <file>           # discard changes in working tree (git 2.23+)
git restore --staged <file>  # unstage file
git commit --amend -m "msg" # amend last commit
git revert <commit>          # safely revert a commit (creates new commit)
```

## Stash

```bash
git stash                    # save working state
git stash pop                # apply latest stash
git stash list               # list stashes
```

## Tips

- Use small, focused commits with clear messages.
- Use branches for features and PR workflow for reviews.
- When unsure, run `git status` and `git log` to see current state.

---

(For extended workflows, add aliases or hooks as needed.)
