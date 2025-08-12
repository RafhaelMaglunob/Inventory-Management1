export default async function supplierRoutes(fastify) {
    const db = fastify.firebase.firestore();
    const supplierCollection = db.collection('Supplier');  // singular here

    const supplierSchema = {
        body: {
            type: 'object',
            required: ['name'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string', minLength: 1 }
            }
        }
    };

    // GET all suppliers
    fastify.get('/suppliers', async (req, reply) => {
        try {
            const snapshot = await supplierCollection.get();
            const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return reply.send({ success: true, data: suppliers });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // POST new or update existing supplier
    fastify.post('/suppliers', { schema: supplierSchema }, async (req, reply) => {
        try {
            let { id, name } = req.body;
            name = name.trim();

            // Check for duplicates
            const duplicateQuery = await supplierCollection.where('name', '==', name).get();

            if (!duplicateQuery.empty) {
                const existingSupplier = duplicateQuery.docs[0];
                if (!id || existingSupplier.id !== id) {
                    return reply.status(409).send({
                        success: false,
                        message: 'Supplier with this name already exists'
                    });
                }
            }

            if (id) {
                // Update existing supplier
                const docRef = supplierCollection.doc(id);
                const docSnapshot = await docRef.get();
                if (!docSnapshot.exists) {
                    return reply.status(404).send({
                        success: false,
                        message: `Supplier with id ${id} not found`
                    });
                }
                await docRef.update({ name });
                return reply.send({ success: true, id, name });
            } else {
                // Create new supplier
                const docRef = await supplierCollection.add({ name });
                return reply.status(201).send({ success: true, id: docRef.id, name });
            }
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });

    // DELETE supplier by ID
    fastify.delete('/suppliers/:id', async (req, reply) => {
        try {
            const { id } = req.params;

            const docRef = supplierCollection.doc(id);
            const docSnapshot = await docRef.get();
            if (!docSnapshot.exists) {
                return reply.status(404).send({
                    success: false,
                    message: `Supplier with id ${id} not found`
                });
            }

            await docRef.delete();
            return reply.send({ success: true, message: `Supplier ${id} deleted` });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    });
}
