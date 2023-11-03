import { RowDataPacket } from "mysql2/index";
import { IAuthRequisites, IComment, IImage, IProduct, IProductFilterPayload } from '@Shared/types'


export interface ICommentEntity extends RowDataPacket {
    comment_id: string,
    name: string,
    email: string,
    product_id: string,
    body: string
}

export interface IProductEntity extends IProduct, RowDataPacket {
    product_id: string
}

export interface IProductSearchFilter extends IProductFilterPayload { }

export type ProductCreatePayload = Omit<IProduct, 'id' | 'comments'>

export interface IImageEntity extends RowDataPacket, IImage {
    product_id: string
}

export interface ProductAddImagesPayload {
    productId: string;
    images: ImageCreatePayload[];
}


export type ImageCreatePayload = Omit<IImage, "id" | "productId">;

export type ImagesRemovePayload = string[];

export interface IUserRequisitesEntity extends IAuthRequisites, RowDataPacket {
    id: number;
} 

export interface relatedProductsEntity extends RowDataPacket{
    product_id: string
    related_id: string,
}