import React from 'react'
import { useEffect,useRef } from 'react';
import {Terminal as XTerminal} from '@xterm/xterm'
import socket from '../socket';
import '@xterm/xterm/css/xterm.css'

const Terminal = () => {

    const terminalRef = useRef();  // A useRef hook to get a reference to the DOM element where the terminal will be rendered.
    const isRendered = useRef(false);  //A useRef to ensure the terminal is initialized at once.
    
    useEffect(()=>{
        if(isRendered.current) {
            return
        }
        //Created a new terminal instance
        const term = new XTerminal(
            {
                rows: 100,
                cols: 80,
                fontSize: 10,
                allowTransparency: true,
                bellStyle: 'sound',  
            }
        );  
        term.open(terminalRef.current);  // term.open() is called to bind the terminal to the DOM element referenced by terminalRef.
        isRendered.current = true;     //Does not allow for the re-rendering or Preventing Re-initialization

        // term.onData() is an event listener for when the user types something into the terminal.
        // The input (data) is emitted via socket.emit('terminal:write') to the server, allowing the terminal to send commands.
        term.onData(data =>{
            socket.emit('terminal:write',data)
            // console.log(data)
        })

        function onTerminalData(data)
        {
            term.write(data);
        }
        // Listens for server-side terminal output via the socket.on('terminal:data') event.
        // When data is received, it’s written to the terminal using term.write(data).
        socket.on('terminal:data',onTerminalData);

        // return ()=>{
        //     socket.off('terminal:data',onTerminalData)
        // }
    },[]);
  return (
    <div ref={terminalRef} id='terminal'>
      
    </div>
  )
}

export default Terminal
