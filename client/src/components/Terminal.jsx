import React from 'react'
import { useEffect,useRef } from 'react';
import {Terminal as XTerminal} from '@xterm/xterm'
import { FitAddon } from 'xterm-addon-fit';
import socket from '../socket';
import '@xterm/xterm/css/xterm.css'

const Terminal = () => {

        const terminalRef = useRef(null);
        const termRef = useRef(null); // Store terminal instance
        const fitAddonRef = useRef(null); // Store fitAddon instance
    
    useEffect(()=>{
        if (termRef.current) return; // Avoid re-initialization

        //Created a new terminal instance
        const term = new XTerminal(
            {
                fontSize: 12,
                allowTransparency: true,
                bellStyle: 'sound', 
            }
        );  

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);  // term.open() is called to bind the terminal to the DOM element referenced by terminalRef.
        fitAddon.fit(); // Automatically fit to container size
        
        termRef.current = term;
        fitAddonRef.current = fitAddon;

        // term.onData() is an event listener for when the user types something into the terminal.
        // The input (data) is emitted via socket.emit('terminal:write') to the server, allowing the terminal to send commands.
        term.onData(data =>{
            socket.emit('terminal:write',data)
            // console.log(data)
        })

         // Server output → terminal
        const onTerminalData = (data) => {
            term.write(data);
        };
        // Listens for server-side terminal output via the socket.on('terminal:data') event.
        // When data is received, it’s written to the terminal using term.write(data).
        socket.on('terminal:data',onTerminalData);

        // Resize listener
        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        // ✅ Cleanup on unmount
        // return () => {
        //     socket.off('terminal:data', onTerminalData);
        //     window.removeEventListener('resize', handleResize);
        // };
    },[]);
  return (
    <div
      ref={terminalRef}
      id="terminal"
      style={{ width: '100%', height: '100vh' }}
    ></div>
  )
}

export default Terminal
