function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Reintenta fn() ante una falla, con backoff creciente (exponencial):
 * espera esperaMs, luego 2×esperaMs, luego 4×esperaMs...
 *
 * @param {() => Promise<any>} fn
 * @param {{ intentos?: number, esperaMs?: number, debeReintentar?: (err: Error) => boolean }} opciones
 */
export async function retry(fn, { intentos = 3, esperaMs = 200, debeReintentar = () => true } = {}) {
  let ultimoError
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await fn()
    } catch (err) {
      ultimoError = err
      const quedanIntentos = intento < intentos
      if (!quedanIntentos || !debeReintentar(err)) break
      await esperar(esperaMs * 2 ** (intento - 1))
    }
  }
  throw ultimoError
}