import React, { useEffect, useMemo } from 'react'
import { getErrorSelector, productsSelector, statusSelector, useAppSelector } from '../../redux/hooks'
import { store } from '../../redux/store'
import { Link } from 'react-router-dom'
import st from './Home.module.scss'

const Home = () => {
  const products = productsSelector.selectAll(store.getState())
  const overallPrice = useMemo(() => {
    let price = 0
    products.map(product => {
      price += product.price
    })
    return price
  }, [products])
  
  const getError = useAppSelector(getErrorSelector)
  const status = useAppSelector(statusSelector)
  

  return (
    <div className={st.home}>
      <h1>Shop.Client</h1>
      {status === 'loading' ?
        <p>Loading...</p>
        : status === 'succeeded' ?
          <p>В базе данных находится <span className={st.span}>{products.length}</span> товаров общей стоимостью <span className={st.span}>{overallPrice}</span></p>
          : <p>{getError.message}</p>
        }
      
      <div>
        <button className={st.button}><Link className={st.link} to={'/products-list'}>Перейти к списку товаров</Link></button>
        <button className={st.button}><Link className={st.link} to={'http://localhost:3000/admin'} target='_blank'>Перейти в систему администрирования</Link></button>
      </div>
    </div>
  )
}

export default Home