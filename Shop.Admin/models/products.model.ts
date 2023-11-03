import axios from "axios"
import { IProduct, IProductFilterPayload } from '@Shared/types'
import { IProductEditData } from "../types"
import { API_HOST } from "./const"


export async function getProducts(): Promise<IProduct[]> {
    try {
        const { data } = await axios.get<IProduct[]>(`${API_HOST}/products`)
        return data
    } catch {
        return []
    }
}

export async function searchProducts(filter: IProductFilterPayload): Promise<IProduct[]> {
    try {
        const { data } = await axios.get<IProduct[]>(`${API_HOST}/products/search`, { params: filter })
        return data
    } catch {
        return []
    }
}

export async function getProduct(id: string): Promise<IProduct | null> {
    try {
        const { data } = await axios.get<IProduct>(`${API_HOST}/products/${id}`)
        return data
    } catch {
        return null
    }
}

export async function getRelatedProducts(id: string): Promise<IProduct[] | null> {
    try {
        const allProducts = await getProducts()
        const {data} = await axios.get<string[]>(`${API_HOST}/related-products/${id}`)
        const relatedProducts = allProducts.filter(product => data.includes(product.id))
        return relatedProducts
    } catch {
        return null
    }
}

export async function getOtherProducts(id: string): Promise<IProduct[] | null> {
    try {
        const allProducts = await getProducts()
        const {data} = await axios.get<string[]>(`${API_HOST}/related-products/${id}`)
        const otherProducts = allProducts.filter(product => product.id !== id && !data.includes(product.id))
        return otherProducts
    } catch {
        return null
    }
}

export async function removeProduct(id: string): Promise<void> {
    await axios.delete(`${API_HOST}/products/${id}`)
}

function compileIdsToRemove(data: string | string[]): string[] {
    if (typeof data === "string") return [data];
    return data;
}

function splitNewImages(str = ""): string[] {
    return str
        .split(/\r\n|,/g)
        .map(url => url.trim())
        .filter(url => url);
}

export async function updateProduct(
    productId: string,
    formData: IProductEditData
): Promise<void> {
    try {
        const { data: currentProduct } = await axios.get<IProduct>(`${API_HOST}/products/${productId}`);

        if (formData.commentsToRemove) {
            const commentsIdsToRemove = compileIdsToRemove(formData.commentsToRemove);

            const getDeleteCommentActions = () => commentsIdsToRemove.map(commentId => {
                return axios.delete(`${API_HOST}/comments/${commentId}`);
            });

            await Promise.all(getDeleteCommentActions());
        }

        if (formData.imagesToRemove) {
            const imagesIdsToRemove = compileIdsToRemove(formData.imagesToRemove);
            await axios.post(`${API_HOST}/products/remove-images`, imagesIdsToRemove);
        }

        if (formData.newImages) {
            const urls = splitNewImages(formData.newImages);
            const images = urls.map(url => ({ url, main: false }));

            if (!currentProduct.thumbnail) {
                images[0].main = true;
            }

            await axios.post(`${API_HOST}/products/add-images`, { productId, images });
        }

        if (formData.mainImage && formData.mainImage !== currentProduct.thumbnail?.id) {
            await axios.post(`${API_HOST}/products/update-thumbnail/${productId}`, {
                newThumbnailId: formData.mainImage
            });
        }

        if (formData.relatedProductsToRemove) {
            const relProdIdsToRemove = compileIdsToRemove(formData.relatedProductsToRemove)
            await axios.post(`${API_HOST}/related-products/${productId}`, {ids: relProdIdsToRemove})
        }

        if (formData.otherProductstoAdd) {
            const otherProductsIdsToAdd = compileIdsToRemove(formData.otherProductstoAdd)
            const idsToBond = otherProductsIdsToAdd.map(id => ({id: productId, related_id: id}))
            await axios.post(`${API_HOST}/related-products`, idsToBond)
        }
        await axios.patch(`${API_HOST}/products/${productId}`, {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price)
        });
    } catch (e) {
        console.log(e);
    }
}

export async function createProduct(
    formData: IProductEditData
): Promise<string> {
    try {
        const {data: newProduct} = await axios.post(`${API_HOST}/products/`, {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price)
        });
        return newProduct.id
    } catch (e) {
        console.log(e);
    }
}
