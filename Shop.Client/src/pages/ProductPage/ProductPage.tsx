import React, { ChangeEvent, useEffect, useState, MouseEvent } from 'react'
import { useParams } from 'react-router-dom'
import { productsSelector, saveErrorSelector, useAppDispatch, useAppSelector } from '../../redux/hooks'
import { store } from '../../redux/store'
import { defaultImg } from '../../const'
import { getRelatedProducts, saveComment } from '../../api/api'
import RelatedProduct from '../../components/RelatedProduct/RelatedProduct'
import Comment from '../../components/Comment/Comment'
import st from './ProductPage.module.scss'
import { clearSaveError } from '../../redux/productSlice'

const ProductPage = () => {
  const params = useParams()
  const id = params.id
  const product = productsSelector.selectById(store.getState(), id)
  const [relProds, setRelProds] = useState<string[]>([])
  const [error, setError] = useState<Error>(null)

  const saveError = useAppSelector(saveErrorSelector)

  const dispatch = useAppDispatch()


  useEffect(() => {
    getRelatedProducts(id)
      .then(res => {
        setRelProds(res)
        setError(null)
      })
      .catch(err => {
        setRelProds([])
        setError(err)
      })

    if (saveError) {
      dispatch(clearSaveError())
    }
  }, [id])


  const [nameValue, setNameValue] = useState<string>('')
  const [emailValue, setEmailValue] = useState<string>('')
  const [bodyValue, setBodyValue] = useState<string>('')
  

  const changeNameValue = (e: ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value)
  }

  const changeEmailValue = (e: ChangeEvent<HTMLInputElement>) => {
    setEmailValue(e.target.value)
  }

  const changeBodyValue = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBodyValue(e.target.value)
  }


  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(saveComment({ productId: id, name: nameValue, email: emailValue, body: bodyValue }))
    setNameValue('')
    setEmailValue('')
    setBodyValue('')
    window.location.reload()
  }

  return (
    <div className={st.body}>
      <h1>{product.title}</h1>
      <img src={product.thumbnail?.url || defaultImg} alt='thumbnail' className={st.thumbnail} />
      {product.images && product.images.map(image => {
        if (!image.main) {
          return <img className={st.image} src={image.url} alt='additional image' />
        }
      })}
      {product.description && <p><strong>Description:</strong> <span>{product.description}</span></p>}
      <div><strong>Price: </strong>{product.price}</div>
      {error?.message ||
        !!relProds.length && <div>
          <h3 className={st.h3}>Related products: </h3>
          <div className={st.related_products}>
            {relProds.map(relatedProduct => <RelatedProduct id={relatedProduct} />)}
          </div>
        </div>
      }
      {product.comments?.length &&
        <div>
          <h3>Comments:</h3>
          <div className={st.comments}>
            {product.comments.map(comment => <Comment {...comment} key={comment.id}/>)}
          </div>
        </div>
      }
      <form className={st.add_comment}>
        <h3>Add comment:</h3>
        <div>
          <div>
            <label htmlFor="comment-name">Name: </label>
            <input id="comment-name" type="text" name="name" value={nameValue} onChange={changeNameValue} />
          </div>

          <div>
            <label htmlFor="comment-email">Email: </label>
            <input id="comment-email" type="text" name="email" value={emailValue} onChange={changeEmailValue} />
          </div>

          <div>
            <label htmlFor="comment-body">Your comment:</label>
            <textarea id="comment-body" name="body" value={bodyValue} onChange={changeBodyValue} />
          </div>
        </div>
        <button type='submit' className={st.button} onClick={handleClick} disabled={!nameValue || !emailValue || !bodyValue}>Save</button>
      </form>
      {saveError?.message}
    </div>
  )
}

export default ProductPage