"""Copy the landing page from its source (the experiments folder) into public/, wrapped as a full HTML document."""
import io, os, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = r"D:/OneDrive/Work/Projects/Personal_Projects/Agentic Ad Optimization/experiments/gtm-landing/01-agent-canvas/web"
PUB = os.path.join(ROOT, "public")
ICON = ('<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E'
        '%3Crect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%23c6ff4a%22/%3E%3Crect x=%229%22 y=%229%22 width=%2214%22 '
        'height=%2214%22 rx=%223%22 fill=%22%2307080b%22/%3E%3C/svg%3E">')

for f in ("data.js", "app.js"):
    shutil.copyfile(os.path.join(SRC, f), os.path.join(PUB, f))
s = io.open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
i = s.index("</style>") + len("</style>")
page = '<!doctype html>\n<html lang="en">\n<head>\n' + s[:i] + "\n" + ICON + "\n</head>\n<body>\n" + s[i:].strip() + "\n</body>\n</html>\n"
io.open(os.path.join(PUB, "index.html"), "w", encoding="utf-8").write(page)
print("landing page built into public/")
