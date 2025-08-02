import './Tree.css';
import { useState, useEffect, useRef } from 'react';

const FileTreeNodes = ({
  filename,
  nodes,
  onSelect,
  path,
  selectedPath,
  onContextMenu,
  expandedPaths
}) => {
  const isDir = !!nodes;
  const [isOpen, setIsOpen] = useState(expandedPaths.has(path));

  useEffect(() => {
    // Auto-expand if this is in the expanded paths
    setIsOpen(expandedPaths.has(path));
  }, [expandedPaths, path]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isDir) {
      setIsOpen(!isOpen);
    } else {
      onSelect(path);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, path, isDir);
  };

  return (
    <li onClick={handleClick} onContextMenu={handleContextMenu}>
      <span
        className={`tree-node ${isDir ? 'isfolder' : 'isfile'} ${
          path === selectedPath ? 'selected' : ''
        }`}
      >
        {isDir ? (isOpen ? '📂 ' : '📁 ') : '📄 '}
        {filename}
      </span>
      {isDir && isOpen && filename !== 'node_modules' && (
        <ul>
          {Object.keys(nodes).map((child) => (
            <FileTreeNodes
              key={child}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              path={path ? path + '/' + child : child}
              filename={child}
              nodes={nodes[child]}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Tree = ({ tree, onSelect }) => {
  const [selectedPath, setSelectedPath] = useState('');
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, path: '', isDir: false });
  const contextRef = useRef();

  const handleSelect = (path) => {
    setSelectedPath(path);

    // Auto-expand all parent folders
    const parts = path.split('/');
    const expanded = new Set();
    for (let i = 0; i < parts.length; i++) {
      const sub = parts.slice(0, i).join('/');
      expanded.add(sub);
    }
    setExpandedPaths(expanded);

    onSelect(path);
  };

  const handleContextMenu = (e, path, isDir) => {
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, path, isDir });
  };

  const handleClickOutside = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  const handleRename = () => {
    const newName = prompt('Enter new name:', contextMenu.path.split('/').pop());
    if (newName) {
      // TODO: emit rename event (via socket or API)
      console.log(`Renaming ${contextMenu.path} to ${newName}`);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(`Delete ${contextMenu.path}?`);
    if (confirmDelete) {
      // TODO: emit delete event (via socket or API)
      console.log(`Deleting ${contextMenu.path}`);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div className="file-tree">
      <ul>
        <FileTreeNodes
          filename="/"
          nodes={tree}
          path=""
          onSelect={handleSelect}
          selectedPath={selectedPath}
          onContextMenu={handleContextMenu}
          expandedPaths={expandedPaths}
        />
      </ul>

      {/* Right Click Menu */}
      {contextMenu.visible && (
        <div
          ref={contextRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div onClick={handleRename}>✏️ Rename</div>
          <div onClick={handleDelete}>🗑️ Delete</div>
        </div>
      )}
    </div>
  );
};

export default Tree;
