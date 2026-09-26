Actividad Individual Estudiante: <Julian_Alexander_Santos_Montero>

## Cómo ejecutar
```bash
npm install
npm run dev
```
Abrir `http://localhost:5173`.

## Qué se implementó
**En clase**
- **Adapter** (`services/pagos/AdapterPasarelaY.js`): adapta SdkPasarelaY (centavos, rechaza la promesa) al contrato `IPago`.
- **Facade** (`patterns/FachadaPedidos.js`): orquesta inventario → pago → envío → evento; corta si el pago falla.
- **MVVM** (`viewmodel/usePedidosViewModel.js` + `components/OrdersView.jsx`): lógica en el ViewModel, Vista pura.

**Tarea**
- **Retry** (`patterns/retry.js`): reintentos con backoff exponencial.
- **Circuit Breaker** (`patterns/CircuitBreaker.js`): CERRADO / ABIERTO / SEMI-ABIERTO. Aplicado a `inventario.reservar` (retry por fuera, breaker por dentro). La UI muestra "Inventario no disponible, intenta más tarde" con el circuito abierto.
- **Eventos** (`patterns/eventBus.js`, `patterns/notificacionesSubscriber.js`): la Fachada publica `pedido:envio-programado`; el suscriptor (registrado en `main.jsx`) envía la notificación. La Fachada no importa `notificaciones.js`.

## Cómo probar el Circuit Breaker
`inventario.reservar` falla ~30 % de las veces. Para forzarlo desde la consola del navegador:
1. `window.PROBABILIDAD_FALLA = 1` → enviar 2 pedidos (el circuito se abre).
2. Esperar 5 s y `window.PROBABILIDAD_FALLA = 0` → enviar un pedido (SEMI-ABIERTO → CERRADO).
Las transiciones se ven en la consola (`[CircuitBreaker] ...`).