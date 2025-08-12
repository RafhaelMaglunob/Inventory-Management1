// transactionRoutes.js
export default async function transactionRoutes(fastify, opts) {
    const transactionSchema = {
        body: {
            type: 'object',
            required: ['id', 'type', 'items', 'totalAmount'],
            properties: {
                id: { type: 'string', minLength: 1 },
                type: { type: 'string', enum: ['sale', 'purchase', 'adjustment'] },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['itemId', 'quantity', 'price'],
                        properties: {
                            itemId: { type: 'string' },
                            quantity: { type: 'integer', minimum: 1 },
                            price: { type: 'number', minimum: 0 }
                        }
                    }
                },
                totalAmount: { type: 'number', minimum: 0 },
                date: { type: 'string', format: 'date-time' }
            }
        }
    };

    fastify.get('/transactions', async (req, reply) => {
        try {
            reply.send({ success: true, data: [] });
        } catch (err) {
            reply.status(500).send({ success: false, message: err.message });
        }
    });

    fastify.get('/transactions/:id', async (req, reply) => {
        try {
            reply.send({ success: true, data: { id: req.params.id } });
        } catch (err) {
            reply.status(500).send({ success: false, message: err.message });
        }
    });

    fastify.post('/transactions', { schema: transactionSchema }, async (req, reply) => {
        try {
            reply.status(201).send({ success: true, data: req.body });
        } catch (err) {
            reply.status(500).send({ success: false, message: err.message });
        }
    });
}
