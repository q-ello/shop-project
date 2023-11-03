import { CommentCreatePayload } from "@Shared/types"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { throwSaveError, updateProduct } from "../redux/productSlice"

export const getProducts = createAsyncThunk('products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/products`)
            if (response.status !== 200) {
                throw new Error(response.data)
            }
            return response.data
        } catch (e) {
            return rejectWithValue(e)
        }
    })

export const getProduct = async (id: string) => {
    const response = await axios.get(`http://localhost:3000/api/products/${id}`)

    if (response.status !== 200) {
        throw new Error(response.data)
    }

    return response.data
}


export const searchProducts = async (title?: string, priceFrom?: number, priceTo?: number) => {
    const response = await axios.get('http://localhost:3000/api/products/search',
        { params: { title, priceFrom, priceTo } }
    )

    if (response.status !== 200) {
        throw new Error(response.data)
    }

    return response.data
}

export const getRelatedProducts = async (id: string) => {
    const response = await axios.get(`http://localhost:3000/api/related-products/${id}`)
    if (response.status !== 200) {
        throw new Error(response.data)
    }
    return response.data
}

export const saveComment = createAsyncThunk('products/addComment',
    async ({ productId, name, email, body }: CommentCreatePayload, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post('http://localhost:3000/api/comments', { productId, name, email, body })
            if (response.status !== 201) {
                throw new Error(response.data)
            }
            getProduct(productId)
                .then(res => dispatch(updateProduct(res)))
                .catch(err => dispatch(throwSaveError(err)))
            return productId
        } catch (e) {
            return rejectWithValue(e)
        }
    })
