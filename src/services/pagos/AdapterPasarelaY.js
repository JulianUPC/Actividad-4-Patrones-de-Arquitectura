import { Resultado } from './IPago.js'
import { SdkPasarelaY } from './SdkPasarelaY.js'

/**
 * EJERCICIO 1 — Adapter
 * Adapta SdkPasarelaY (charge(centavos, opts), rechaza la promesa) a la
 * interfaz común IPago (procesar(monto) -> Resultado).
 */
export class AdapterPasarelaY {
  constructor(sdk = new SdkPasarelaY()) {
    this.sdk = sdk
  }

  async procesar(monto) {
    try {
      // esta es la unidad que recibe los centavos, ademas coloque un math.round para evita errores de punto flotante
      const centavos = Math.round(monto * 100)
      // aca se hace la llamada al SDK con su interfaz propia 
      const resultado = await this.sdk.charge(centavos, { currency: 'COP' })
      // En caso de exito, se devuelve un resultado con exito=true y el id de transaccion
      return new Resultado(true, resultado.txId)
    } catch (err) {
      // De lo contrario, se devuelve un resultado con exito=false y idTransaccion=null
      return new Resultado(false, null)
    }
  }
}