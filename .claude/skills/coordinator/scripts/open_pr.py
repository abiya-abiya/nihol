"""Open a pull request through the GitHub REST API.
Usage: GH_TOK=<token> GH_REPO=owner/name python open_pr.py <head-branch> <title> <body.md> [base]
The token comes from `git credential fill` in the shell that runs this; never print it."""
import json
import os
import sys
import urllib.error
import urllib.request

head, title, body_path = sys.argv[1], sys.argv[2], sys.argv[3]
body = open(body_path, encoding="utf-8").read()
req = urllib.request.Request(
    "https://api.github.com/repos/" + (os.environ.get("GH_REPO") or sys.exit("set GH_REPO=owner/name")) + "/pulls",
    data=json.dumps({"title": title, "head": head, "base": (sys.argv[4] if len(sys.argv) > 4 else "main"), "body": body}).encode("utf-8"),
    headers={
        "Authorization": "Bearer " + os.environ["GH_TOK"],
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
    },
    method="POST",
)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.load(resp)
        print(data["number"], data["html_url"], data["head"]["sha"])
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode("utf-8")[:500])
    sys.exit(1)
