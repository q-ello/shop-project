import { Request, Response, Router } from "express";
import { createProduct, getOtherProducts, getProduct, getProducts, getRelatedProducts, removeProduct, searchProducts, updateProduct } from "../models/products.model";
import { IProductFilterPayload } from "@Shared/types";
import { IProductEditData } from "../types";
import { throwServerError } from "./helper";

export const ProductsRouter = Router()


ProductsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const products = await getProducts()
        res.render('products', { items: products, queryParams: {} })
    } catch (e) {
        throwServerError(res, e)
    }
})

ProductsRouter.get('/search', async (req: Request<{}, {}, {}, IProductFilterPayload>, res: Response) => {
    try {

        const products = await searchProducts(req.query)
        res.render('products', {
            items: products,
            queryParams: req.query
        })
    } catch (e) {
        throwServerError(res, e)
    }
})


ProductsRouter.get('/new-product', async (req: Request, res: Response) => {
    try {
        res.render('new-product')
    } catch (e) {
        throwServerError(res, e)
    }
})

ProductsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    try {

        const id = req.params.id
        const product = await getProduct(id)
        const related = await getRelatedProducts(id)
        const others = await getOtherProducts(id)
        if (!!product) {
            res.render('product/product', { item: product, related, others})
        } else {
            res.render('product/empty-product', { id: req.params.id })
        }
    } catch (e) {
        throwServerError(res, e)
    }
})

ProductsRouter.get('/remove-product/:id', async (req: Request, res: Response) => {
    try {
        if (req.session.username !== 'admin') {
            res.status(403)
            res.send('Forbidden')
            return
        }
        await removeProduct(req.params.id)
        res.redirect(`/${process.env.ADMIN_PATH}`)
    } catch (e) {
        throwServerError(res, e)
    }
})

ProductsRouter.post('/save/:id', async (req: Request<{id: string}, {}, IProductEditData>, res: Response) => {
    try {
        const updatedProduct = await updateProduct(req.params.id, req.body)
        res.send('OK')
    } catch (e) {
        throwServerError(res, e)
    }
})

ProductsRouter.post('/create-product', async (req: Request<{id: string}, {}, IProductEditData>, res: Response) => {
    try {
        const id = await createProduct(req.body)
        res.redirect(`/${process.env.ADMIN_PATH}/${id}`)
    } catch (e) {
        throwServerError(res, e)
    }
})
