import { ICommentEntity } from '../../types'
import { Request, Response, Router } from 'express'
import { v4 as uuidv4 } from 'uuid';
import { validateComment } from '../helpers';
import { connection } from '../..';
import { mapCommentEntity, mapCommentsEntity } from '../services/mapping';
import { ResultSetHeader } from 'mysql2/promise';
import { deleteQuery, findDuplicateQuery, insertQuery } from '../services/queries';
import { CommentCreatePayload, IComment } from '../../../Shared/types';
import { param, validationResult } from 'express-validator';

export const commentsRouter = Router()

commentsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const [comments] = await connection.query<ICommentEntity[]>('select * from comments')
        res.setHeader('Content-type', 'application/json')
        res.send(mapCommentsEntity(comments))
    } catch (e) {
        console.debug(e.message)
        res.status(500)
        res.send('Something went wrong')
    }
})

commentsRouter.post('/', async (req: Request<{}, {}, CommentCreatePayload>, res: Response) => {
    const validationResult = validateComment(req.body)

    if (validationResult) {
        res.status(400)
        res.send(validationResult)
    }

    try {
        const { productId, name, email, body } = req.body

        const [sameResult] = await connection.query<ICommentEntity[]>(findDuplicateQuery, [email.toLowerCase(), name.toLowerCase(), productId,
        body.toLowerCase()])

        if (sameResult.length) {
            res.status(422)
            res.send('Comment with the same fields already exists')
            return
        }

        const id = uuidv4()
        const [info] = await connection.query<ResultSetHeader>(insertQuery, [id, email, name, body, productId])

        console.log(info)

        res.status(201)
        res.send(`Comment id:${id} has been added!`)
    } catch (e) {
        console.debug(e.message)
        res.status(500)
        res.send('Server error. Comment has not been created')
    }
})

commentsRouter.patch('/', async (req: Request<{}, {}, Partial<IComment>>, res: Response) => {
    try {
        let updateQuery = 'update comments set '

        const valuesToUpdate = []
        const fieldnames = ["name", "body", "email"]
        fieldnames.forEach(fieldName => {
            if (req.body.hasOwnProperty(fieldName)) {
                if (valuesToUpdate.length) {
                    updateQuery += ', '
                }
                updateQuery += `${fieldName} = ?`
                valuesToUpdate.push(req.body[fieldName])
            }
        })

        updateQuery += 'where comment_id = ?'
        valuesToUpdate.push(req.body.id)

        const [info] = await connection.query<ResultSetHeader>(updateQuery, valuesToUpdate)

        if (info.affectedRows === 1) {
            res.status(200)
            res.end()
            return
        }

        const newComment = req.body as CommentCreatePayload

        const validationResult = validateComment(newComment)

        if (validationResult) {
            res.status(400)
            res.send(validationResult)
            return
        }

        const id = uuidv4()

        await connection.query<ResultSetHeader>(insertQuery, [id, newComment.email, newComment.name, newComment.body, newComment.productId])

        res.status(201)
        res.send({ ...newComment, id })
    } catch (e) {
        console.debug(e.message)
        res.status(500)
        res.send('Server error')
    }
})

commentsRouter.delete(`/:id`, async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = req.params.id

        const [info] = await connection.query<ResultSetHeader>(deleteQuery, id)

        if (info.affectedRows === 1) {
            res.status(200)
            res.end()
            return
        }

        res.status(404)
        res.send(`Comment with id ${id} is not found`)
    } catch (e) {
        console.debug(e.message)
        res.status(500)
        res.send('Server error. The comment has not been deleted')
    }
})


commentsRouter.get(`/:id`,
    [param('id').isUUID().withMessage('Comment ID is not UUID')],
    async (req: Request<{ id: string }>, res: Response) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400)
                res.json({errors: errors.array()})
                return
            }
            const { id } = req.params

            const [comment] = await connection.query<ICommentEntity[]>(`select * from comments where comment_id = ?`, id)

            res.setHeader('Content-type', 'application/json')

            if (!comment.length) {
                res.status(404)
                res.send(`Comment with id ${id} is not found"`)
                return
            }

            res.send(mapCommentEntity(comment[0]))
        } catch (e) {
            console.debug(e.message)
            res.status(500)
            res.send('Something went wrong')
        }
    })
