import axios from'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'/api'});
api.interceptors.request.use(c=>{try{const s=JSON.parse(localStorage.getItem('racing-auth')||'{}');const t=s?.state?.token;if(t)c.headers.Authorization=`Bearer ${t}`;}catch{}return c;});
export default api;
