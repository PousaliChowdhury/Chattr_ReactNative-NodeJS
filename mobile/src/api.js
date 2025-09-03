import axios from 'axios';

const API_URL = process.env.API_URL || 'http://192.x.x.x:4000';
export const api = axios.create({ baseURL: API_URL });
// export const api = axios.create({ baseURL: 'http://192.x.x.x:4000' });


export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}
