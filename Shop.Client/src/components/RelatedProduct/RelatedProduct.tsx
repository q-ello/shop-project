import React from 'react'
import { productsSelector } from '../../redux/hooks'
import { store } from '../../redux/store'
import st from './RelatedProduct.module.scss'
import { title } from 'process'
import { Link } from 'react-router-dom'
import { defaultImg } from '../../const'

interface RelProdProps {
    id: string
}

const RelatedProduct = ({ id }: RelProdProps) => {
    const product = productsSelector.selectById(store.getState(), id)
    return (
        <div className={st.rel_prod}>
            <Link className={st.link} to={`/${id}`}><h4 className={st.h4}>{product.title}</h4></Link>
            <span>{product.price}</span>
        </div>
    )
}

export default RelatedProduct