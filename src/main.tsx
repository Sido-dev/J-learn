import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
class Boundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<main className="error-page"><h1>A fresh page might help.</h1><p>Your saved learning is still safe.</p><button onClick={()=>location.reload()}>Reload Sumi</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Boundary><App/></Boundary></React.StrictMode>);

if(import.meta.env.DEV&&new URLSearchParams(location.search).get('qa')==='1')void import('./qa-runner');
