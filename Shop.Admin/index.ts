import express, {Express} from "express"
import { ProductsRouter } from "./controllers/products.controller"
import layouts from 'express-ejs-layouts'
import bodyParser from 'body-parser'
import { authRouter, validateSession } from "./controllers/auth.controller"
import session from "express-session"

export default function (): Express {
    const app = express()

    app.use(express.json())
    app.use(bodyParser.urlencoded({extended: false}))

    app.use(session({
        secret: process.env.SECRET,
        saveUninitialized: false,
        resave: false
    }))

    app.set('view engine', 'ejs')
    app.set('views', 'Shop.Admin/views')

    app.use(layouts)

    app.use(express.static(__dirname + '/public'))

    app.use(validateSession)

    app.use('/auth', authRouter)
    app.use('/', ProductsRouter)

    return app
}