import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { useAppDispatch } from './redux/hooks'
import { useEffect } from 'react'
import Home from './pages/Home/Home'
import ProductsList from './pages/ProductsList/ProductsList'
import { getProducts } from './api/api'
import ProductPage from './pages/ProductPage/ProductPage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getProducts())
  }, [])

  return (
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/products-list' element={<ProductsList/>}/>
        <Route path='/:id' element={<ProductPage/>}/>
      </Routes>
      </BrowserRouter>
  )
}

export default App