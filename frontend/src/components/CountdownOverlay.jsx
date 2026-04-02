import React,{useState,useEffect}from'react';import{motion,AnimatePresence}from'framer-motion';
export default function CountdownOverlay(){
  const[n,setN]=useState(3);
  useEffect(()=>{if(n<=0)return;const t=setTimeout(()=>setN(c=>c-1),1000);return()=>clearTimeout(t);},[n]);
  const d=n>0?n.toString():'GO!',c=n>0?'var(--red)':'var(--cyan)';
  return(<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
    <AnimatePresence mode="wait">
      <motion.div key={d} initial={{scale:2,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.5,opacity:0}} transition={{duration:.3}}
        style={{fontFamily:'Orbitron',fontSize:120,fontWeight:900,color:c,textShadow:`0 0 40px ${c},0 0 80px ${c}`}}>{d}</motion.div>
    </AnimatePresence>
  </div>);
}
