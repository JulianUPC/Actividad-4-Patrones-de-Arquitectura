import express from 'express'

//servicio simulado 1: Catalogo (puerto 4001)
const catalogo = express()
catalogo.use(express.json())
catalogo.post('/reservar', (req, res) => {
  const { items = [] } = req.body
  res.json({ reservado: true, items })
})
catalogo.listen(4001, () => console.log('Catálogo en http://localhost:4001'))

//servicio simulado 2: Pagos (puerto 4002)
const pagos = express()
pagos.use(express.json())
pagos.post('/cobrar', (req, res) => {
  const { monto } = req.body
  if (!(monto > 0)) return res.status(400).json({ exito: false, error: 'Monto inválido' })
  res.json({ exito: true, idTransaccion: `PAY-${Date.now()}` })
})
pagos.listen(4002, () => console.log('Pagos en http://localhost:4002'))

//API Gateway (puerto 4000): punto de entrada unico
const gateway = express()
gateway.use(express.json())

async function llamar(url, cuerpo) {
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  return { status: respuesta.status, datos: await respuesta.json() }
}

gateway.post('/pedidos', async (req, res) => {
  const { cliente, items, total } = req.body
  try {
    const inventario = await llamar('http://localhost:4001/reservar', { items })
    const pago = await llamar('http://localhost:4002/cobrar', { monto: total })
    if (pago.status !== 200) return res.status(402).json({ cliente, pago: pago.datos })
    res.status(201).json({ cliente, inventario: inventario.datos, pago: pago.datos })
  } catch (err) {
    res.status(502).json({ error: 'Servicio interno no disponible', detalle: err.message })
  }
})

gateway.listen(4000, () => console.log('API Gateway en http://localhost:4000'))