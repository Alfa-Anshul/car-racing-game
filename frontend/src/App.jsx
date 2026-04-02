import React from'react';import{BrowserRouter,Routes,Route,Navigate}from'react-router-dom';
import{useAuthStore}from'./store/authStore';
import Landing from'./pages/Landing';import Auth from'./pages/Auth';import Game from'./pages/Game';
import Garage from'./pages/Garage';import Profile from'./pages/Profile';import Leaderboard from'./pages/Leaderboard';
import Layout from'./components/Layout';
function Guard({children}){const{token}=useAuthStore();return token?children:<Navigate to="/auth" replace/>;}
export default function App(){
  return(<BrowserRouter><Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/auth" element={<Auth/>}/>
    <Route path="/" element={<Guard><Layout/></Guard>}>
      <Route path="game" element={<Game/>}/>
      <Route path="garage" element={<Garage/>}/>
      <Route path="profile" element={<Profile/>}/>
      <Route path="leaderboard" element={<Leaderboard/>}/>
    </Route>
  </Routes></BrowserRouter>);
}
