function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const PROBABILIDAD_FALLA_POR_DEFECTO = 0.4 //aca coloque 0.4 para que falle el 40% de las veces, esto se puede modificar para que falle mas o menos veces.

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