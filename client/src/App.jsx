import { useCallback, useEffect,useState } from "react";
import Terminal from "./components/Terminal";
import Tree from "./components/Tree";
import Navbar from "./components/Navbar";
import socket from "./socket";
import AceEditor from "react-ace";
import './App.css'


import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-monokai";  // Dark theme


function App() {
  const [fileTree,setFileTree] = useState([])
  const [selectedFileContent, setselectedFileContent] = useState('') 
  const [selectedFile, setselectedFile] = useState('') 
  const [code,setCode] = useState("")

  const isSaved = selectedFileContent === code

  const getFileTree = useCallback(async () => {
    const response = await fetch('http://localhost:9000/files');
    const result = await response.json();
    setFileTree(result.tree);
  }, []);

  const getFilecontent = useCallback(async ()=>{
      if(!selectedFile) return;
  
      const response = await fetch(`http://localhost:9000/files/content?path=${selectedFile}`)
      const result = await response.json();
      setselectedFileContent(result.content)
  },[selectedFile])

  useEffect(()=>{
    if(selectedFile) getFilecontent()
  },[getFilecontent,selectedFile])

  useEffect(()=>{
    if(selectedFile && selectedFileContent !== "")
    {
      setCode(selectedFileContent)
    }
  },[selectedFile,selectedFileContent])

  useEffect(()=>{
    getFileTree()
  },[getFileTree])

  useEffect(()=>{
    socket.on('file:refresh',getFileTree);
    return ()=>{
      socket.off('file:refresh',getFileTree);
    };
  },[getFileTree]);

  useEffect(()=>{
    if(code && !isSaved){
      const timer = setTimeout(()=>{
        socket.emit('file:change',{
          path: selectedFile,
          content: code
        })
      }, 3000)
      return ()=>{
        clearTimeout(timer)
      }
    }
  },[code,selectedFile, isSaved])

  // Right click action (delete, rename)
  const handleRename = async (oldPath, newPath) => {
    await fetch('http://localhost:9000/files/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath, newPath }),
    });
    getFileTree();
  };
  const handleDelete = async (path) => {
    await fetch('http://localhost:9000/files/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (selectedFile === path) {
      setselectedFile('');
      setCode('');
    }
    getFileTree();
  };



return (
  <>
    <Navbar />
    <div className="playground-container">
      <div className="main-row">
        <div className="files">
          <Tree
            tree={fileTree}
            onSelect={(path) => {if (!path.endsWith('/')) setselectedFile(path);}}
            selectedFile={selectedFile} 
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </div>
        <div className="editor-terminal">
          <div className="editor">
            {selectedFile && (
              <p className="file-status">
                {selectedFile.replaceAll('/', ' ➝ ')} &nbsp;
                <span className={isSaved ? 'saved' : 'unsaved'}>
                  {isSaved ? 'Saved' : 'Unsaved'}
                </span>
              </p>
            )}          
            <AceEditor
              mode="javascript"     
              theme="monokai"           
              value={code}              
              name="codeEditor"         
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
              height="100%"
              width="100%"
              onChange={(e)=> setCode(e)}
            />
          </div>
          <div className="terminal-container">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  </>
);
}

export default App;
