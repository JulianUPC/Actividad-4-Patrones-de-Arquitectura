import { inventario } from '../services/inventario.js'
import { envios } from '../services/envios.js'
import { notificaciones } from '../services/notificaciones.js'
import { retry } from './retry.js'
import { CircuitBreaker, CircuitoAbiertoError } from './CircuitBreaker.js'

const breakerInventario = new CircuitBreaker({ umbralFallos: 3, tiempoEsperaMs: 5000 })

export class FachadaPedidos {
  constructor(pago) {
    this.pago = pago
  }

  async procesarPedido(pedido) {
    await retry(
      () => breakerInventario.ejecutar(() => inventario.reservar(pedido.items)),
      {
        intentos: 3,
        esperaMs: 200,
        debeReintentar: (err) => !(err instanceof CircuitoAbiertoError),
      },
    )

    const resultado = await this.pago.procesar(pedido.total)
    if (!resultado.exito) {
      throw new Error('El pago fue rechazado. El pedido no se procesó.')
    }

    await envios.programar(pedido.direccion)
    await notificaciones.confirmar(pedido.cliente)
  }
}