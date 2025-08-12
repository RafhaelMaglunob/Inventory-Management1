export default async function inventoryRoutes(fastify) {
  const admin = fastify.firebase;
  const db = admin.firestore();
  const inventoryCollection = db.collection('Inventory');

  const inventorySchema = {
    body: {
      type: 'object',
      required: ['name', 'quantity', 'category', 'price', 'supplierId'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string', minLength: 1 },
        quantity: { type: 'integer', minimum: 0 },
        category: { type: 'string', minLength: 1 },
        price: { type: 'number', minimum: 0 },
        supplierId: { type: 'string', minLength: 1 },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  };

  // Get all inventory, optionally filter by supplierId
  fastify.get('/inventory', async (req, reply) => {
    try {
      let query = inventoryCollection;
      if (req.query.supplier) {
        query = query.where('supplierId', '==', req.query.supplier);
      }
      const snapshot = await query.get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      reply.send({ success: true, data: items });
    } catch (error) {
      reply.status(500).send({ success: false, message: error.message });
    }
  });

  // Add or update inventory item
  fastify.post('/inventory', { schema: inventorySchema }, async (req, reply) => {
    try {
      const { id, name, category, price, quantity, supplierId } = req.body;

      // Check if item with same name, price, supplierId exists
      const snapshot = await inventoryCollection
        .where('name', '==', name)
        .where('price', '==', price)
        .where('supplierId', '==', supplierId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        // Exists: update quantity by adding
        const doc = snapshot.docs[0];
        const existing = doc.data();
        const newQuantity = existing.quantity + quantity;

        await inventoryCollection.doc(doc.id).update({
          quantity: newQuantity,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return reply.send({ success: true, message: 'Quantity updated', id: doc.id });
      }

      // New item
      const now = admin.firestore.FieldValue.serverTimestamp();

      if (id) {
        await inventoryCollection.doc(id).set({
          name, category, price, quantity, supplierId,
          updatedAt: now
        });
        return reply.status(201).send({ success: true, id, name, category, price, quantity, supplierId });
      } else {
        const docRef = await inventoryCollection.add({
          name, category, price, quantity, supplierId,
          updatedAt: now
        });
        return reply.status(201).send({ success: true, id: docRef.id, name, category, price, quantity, supplierId });
      }
    } catch (error) {
      reply.status(500).send({ success: false, message: error.message });
    }
  });
}
