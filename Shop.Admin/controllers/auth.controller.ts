import { NextFunction, Request, Response, Router } from "express";
import { throwServerError } from "./helper";
import { IAuthRequisites } from "@Shared/types";
import { verifyRequisites } from "../models/auth.model";

export const authRouter = Router()

authRouter.get('/login', async (req: Request, res: Response) => {
    try {
        res.render('login')
    } catch (e) {
        throwServerError(res, e)
    }
})

authRouter.post('/authenticate', async (req: Request<{}, {}, IAuthRequisites>, res: Response) => {
    try {
        const verified = await verifyRequisites(req.body)

        if (verified) {
            req.session.username = req.body.username;
            res.redirect(`/${process.env.ADMIN_PATH}`)
        } else {
            res.redirect(`/${process.env.ADMIN_PATH}/auth/login`)
        }
    } catch (e) {
        throwServerError(res, e)
    }
})

authRouter.get('/logout', async (req: Request, res: Response) => {
    try {
        req.session.destroy((e) => {
            if (e) {
                console.log('Something went wrong with session destroying', e)
            }

            res.redirect(`/${process.env.ADMIN_PATH}/auth/login`);
        })
    } catch (e) {
        throwServerError(res, e)
    }
})

export const validateSession = (req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('/login') || req.path.includes('/authenticate')) {
        res.locals.work = 'That is working, hon'
        res.locals.logged_in = false
        next()
        return
    }

    if (req.session?.username) {
        res.locals.logged_in = true
        res.locals.work = 'That is working, hon'
        next()
    } else {
        res.redirect(`/${process.env.ADMIN_PATH}/auth/login`)
    }
}