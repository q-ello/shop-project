export interface IComment {
    id: string,
    name: string,
    email: string,
    productId: string,
    body: string
}

export interface IProduct {
    id: string,
    title: string,
    description: string,
    price: number,
    comments?: IComment[],
    images?: IImage[],
    thumbnail?: IImage,
}

export interface IImage {
    id: string,
    url: string,
    productId: string,
    main: boolean
}


export interface IProductFilterPayload {
    title?: string,
    description?: string,
    priceFrom?: number,
    priceTo?: number
}

export interface IAuthRequisites {
    username: string,
    password: string
}

export type CommentCreatePayload = Omit<IComment, "id">;
