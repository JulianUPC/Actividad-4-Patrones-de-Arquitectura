import { useState } from 'react'
import { FachadaPedidos } from '../patterns/FachadaPedidos.js'
import { AdapterPasarelaX } from '../services/pagos/AdapterPasarelaX.js'
import { AdapterPasarelaY } from '../services/pagos/AdapterPasarelaY.js'

const FORM_INICIAL = {
  cliente: '',
  direccion: '',
  itemsText: '',
  total: '',
  pasarela: 'X',
}

/**
 * EJERCICIO 3 — MVVM: ViewModel
 *
 * Devuelve el contrato que consume la Vista:
 * { pedidos, loading, error, form, setField, enviarPedido }
 */
export function usePedidosViewModel() {
  const [pedidos, setPedidos] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function setField(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function enviarPedido(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const adapter =
        form.pasarela === 'X' ? new AdapterPasarelaX() : new AdapterPasarelaY()
      const facade = new FachadaPedidos(adapter)
      const pedido = {
        cliente: form.cliente,
        direccion: form.direccion,
        items: form.itemsText.split(',').map((s) => s.trim()).filter(Boolean),
        total: Number(form.total),
      }
      await facade.procesarPedido(pedido)
      setPedidos((prev) => [
        { ...pedido, pasarela: form.pasarela, procesadoEn: new Date().toLocaleTimeString() },
        ...prev,
      ])
      // Igual que antes del refactor, aca se limpian los campos pero se conserva la pasarela
      setForm((prev) => ({ ...FORM_INICIAL, pasarela: prev.pasarela }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { pedidos, loading, error, form, setField, enviarPedido }
}