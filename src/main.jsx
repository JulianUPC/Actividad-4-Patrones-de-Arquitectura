import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { registrarNotificacionesSubscriber } from './patterns/notificacionesSubscribir.js'
import './styles.css'

// Se registra UNA sola vez, al arrancar (fuera de cualquier componente).
registrarNotificacionesSubscriber()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)