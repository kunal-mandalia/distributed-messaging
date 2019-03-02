
// eslint-disable-next-line no-undef
const ws = new WebSocket('ws://localhost:8904/')

ws.onopen = function (event) {
  ws.send("Here's some text that the server is urgently awaiting!")
}

ws.onmessage = function (event) {
  console.log(`message received`, JSON.stringify(event.data))
}
