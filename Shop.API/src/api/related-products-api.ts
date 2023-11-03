import { Request, Response, Router } from "express";
import { connection } from "../..";
import { relatedProductsEntity } from "../../types";
import { ResultSetHeader } from "mysql2";
import { DELETE_RELATED_QUERY, INSERT_RELATED_QUERY, SELECT_RELATED_QUERY_LEFT, SELECT_RELATED_QUERY_RIGHT } from "../services/queries";
import { body, param, validationResult } from "express-validator";

export const relatedProductsRouter = Router()

const throwServerError = (res: Response, e: Error) => {
    console.debug(e)
    res.status(500)
    res.send('Something went wrong')
}

relatedProductsRouter.get('/:id', [param('id').isUUID().withMessage('Product id is not UUID')], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400)
            res.json({ errors: errors.array() })
            return
        }
        const id = req.params.id
        const [relatedProductsLeft] = await connection.query<relatedProductsEntity[]>(SELECT_RELATED_QUERY_LEFT, id)
        const [relatedProductsRight] = await connection.query<relatedProductsEntity[]>(SELECT_RELATED_QUERY_RIGHT, id)
        const ids: string[] = []
        relatedProductsLeft.map(product => {
            ids.push(product.related_id)
        })
        relatedProductsRight.map(product => {
            ids.push(product.product_id)
        })
        res.status(200)
        res.send(ids)
    } catch (e) {
        throwServerError(res, e)
    }
})

relatedProductsRouter.post('/',
    [
        body().isArray().withMessage('Body is not an array'),
        body('*.id').isUUID().withMessage('Id is not UUID'),
        body('*.related_id').isUUID().withMessage('Related_id is not UUID'),
    ]
    ,
    async (req: Request<{}, {}, relatedProductsEntity[]>, res: Response) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(404)
                res.json({ errors: errors.array() })
                return
            }
            const ids = req.body
            let values = ''
            ids.map(({ id, related_id }) => {
                if (id === related_id) {
                    res.status(400)
                    res.send('Product cannot be related to itself')
                    return
                }
                if (values.length) {
                    values += ', '
                }
                values += `("${id}", "${related_id}")`
            })
            await connection.query<ResultSetHeader>(`${INSERT_RELATED_QUERY} ${values}`)
            res.status(201)
            res.send(`All these products are related now!`)
        } catch (e) {
            throwServerError(res, e)
        }
    })

relatedProductsRouter.post('/:id', [
    param('id').isUUID().withMessage('Id is not UUID'),
    body('ids').isArray().withMessage('Body is not an array'),
], async (req: Request<{id: string}, {}, {ids: string[]}>, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(404)
            res.json({ errors: errors.array() })
        }
        const [info] = await connection.query<ResultSetHeader>(DELETE_RELATED_QUERY, [req.params.id, [req.body.ids], req.params.id, [req.body.ids]])
        if (info.affectedRows === 0) {
            res.status(404)
            res.send('These ids were not related')
        }
        res.status(200)
        res.end()
    } catch (e) {
        throwServerError(res, e)
    }
})