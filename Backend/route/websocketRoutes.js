export default async function websocketRoutes(fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    // Log connection object without stringify to avoid circular reference error
    fastify.log.info('Raw connection object:', connection);

    const ws = connection.socket;
    if (!ws) {
      fastify.log.error('connection.socket is undefined!');
      return;
    }

    fastify.log.info('Client connected');

    ws.send('Hello from server!');

    ws.on('message', (message) => {
      fastify.log.info('Received: ' + message.toString());
      ws.send(`You said: ${message}`);
    });

    ws.on('close', (code, reason) => {
      const reasonStr = reason ? reason.toString() : '';
      fastify.log.info(`Client disconnected: code=${code}, reason=${reasonStr}`);
    });

    ws.on('error', (error) => {
      fastify.log.error('WebSocket error: ' + error.message);
    });
  });
}
