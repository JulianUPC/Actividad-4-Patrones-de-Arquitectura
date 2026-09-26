import { inventario } from '../services/inventario.js'
import { envios } from '../services/envios.js'
import { retry } from './intentos.js'
import { CircuitBreaker, CircuitoAbiertoError } from './Interruptor.js'
import { publicar, EVENTOS } from './BusEventos.js'

// El breaker vive a nivel de módulo (UNA sola instancia compartida):
// el ViewModel crea una Fachada nueva en cada envío, y si el breaker
// se creara dentro del constructor perdería su estado cada vez.
const breakerInventario = new CircuitBreaker({ umbralFallos: 3, tiempoEsperaMs: 5000 })

/**
 * Orquesta, en orden: inventario (con retry + circuit breaker) → pago →
 * envío → evento "envío programado" (un suscriptor se encarga del aviso).
 */
export class FachadaPedidos {
  constructor(pago) {
    this.pago = pago // instancia de IPago: AdapterPasarelaX o AdapterPasarelaY
  }

  async procesarPedido(pedido) {
    // 1. Inventario protegido: retry por fuera, breaker por dentro.
    //    Cada intento pasa por el breaker (así cuenta los fallos) y, si el
    //    circuito ya está ABIERTO, retry no insiste: falla de inmediato.
    await retry(
      () => breakerInventario.ejecutar(() => inventario.reservar(pedido.items)),
      {
        intentos: 3,
        esperaMs: 200,
        debeReintentar: (err) => !(err instanceof CircuitoAbiertoError),
      },
    )

    // 2. Pago con el Adapter inyectado
    const resultado = await this.pago.procesar(pedido.total)
    if (!resultado.exito) {
      throw new Error('El pago fue rechazado. El pedido no se procesó.')
    }

    // 3. Envío
    await envios.programar(pedido.direccion)

    // 4. En vez de llamar directamente al servicio de avisos, se publica un evento
    publicar(EVENTOS.ENVIO_PROGRAMADO, {
      cliente: pedido.cliente,
      direccion: pedido.direccion,
      idTransaccion: resultado.idTransaccion,
    })
  }
}