import { CommentCreatePayload, IComment, IImage, IProduct } from "@Shared/types"
import { ICommentEntity, IImageEntity, IProductSearchFilter } from "../types";
import { mapCommentEntity, mapImageEntity } from "./services/mapping";

type CommentValidator = (comment: CommentCreatePayload) => string | null;

export const validateComment: CommentValidator = (comment) => {
  if (!comment || !Object.keys(comment).length) {
    return "Comment is absent or empty";
  }

  const requiredFields = new Set<keyof CommentCreatePayload>([
    "name",
    "email",
    "body",
    "productId"
  ]);

  let wrongFieldName;

  requiredFields.forEach((fieldName) => {
    if (!comment[fieldName]) {
      wrongFieldName = fieldName;
      return;
    }
  });

  if (wrongFieldName) {
    return `Field '${wrongFieldName}' is absent`;
  }

  return null;
}

const compareValues = (target: string, compare: string): boolean => {
  return target.toLowerCase() === compare.toLowerCase();
}

export const checkCommentUniq = (payload: CommentCreatePayload, comments: IComment[]): boolean => {
  const byEmail = comments.find(({ email }) => compareValues(payload.email, email));

  if (!byEmail) {
    return true;
  }

  const { body, name, productId } = byEmail;
  return !(
    compareValues(payload.body, body) &&
    compareValues(payload.name, name) &&
    compareValues(payload.productId.toString(), productId.toString())
  );
}
export const enhanceProductsComments = (products: IProduct[], commentRows: ICommentEntity[]): IProduct[] => {
  const commentsByProductId = new Map<string, IComment[]>()
  for (let commentEntity of commentRows) {
    const comment = mapCommentEntity(commentEntity)
    if (!commentsByProductId.has(comment.productId)) {
      commentsByProductId.set(comment.productId, [])
    }

    const list = commentsByProductId.get(comment.productId)
    commentsByProductId.set(comment.productId, [...list, comment])
  }

  for (let product of products) {
    if (commentsByProductId.has(product.id)) {
      product.comments = commentsByProductId.get(product.id)
    }
  }

  return products
}

export const getProductsFilterQuery = (filter: IProductSearchFilter): [string, string[]] => {
  const {title, description, priceFrom, priceTo} = filter
  let query = 'select * from products where '
  const values = []

  if (title) {
    query += 'title like ? '
    values.push(`%${title}%`)
  }

  if (description) {
    if (values.length) {
      query += 'or '
    }
    query += 'description like ?'
    values.push(`%${description}%`)
  }

  if (priceFrom || priceTo) {
    if (values.length) {
      query += 'or '
    }
    query += 'price between ? and ?'
    values.push(priceFrom || 0)
    values.push(priceTo || 999999)
  }

  return [query, values]
}

export const enhanceProductsImages = (products: IProduct[], imageRows: IImageEntity[], thumbnails: IImageEntity[]): IProduct[] => {
  const imagesByProductId = new Map<string, IImage[]>()
  for (let ImageEntity of imageRows) {
    const img = mapImageEntity(ImageEntity)
    if (!imagesByProductId.has(img.productId)) {
      imagesByProductId.set(img.productId, [])
    }

    const list = imagesByProductId.get(img.productId)
    imagesByProductId.set(img.productId, [...list, ImageEntity])
  }

  for (let product of products) {
    if (imagesByProductId.has(product.id)) {
      product.images = imagesByProductId.get(product.id)
      product.thumbnail = thumbnails.find(th => th.product_id === product.id)
    }
  }

  return products
}