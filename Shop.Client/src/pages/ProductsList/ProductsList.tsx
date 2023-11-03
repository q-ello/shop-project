import React, { ChangeEvent, useState, MouseEvent } from 'react'
import { productsSelector } from '../../redux/hooks'
import { store } from '../../redux/store'
import st from './ProductsList.module.scss'
import ProductComponent from '../../components/ProductComponent/ProductComponent'
import { IProduct } from '@Shared/types'
import { searchProducts } from '../../api/api'

const ProductsList = () => {
  const allProducts = productsSelector.selectAll(store.getState())
  const [titleValue, setTitleValue] = useState<string>('')
  const [priceFromValue, setPriceFromValue] = useState<string>('')
  const [priceToValue, setPriceToValue] = useState<string>('')
  const [error, setError] = useState<Error>(null)

  const [products, setProducts] = useState<IProduct[]>(allProducts)

  const changeTitleValue = (e: ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value)
  }

  const changePriceFromValue = (e: ChangeEvent<HTMLInputElement>) => {
    setPriceFromValue(e.target.value)
  }

  const changePriceToValue = (e: ChangeEvent<HTMLInputElement>) => {
    setPriceToValue(e.target.value)
  }

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!titleValue && !priceFromValue && !priceToValue) {
      setProducts(allProducts)
      return
    }

    searchProducts(titleValue || null, +priceFromValue || null, +priceToValue || null)
      .then(res => {
        setProducts(res)
        setError(null)
      })
      .catch(err => {
        setError(err)
        setProducts([])
      })

    setTitleValue('')
    setPriceFromValue('')
    setPriceToValue('')
  }

  return (
    <div className={st.body}>
      <h1 className={st.h1}>Список товаров ({products.length})</h1>
      <form className={st.products_search_form}>
        <div className={st.products_search}>
          <div>
            <label htmlFor="filter-input">Title:</label>
            <input id="filter-input" type="text" name="title" value={titleValue} onChange={changeTitleValue} />
          </div>

          <div>
            <label htmlFor="filter-price-from">Price from:</label>
            <input id="filter-price-from" type="text" name="priceFrom" value={priceFromValue} onChange={changePriceFromValue} />
          </div>

          <div>
            <label htmlFor="filter-price-to">Price to:</label>
            <input id="filter-price-to" type="text" name="priceTo" value={priceToValue} onChange={changePriceToValue} />
          </div>
        </div>
        <button type='submit' className={st.button} onClick={handleClick}>Search</button>
      </form>
      <div className={st.products}>
        {products.map(product =>
          <ProductComponent {...product} key={product.id} />
        )}
        {error && <div>{error?.message}</div>}

      </div>

    </div>
  )
}

export default ProductsList