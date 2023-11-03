import { IComment, IImage, IProduct } from "@Shared/types"
import { ICommentEntity, IImageEntity, IProductEntity, relatedProductsEntity } from "../../types"

export const mapCommentsEntity = (data: ICommentEntity[]): IComment[] => {
    return data.map(mapCommentEntity)
}

export const mapCommentEntity = ({product_id, comment_id, ...rest}: ICommentEntity): IComment => {
    return ({
        id: comment_id,
        productId: product_id,
        ...rest
    })
}

export const mapProductsEntity = (data: IProductEntity[]): IProduct[] => {
    return data.map(({product_id, title, description, price}) => ({
        id: product_id,
        title: title || '',
        description: description || '',
        price: Number(price) || 0
    }))
}

export const mapImageEntity = ({product_id, ...rest}: IImageEntity): IImage => {
    return ({
        productId: product_id,
        ...rest
    })
} 

export const mapImagesEntity = (data: IImageEntity[]): IImage[] => {
    return data.map(mapImageEntity)
}