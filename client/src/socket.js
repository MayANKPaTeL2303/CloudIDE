import {io} from 'socket.io-client'
import dotenv from 'dotenv';
dotenv.config();

const API = process.env.REACT_APP_API_URL || 'http://localhost:9000';
const socket = io(API,{
    transports: ['websocket'],
})

export default socket;