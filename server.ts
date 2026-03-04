import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Servire esplicitamente i file statici dalla cartella public PRIMA del fallback SPA
  const publicPath = path.join(__dirname, "public");
  
  // Rotte esplicite per i file SEO con Content-Type forzato e permessi ampi
  app.get("/sitemap.xml", (req, res) => {
    res.header("Content-Type", "application/xml");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("X-Content-Type-Options", "nosniff");
    res.sendFile(path.join(publicPath, "sitemap.xml"));
  });

  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.header("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "robots.txt"));
  });

  // 2. Servire altri file statici (immagini, icone, etc.)
  app.use(express.static(publicPath));

  // 3. Vite middleware per lo sviluppo
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In produzione, servire i file buildati (dist)
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZoneRun Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();