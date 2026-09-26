function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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