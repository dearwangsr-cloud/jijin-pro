<div className="card top">
  <h3>预计每月总定投</h3>
  <h1>¥{total.toFixed(0)}</h1>
  <div>{count}支基金 / {data.length}类</div>
</div>
import React,{useEffect,useMemo,useState} from 'react';
import {PieChart,Pie,Cell,Tooltip,ResponsiveContainer,BarChart,Bar,XAxis,YAxis} from 'recharts';
const COLORS=['#2563eb','#16a34a','#f59e0b','#dc2626','#7c3aed'];
const load=()=>JSON.parse(localStorage.getItem('fundManagerData')||'[]');
const mf=f=>f.cycle==='日'?+f.amount*22:f.cycle==='周'?+f.amount*4:+f.amount;
const mt=t=>(t.funds||[]).reduce((s,f)=>s+mf(f),0);
export default function(){
const [data,setData]=useState(load());
const [name,setName]=useState('');
useEffect(()=>localStorage.setItem('fundManagerData',JSON.stringify(data)),[data]);
const total=useMemo(()=>data.reduce((s,t)=>s+mt(t),0),[data]);
const count=useMemo(()=>data.reduce((s,t)=>s+t.funds.length,0),[data]);
const pie=data.map((t,i)=>({name:t.name,value:mt(t),fill:COLORS[i%COLORS.length]})).filter(x=>x.value>0);
const addType=()=>{if(!name)return;setData([...data,{id:Date.now(),name,funds:[]}]);setName('')};
const addFund=id=>{const n=prompt('基金名');if(!n)return;setData(data.map(t=>t.id===id?{...t,funds:[...t.funds,{id:Date.now(),name:n,amount:500,cycle:'月'}]}:t))};
return <div className='wrap'>
<div className='card' style={{background:'linear-gradient(135deg,#2563eb,#60a5fa)',color:'#fff',marginBottom:16}}>
<h3>预计每月总定投</h3><h1>¥{total.toFixed(0)}</h1><div>{count}支基金 / {data.length}类</div></div>
<div className='grid'>
<div className='card'><h3>分类占比</h3><div style={{height:260}}><ResponsiveContainer><PieChart><Pie data={pie} dataKey='value'>{pie.map((p,i)=><Cell key={i} fill={p.fill}/> )}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></div>
<div className='card'><h3>月定投</h3><div style={{height:260}}><ResponsiveContainer><BarChart data={pie}><XAxis dataKey='name'/><YAxis/><Tooltip/><Bar dataKey='value'/></BarChart></ResponsiveContainer></div></div>
</div>
<div className='card' style={{marginTop:16}}><input value={name} onChange={e=>setName(e.target.value)} placeholder='新增类型'/><button className='primary' onClick={addType}>新增类型</button></div>
{data.map(t=><div className='card' style={{marginTop:16}} key={t.id}><b>{t.name}</b> ¥{mt(t).toFixed(0)}/月 <button className='primary' onClick={()=>addFund(t.id)}>+基金</button>{t.funds.map(f=><div key={f.id}>{f.name} ¥{f.amount}/{f.cycle}</div>)}</div>)}
</div>
}
