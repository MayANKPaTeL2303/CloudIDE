const http = require("http");
const os = require("os");
const express = require("express");
const fs = require("fs").promises;
const fssync = require("fs");
const path = require("path");
const pty = require("node-pty");
const cors = require("cors");
const chokidar = require("chokidar");
const { Server } = require("socket.io");

// 🛠 Configurations
const PORT = 9000;
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
const baseDir = path.resolve(__dirname, "user"); // Ensure this folder exists

// 📦 Setup Express and HTTP Server
const app = express();
const server = http.createServer(app);

// 🔌 Setup WebSocket with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Restrict in production
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// 💻 Setup pseudo-terminal (PTY)
const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 100,
  rows: 60,
  cwd: baseDir,
  env: process.env,
});

// 🔄 Emit terminal output to client
ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

// 🔌 Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("📡 Client connected:", socket.id);

  // ✏️ File write from client
  socket.on("file:change", async ({ path: relativePath, content }) => {
    try {
      const safeRelPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, ''); // prevent path traversal
      const fullPath = path.join(baseDir, safeRelPath);


      // 🛡 Security: Path traversal prevention
      if (!fullPath.startsWith(baseDir)) {
        console.warn("❌ Unsafe write attempt:", fullPath);
        return;
      }

      // 🚫 Prevent writing to directories
      if (fssync.existsSync(fullPath)) {
      const stat = fssync.lstatSync(fullPath);
      if (stat.isDirectory()) {
        console.warn("❌ Attempted write to a directory:", fullPath);
        return;
      }
     } else {
      // make sure parent folder exists
      const dirName = path.dirname(fullPath);
      if (!fssync.existsSync(dirName)) {
          await fs.mkdir(dirName, { recursive: true });
      }
    }


      await fs.writeFile(fullPath, content);
      console.log(`✅ File written successfully: ${fullPath}`);
    } catch (err) {
      console.error("❌ Error writing file:", err.message);
    }
  });

  // 🧑‍💻 Terminal command input from client
  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
  });
});

// 👁 Watch for file changes
chokidar.watch(baseDir).on("all", (event, changedPath) => {
  io.emit("file:refresh", changedPath);
});

// 📁 API: File tree structure
app.get("/files", async (req, res) => {
  try {
    const tree = await generateFileTree(baseDir);
    res.json({ tree });
  } catch (err) {
    console.error("❌ Failed to build file tree:", err.message);
    res.status(500).json({ error: "Failed to generate file tree." });
  }
});

// 📄 API: Read file content
app.get("/files/content", async (req, res) => {
  try {
    const relativePath = req.query.path || "";
    const safeRelPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(baseDir, safeRelPath);

    if (!filePath.startsWith(baseDir)) {
      return res.status(403).json({ error: "Invalid path" });
    }

    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: "Path is a directory" });
    }

    const content = await fs.readFile(filePath, "utf-8");
    res.json({ content });
  } catch (err) {
    console.error("❌ File read error:", err.message);
    res.status(500).json({ error: "File could not be read." });
  }
});


// 🚀 Start the server
server.listen(PORT, () => {
  console.log(`🐋 Docker Server running on http://localhost:${PORT}`);
});

// 📂 Recursively generate a file tree
async function generateFileTree(dir) {
  const tree = {};

  async function traverse(currentDir, node) {
    const entries = await fs.readdir(currentDir);

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        node[entry] = {};
        await traverse(fullPath, node[entry]);
      } else {
        node[entry] = null;
      }
    }
  }

  await traverse(dir, tree);
  return tree;
}
