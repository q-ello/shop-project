import { createAsyncThunk, createEntityAdapter, createSlice, isRejectedWithValue, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import { IProduct } from "@Shared/types"
import axios from "axios";
import { getProduct, getProducts, saveComment } from "../api/api";

export const productsAdapter = createEntityAdapter<IProduct>()

export const productSlice = createSlice({
    name: 'products',
    initialState: productsAdapter.getInitialState({ status: 'idle', getError: null, saveError: null }),
    reducers: {
        clearSaveError (state) {
            state.saveError = null
        },
        updateProduct (state, action: PayloadAction<IProduct>) {
            productsAdapter.upsertOne(state, action.payload)
        },
        throwSaveError (state, action: PayloadAction<Error>) {
            state.saveError = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.pending, (state) => {
                state.status = 'loading'
                state.getError = null
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                productsAdapter.setAll(state, action.payload)
                state.status = 'succeeded'
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.status = 'failed'
                state.getError = action.payload
            })
            .addCase(saveComment.rejected, (state, action) => {
                state.saveError = action.payload
            })
    }
})

export const {clearSaveError, updateProduct, throwSaveError} = productSlice.actions