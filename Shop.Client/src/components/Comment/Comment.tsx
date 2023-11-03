import { IComment } from '@Shared/types'
import React from 'react'
import st from './Comment.module.scss'

const Comment = ({name, email, body}: IComment) => {
  return (
    <div className={st.comment}>
        <h4 className={st.name}>{name}</h4>
        <strong>{email}:</strong>
        <p className={st.p}>{body}</p>
    </div>
  )
}

export default Comment