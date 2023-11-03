import { IProduct } from '@Shared/types'
import React from 'react'
import st from './ProductComponent.module.scss'
import { Link } from 'react-router-dom'
import { defaultImg } from '../../const'

const ProductComponent = ({ title, thumbnail, price, comments, id }: IProduct) => {
    return (
        <div className={st.product}>
            <Link className={st.link} to={`/${id}`}><img src={thumbnail?.url || defaultImg} alt='thumbnail'/></Link>
            <div className={st.info}>
                <Link className={st.link} to={`/${id}`}><h2>{title}</h2></Link>
                <span>{price}</span>
                <span>{comments?.length || 0} comments</span>
            </div>
        </div>
    )
}

export default ProductComponent