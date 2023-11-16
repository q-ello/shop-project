require('dotenv').config()
import {Express} from 'express'
import {Connection} from 'mysql2/promise'
import { initServer } from './Server/services/server'
import { initDataBase } from './Server/services/db'
import ShopAPI from './Shop.API'
import ShopAdmin from './Shop.Admin'
import {Server} from 'socket.io'
import { initSocketServer } from './Server/services/socket'


export let server: Express
export let connection: Connection
export let ioServer: Server

async function launchApplication() {
    server = initServer()
    connection = await initDataBase()
    ioServer = initSocketServer(server)

    initRouter()
}

function initRouter() {
    const shopAPI = ShopAPI(connection)
    server.use('/api', shopAPI)

    const shopAdmin = ShopAdmin()
    server.use('/admin', shopAdmin)

    server.use('/', (_, res) => {
        res.send()
    })
}

launchApplication()