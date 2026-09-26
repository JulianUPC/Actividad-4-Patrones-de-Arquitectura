import { suscribir, EVENTOS } from './BusEventos.js'
import { notificaciones } from '../services/notificaciones.js'

// Suscriptor independiente: escucha el evento y envía la notificación.
// Se registra UNA sola vez al arrancar la app (main.jsx).
export function registrarNotificacionesSubscriber() {
  return suscribir(EVENTOS.ENVIO_PROGRAMADO, async ({ cliente }) => {
    try {
      await notificaciones.confirmar(cliente)
    } catch (err) {
      console.error('No se pudo enviar la notificación:', err)
    }
  })
}