const express = require("express");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataDir = path.join(root, "data");
const savePath = path.join(dataDir, "save.json");
const isPreview = process.argv.includes("--preview");
const port = Number(process.env.PORT || 5173);

fs.mkdirSync(dataDir, { recursive: true });

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/save", (_req, res) => {
  if (!fs.existsSync(savePath)) {
    res.json(null);
    return;
  }
  try {
    res.json(JSON.parse(fs.readFileSync(savePath, "utf8")));
  } catch {
    res.status(500).json({ error: "存档文件损坏，请选择新游戏。" });
  }
});

app.post("/api/save", (req, res) => {
  fs.writeFileSync(savePath, JSON.stringify(req.body, null, 2), "utf8");
  res.json({ ok: true });
});

app.delete("/api/save", (_req, res) => {
  if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
  res.json({ ok: true });
});

async function start() {
  if (isPreview) {
    app.use(express.static(path.join(root, "dist")));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(root, "dist", "index.html")));
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      root,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Emotion Card Quest running at http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
