export const ESTADO = {
  CERRADO: 'CERRADO',
  ABIERTO: 'ABIERTO',
  SEMI_ABIERTO: 'SEMI_ABIERTO',
}

export class CircuitoAbiertoError extends Error {
  constructor(mensaje = 'Inventario no disponible, intenta más tarde') {
    super(mensaje)
    this.name = 'CircuitoAbiertoError'
  }
}

export class CircuitBreaker {
  constructor({ umbralFallos = 3, tiempoEsperaMs = 5000 } = {}) {
    this.umbralFallos = umbralFallos
    this.tiempoEsperaMs = tiempoEsperaMs
    this.estado = ESTADO.CERRADO
    this.fallos = 0
    this.abiertoDesde = null
  }

  async ejecutar(fn) {
    if (this.estado === ESTADO.ABIERTO) {
      const yaPasoElTiempo = Date.now() - this.abiertoDesde >= this.tiempoEsperaMs
      if (!yaPasoElTiempo) {
        throw new CircuitoAbiertoError()
      }
      this.cambiarEstado(ESTADO.SEMI_ABIERTO)
    }

    try {
      const resultado = await fn()
      this.registrarExito()
      return resultado
    } catch (err) {
      this.registrarFallo()
      throw err
    }
  }

  registrarExito() {
    this.fallos = 0
    if (this.estado === ESTADO.SEMI_ABIERTO) {
      this.cambiarEstado(ESTADO.CERRADO)
    }
  }

  registrarFallo() {
    if (this.estado === ESTADO.SEMI_ABIERTO) {
      this.abrir()
      return
    }
    this.fallos += 1
    if (this.fallos >= this.umbralFallos) {
      this.abrir()
    }
  }

  abrir() {
    this.abiertoDesde = Date.now()
    this.cambiarEstado(ESTADO.ABIERTO)
  }

  cambiarEstado(nuevo) {
    console.info(`[CircuitBreaker] ${this.estado} → ${nuevo}`)
    this.estado = nuevo
  }
}