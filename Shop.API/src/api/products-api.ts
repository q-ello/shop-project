import { Router, Response, Request } from "express";
import { connection } from "../..";
import { ICommentEntity, IImageEntity, IProductEntity, IProductSearchFilter, ImagesRemovePayload, ProductAddImagesPayload, ProductCreatePayload } from "../../types";
import { mapCommentsEntity, mapImageEntity, mapImagesEntity, mapProductsEntity } from "../services/mapping";
import { enhanceProductsComments, enhanceProductsImages, getProductsFilterQuery } from "../helpers";
import { v4 as uuidv4 } from 'uuid'
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { DELETE_IMAGES_QUERY, INSERT_IMAGES_QUERY, INSERT_PRODUCT_QUERY, REPLACE_PRODUCT_THUMBNAIL, UPDATE_PRODUCT_FIELDS } from "../services/queries";
import { IImage, IProduct } from "@Shared/types";
import { body, param, validationResult } from "express-validator";
import {ioServer} from '../../../index'

export const productsRouter = Router()

const throwServerError = (res: Response, e: Error) => {
    console.debug(e)
    res.status(500)
    res.send('Something went wrong')
}

productsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const [productRows] = await connection.query<IProductEntity[]>('select * from products')
        const [commentRows] = await connection.query<ICommentEntity[]>('select * from comments')
        const [imageRows] = await connection.query<IImageEntity[]>('select * from images')
        const [thumbnails] = await connection.query<IImageEntity[]>('select * from images where main = true')

        const products = mapProductsEntity(productRows)
        const result = enhanceProductsComments(products, commentRows)
        const resultWImages = enhanceProductsImages(result, imageRows, thumbnails)
        res.status(200)
        res.send(resultWImages)
    } catch (e) {
        throwServerError(res, e)
    }
})

productsRouter.get('/search', async (req: Request<{}, {}, IProductSearchFilter>, res: Response) => {
    try {
        const [query, values] = getProductsFilterQuery(req.query)
        const [rows] = await connection.query<IProductEntity[]>(query, values)

        if (!rows.length) {
            res.status(404)
            res.send('Products are not found')
            return
        }

        const [commentRows] = await connection.query<ICommentEntity[]>('select * from comments')
        const [imageRows] = await connection.query<IImageEntity[]>('select * from images')
        const [thumbnails] = await connection.query<IImageEntity[]>('select * from images where main = true')

        const products = mapProductsEntity(rows)
        const result = enhanceProductsComments(products, commentRows)
        const resultWImages = enhanceProductsImages(result, imageRows, thumbnails)

        res.status(200)
        res.send(resultWImages)

    } catch (e) {
        throwServerError(res, e)
    }
})

productsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = req.params.id
        const [productRows] = await connection.query<IProductEntity[]>('select * from products where product_id = ?', id)
        if (productRows.length) {
            const product = mapProductsEntity(productRows)[0]
            const [comments] = await connection.query<ICommentEntity[]>('select * from comments where product_id = ?', id)
            const [imageRows] = await connection.query<IImageEntity[]>('select * from images where product_id = ?', id)
            const [thumbnails] = await connection.query<IImageEntity[]>('select * from images where product_id = ? and main = 1', id)
            if (comments.length) {
                product.comments = mapCommentsEntity(comments)
            }
            if (imageRows.length) {
                product.images = mapImagesEntity(imageRows)
                product.thumbnail = mapImageEntity(thumbnails[0])
            }
            res.status(200)
            res.send(product)
            return
        }
        res.status(404)
        res.send(`The product with id ${id} has not been found`)
    } catch (e) {
        throwServerError(res, e)
    }
})

productsRouter.post('/', async (req: Request<{}, {}, ProductCreatePayload>, res: Response) => {
    try {
        const { title, description, price, images } = req.body
        const id = uuidv4()
        await connection.query<ResultSetHeader>(INSERT_PRODUCT_QUERY,
            [id, title || null, description || null, price || null])
        if (images) {
            const imagesWithIDs = []
            images.map(async (img) => {
                const imgId = uuidv4()
                const imgWithId: IImage = {
                    id: imgId,
                    url: img.url,
                    main: img.main,
                    productId: id
                }
                await connection.query<ResultSetHeader>(INSERT_IMAGES_QUERY, [imgId, img.url, img.main, id])
                imagesWithIDs.push([imgId, img.url])
            })
            const [product] = await connection.query('select * from products where product_id = ?', id)
            product[0].images = imagesWithIDs
            product[0].thumbnail = imagesWithIDs.find(img => img.main === true)
        }

        const thumbnail = images?.find(img => img.main === true)

        const newProduct: IProduct = {
            id,
            title,
            description,
            price,
            images,
            thumbnail
        }

        const [products] = await connection.query<RowDataPacket[]>('select * from products')

        ioServer.emit('update products count', products?.length || 0)

        res.status(201)
        res.send(newProduct)
    } catch (e) {
        throwServerError(res, e)
    }
})

productsRouter.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = req.params.id
        await connection.query<ResultSetHeader>('delete from images where product_id = ?', id)
        await connection.query<ResultSetHeader>('delete from comments where product_id = ?', id)
        await connection.query<ResultSetHeader>('delete from related_products where product_id = ? or related_id = ?', [id, id])
        const [info] = await connection.query<ResultSetHeader>('delete from products where product_id = ?', id)

        if (info.affectedRows === 0) {
            res.status(404)
            res.send(`A product with id ${id} has not been found`)
            return
        }

        res.status(200)
        res.end()
    } catch (e) {
        throwServerError(res, e)
    }
})

productsRouter.post('/add-images', async (
    req: Request<{}, {}, ProductAddImagesPayload>,
    res: Response
) => {
    try {
        const { productId, images } = req.body;

        if (!images?.length) {
            res.status(400);
            res.send("Images array is empty");
            return;
        }

        const values = images.map((image) => [uuidv4(), image.url, image.main, productId]);
        await connection.query<ResultSetHeader>(INSERT_IMAGES_QUERY, [values]);

        res.status(201);
        res.send(`Images for a product id:${productId} have been added!`);
    } catch (e) {
        throwServerError(res, e);
    }
});

productsRouter.post('/remove-images', async (
    req: Request<{}, {}, ImagesRemovePayload>,
    res: Response
) => {
    try {
        const imagesToRemove = req.body;

        if (!imagesToRemove?.length) {
            res.status(400);
            res.send("Images array is empty");
            return;
        }

        const [info] = await connection.query<ResultSetHeader>(DELETE_IMAGES_QUERY, [[imagesToRemove]]);

        if (info.affectedRows === 0) {
            res.status(404);
            res.send("No one image has been removed");
            return;
        }

        res.status(200);
        res.send(`Images have been removed!`);
    } catch (e) {
        throwServerError(res, e);
    }
});
productsRouter.post('/update-thumbnail/:id',
    [body('newThumbnailId').notEmpty().withMessage('New thumbnail id is empty or not UUID'),
    param('id').isUUID().withMessage('Product id is not UUID')],
    async (
        req: Request<{ id: string }, {}, { newThumbnailId: string }>,
        res: Response
    ) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400)
                res.json({errors: errors.array()})
                return
            }
            const [currentThumbnailRows] = await connection.query<IImageEntity[]>(
                "SELECT * FROM images WHERE product_id=? AND main=?",
                [req.params.id, 1]
            );

            if (!currentThumbnailRows?.length || currentThumbnailRows.length > 1) {
                res.status(400);
                res.send("Incorrect product id");
                return;
            }

            const [newThumbnailRows] = await connection.query<IImageEntity[]>(
                "SELECT * FROM images WHERE product_id=? AND image_id=?",
                [req.params.id, req.body.newThumbnailId]
            );

            if (newThumbnailRows?.length !== 1) {
                res.status(400);
                res.send("Incorrect new thumbnail id");
                return;
            }

            const currentThumbnailId = currentThumbnailRows[0].image_id;
            const [info] = await connection.query<ResultSetHeader>(
                REPLACE_PRODUCT_THUMBNAIL,
                [currentThumbnailId, req.body.newThumbnailId, currentThumbnailId, req.body.newThumbnailId]
            );

            if (info.affectedRows === 0) {
                res.status(404);
                res.send("No one image has been updated");
                return;
            }

            res.status(200);
            res.send("New product thumbnail has been set!");
        } catch (e) {
            throwServerError(res, e);
        }
    });

productsRouter.patch('/:id', async (
    req: Request<{ id: string }, {}, ProductCreatePayload>,
    res: Response
) => {
    try {
        const { id } = req.params;

        const [rows] = await connection.query<IProductEntity[]>(
            "SELECT * FROM products WHERE product_id = ?",
            [id]
        );

        if (!rows?.[0]) {
            res.status(404);
            res.send(`Product with id ${id} is not found`);
            return;
        }

        const currentProduct = rows[0];

        await connection.query<ResultSetHeader>(
            UPDATE_PRODUCT_FIELDS,
            [
                req.body.hasOwnProperty("title") ? req.body.title : currentProduct.title,
                req.body.hasOwnProperty("description") ? req.body.description : currentProduct.description,
                req.body.hasOwnProperty("price") ? req.body.price : currentProduct.price,
                id
            ]
        );

        res.status(200);
        res.send(`Product id:${id} has been added!`);
    } catch (e) {
        throwServerError(res, e);
    }
})