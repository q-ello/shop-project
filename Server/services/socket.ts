import { Server } from "socket.io"
import {Express} from 'express'
import { createServer } from "http"

const log = (message) => console.log(`Socket.IO: ${message}`)

export const initSocketServer = (applicationServer: Express): Server => {
    const httpServer = createServer(applicationServer)

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5000"
        }
    })

    io.on('connection', () => {
        log('A client is connected')
    })

    httpServer.listen(3001, () => {
        log('Server is running on port 3001')
    })

    return io
}