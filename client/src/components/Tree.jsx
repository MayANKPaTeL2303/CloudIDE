import React from 'react'

const FileTreeNodes = ({ filename, nodes,onSelect, path }) => {
  const isDir = !!nodes;
  return (
    <div onClick={(e)=>{
       e.stopPropagation() //To avoid the click on the parent folders
       if(isDir) return;    //Avoid for clicking to the directory 
       onSelect(path)
    }} style={{ marginLeft: '4px' }}>
      <span className={isDir? "isfolder":""}>{filename}</span>
      {nodes && filename !== 'node_modules' && (
        <ul>
          {Object.keys(nodes).map((child) => (
            <li key={child}>
              <FileTreeNodes onSelect={onSelect} path={path + '/' + child} filename={child} nodes={nodes[child]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const Tree = ({ tree,onSelect }) => {
  console.log(tree)
  return (
    <div>
      <FileTreeNodes onSelect={onSelect} filename="/" nodes={tree} path="" />
    </div>
  )
}

export default Tree
