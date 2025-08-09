# Cloud IDE

A web-based Integrated Development Environment (IDE) that enables users to write, edit, and manage code directly from their browser. This full-stack project provides a seamless experience for coding, compiling, and collaborating from anywhere.

---

## Features

- Modern, responsive UI for code editing
- Syntax highlighting and code formatting
- Real-time collaboration (via Socket.IO)
- File management: create, edit, delete, and organize files
- Project organization
- Live preview (if supported)
- Easy setup and development workflow

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express, Socket.IO

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/MayANKPaTeL2303/CloudIDE.git
    cd CloudIDE
    ```

2. Install frontend dependencies:
    ```bash
    cd client
    npm install
    # or
    yarn install
    ```

3. Install backend dependencies:
    ```bash
    cd ../server
    npm install
    # or
    yarn install
    ```

4. Start the backend server:
    ```bash
    npm start
    ```

5. In a new terminal, start the frontend development server:
    ```bash
    cd ../client
    npm run dev
    # or
    yarn dev
    ```

6. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Project Structure

```
CloudIDE/
├── client/           # Frontend (React + Vite)
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── ...
├── server/           # Backend (Node.js + Express + Socket.IO)
│   ├── index.js
│   ├── package.json
│   └── ...
├── work.txt
├── README.md
└── ...
```


## Author

- [MayANKPaTeL2303](https://github.com/MayANKPaTeL2303)


---

A cloud-based integrated development environment (IDE) designed for developers to code, compile, and collaborate seamlessly from anywhere. This project provides an accessible, feature-rich environment that mimics the functionality of traditional IDEs with the convenience of the cloud.


- **Real-time Code Collaboration**: Collaborate on code with team members in real time.
- **Multi-language Support**: Write and run code in multiple programming languages.
- **File System Integration**: Full file system navigation and manipulation within the IDE.
- **Code Compilation & Execution**: Compile and execute code directly within the platform.
- **User Authentication**: Secure login and registration to protect user projects and settings.
- **Project Management**: Organize projects into workspaces with customizable settings.
- **Integrated Terminal**: Use a fully functional terminal for command-line operations.
- **Syntax Highlighting & Autocomplete**: Improve code readability and development speed.
- **Theming Options**: Choose from multiple themes to personalize the workspace.

---

## Technologies Used

- **Node.js**: Backend framework to manage server-side operations.
- **Express.js**: Web framework for building a robust REST API.
- **Socket.io**: Real-time, bidirectional event-based communication for collaboration.
- **MongoDB**: Database for storing user data, project configurations, and file structures.
- **Docker**: Containerization for isolated environments across languages and dependencies.
- **Frontend Libraries**: HTML, CSS, JavaScript, and popular libraries for a responsive, user-friendly interface.

---

## Getting Started

### Prerequisites

To run this project, you’ll need:
- **Node.js** and **npm** installed on your machine
- **Docker** (optional) for isolated environments