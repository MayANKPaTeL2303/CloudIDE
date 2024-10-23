const http = require("http");
const os = require("os");
const express = require("express");
const fs = require("fs").promises;
const { Server: SocketServer } = require("socket.io");
const path = require("path");
const pty = require("node-pty");
const cors = require("cors");
const chokidar = require("chokidar");

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

//Creating a psuedo terminal
const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 100,
  rows: 60,
  cwd: process.env.INIT_CMD || process.cwd() + "/user",
  env: process.env,
});

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*", // Allow all origins (consider restricting in production)
    methods: ["GET", "POST"],
  },
});

app.use(cors());

chokidar.watch("./user").on("all", (event, path) => {
  io.emit("file:refresh", path);
});

// Terminal data event - sending output to clients: The PTY process listens for data (output from the terminal).
// Whenever new data is received from the terminal (like command output), it's emitted via the socket.io WebSocket to all connected clients.
ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

//Socket IO connection handling:
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("file:change",async({path,content})=>{
    await fs.writeFile(`./user${path}`,content)
  })

  // Receiving command from the client: When a client sends data (via the event terminal:write), it’s written directly into the PTY process, simulating typing in a terminal.
  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
  });

  // File Tree API Endpoint
  app.get("/files", async (req, res) => {
    const fileTree = await generateFiletree("./user");
    return res.json({ tree: fileTree });
  });
});

app.get("/files/content",async(req,res)=>{
    const path = req.query.path;
    const content = await fs.readFile(`./user/${path}`,'utf-8')
    return res.json({content})
})

// Start the server
server.listen(9000, () => console.log(`🐋 Docker Server running on port 9000`));

// generateFiletree is an async function that build a recursive file tree of a directory.
async function generateFiletree(directory) {
  const tree = {};

  async function buildTree(currDir, currentTree) {
    const files = await fs.readdir(currDir); // Get all the files in the current directory

    for (const file of files) {
      const filePath = path.join(currDir, file);
      const stat = await fs.stat(filePath); // CHECK WHETHER IT IS FILE OR DIRECTORY

      if (stat.isDirectory()) {
        currentTree[file] = {}; // Create an object for directories
        await buildTree(filePath, currentTree[file]); // Recursively process the directory
      } else {
        currentTree[file] = null; // Set the value to null for files
      }
    }
  }
  await buildTree(directory, tree);
  return tree;
}
