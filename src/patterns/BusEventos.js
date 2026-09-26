// Bus de eventos mínimo (pub/sub) sobre EventTarget/CustomEvent nativos.
const bus = new EventTarget()

export const EVENTOS = {
  ENVIO_PROGRAMADO: 'pedido:envio-programado',
}

export function publicar(tipo, detalle) {
  bus.dispatchEvent(new CustomEvent(tipo, { detail: detalle }))
}

// Devuelve una función para cancelar la suscripción.
export function suscribir(tipo, manejador) {
  const listener = (evento) => manejador(evento.detail)
  bus.addEventListener(tipo, listener)
  return () => bus.removeEventListener(tipo, listener)
}