import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "./store"
import { productsAdapter } from "./productSlice"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const productsSelector = productsAdapter.getSelectors<RootState>((state) => state.products)
export const statusSelector = (state: RootState) => state.products.status
export const getErrorSelector = (state: RootState) => state.products.getError
export const saveErrorSelector = (state: RootState) => state.products.saveError
