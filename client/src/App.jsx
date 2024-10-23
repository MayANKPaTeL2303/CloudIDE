import { useCallback, useEffect,useState } from "react";
import Terminal from "./components/terminal";
import Tree from "./components/Tree";
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

  const getFileTree = async()=>{
    const response = await fetch('http://localhost:9000/files')
    const result = await response.json();
    setFileTree(result.tree);   
  };

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
    if(selectedFile && selectedFileContent)
    {
      setCode(selectedFileContent)
    }
  },[selectedFile,selectedFileContent])

  useEffect(()=>{
    getFileTree()
  },[])

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
      },3*1000)
      return ()=>{
        clearTimeout(timer)
      }
    }
  },[code,selectedFile, isSaved])
  return (
    <>
      <div className="playground-container">
        <div className="editor-container">
          <div className="files">
            <Tree onSelect={(path)=>{setselectedFile(path)}} tree={fileTree}/>
          </div>
          <div className="editor">
            {selectedFile && <p>{selectedFile.replaceAll('/','-->')} {isSaved? 'Saved':'UnSaved'}</p>}
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
            height="600px"
            onChange={(e)=> setCode(e)}
            />
          </div>
        </div>
        <div className="terminal-container">
          <Terminal />
        </div>
      </div>
    </>
  );
}

export default App;
