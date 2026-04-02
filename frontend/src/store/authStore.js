import{create}from'zustand';import{persist}from'zustand/middleware';import api from'../utils/api';
export const useAuthStore=create(persist(set=>({token:null,user:null,
  login:async(u,p)=>{const{data}=await api.post('/auth/login',{username:u,password:p});set({token:data.access_token,user:{id:data.user_id,username:data.username}});return data;},
  register:async(u,e,p)=>{const{data}=await api.post('/auth/register',{username:u,email:e,password:p});set({token:data.access_token,user:{id:data.user_id,username:data.username}});return data;},
  logout:()=>set({token:null,user:null})
}),{name:'racing-auth'}));
