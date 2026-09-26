function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// coloque 0.3 lo que significa que falla 3 de cada 10 veces,para pruebas manuales se puede cambiar
const PROBABILIDAD_FALLA_POR_DEFECTO = 0.3

export const inventario = {
  async reservar(items) {
    await delay(300)
    const probabilidad = globalThis.PROBABILIDAD_FALLA ?? PROBABILIDAD_FALLA_POR_DEFECTO
    if (Math.random() < probabilidad) {
      throw new Error('Inventario no disponible')
    }
    return { reservado: true, items }
  },
}