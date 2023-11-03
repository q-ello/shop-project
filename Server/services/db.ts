import mysql, { Connection } from "mysql2/promise";

const host = process.env.LOCAL_HOST
const port = Number(process.env.DB_PORT)
const user = process.env.USER 
const database = process.env.DATABASE

export async function initDataBase(): Promise<Connection | null> {
    let connection: Connection | null = null

    try {
        connection = await mysql.createConnection({
            host,
            port,
            user,
            database
        })
    } catch (e) {
        console.error(e.message || e)
        return null
    }

    console.log('Connection to DB ProductsApplication established')
    return connection
}