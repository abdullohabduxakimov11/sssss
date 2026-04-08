import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { Server } from "socket.io";
import { createServer } from "http";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not configured. Skipping email send.");
    return res.status(200).json({ success: true, message: "Email skipped (not configured)" });
  }

  try {
    await transporter.sendMail({
      from: `"Desknet Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// Socket.io for basic real-time signaling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  // Basic signaling for presence and typing (without DB persistence)
  socket.on("presence:update", (data) => {
    socket.broadcast.emit("presence:updated", { [data.uid]: { ...data, lastSeen: new Date().toISOString() } });
  });

  socket.on("typing:update", (data) => {
    socket.broadcast.emit("typing:updated", { [data.id]: data });
  });
  
  socket.on("data:changed", (collection) => {
    socket.broadcast.emit("data:refetch", collection);
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const startDevServer = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Use Vite middleware first for assets and HMR
    app.use(vite.middlewares);
    
    // API routes (if any)
    // Add your API routes here before the SPA fallback
    
    // SPA fallback - serve index.html for all other routes
    app.use("*", async (req, res) => {
      try {
        const html = await vite.transformIndexHtml(
          req.originalUrl,
          `<!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <link rel="icon" type="image/svg+xml" href="/vite.svg" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Desknet</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"><\/script>
            </body>
          </html>`
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        console.error("Error transforming HTML:", e);
        res.status(500).end("Error loading app");
      }
    });
    
    const PORT = 3000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  };
  startDevServer();
} else {
  // Local production test
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist/index.html"));
  });
  
  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
