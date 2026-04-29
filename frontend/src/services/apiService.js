import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/v1',
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY,
    'Content-Type': 'application/json',
  },
})

export const getCars     = (params)  => client.get('/cars', { params })
export const getCarById  = (id)      => client.get(`/cars/${id}`)
export const searchCars  = (q)       => client.get('/cars/search', { params: { q } })
export const getBrands   = ()        => client.get('/brands')
export const getModels   = (brand)   => client.get('/models', { params: { brand } })

export default client
