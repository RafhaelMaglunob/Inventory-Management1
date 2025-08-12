import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export default async function categoryRoutes(fastify) {
  const db = fastify.firebase.firestore();
  const collection = db.collection('Categories');

  // Schema for creating category (no id required)
  const createCategorySchema = {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' }
      }
    }
  };

  // Schema for updating category (id in params, body has name and description)
  const updateCategorySchema = {
    body: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' }
      }
    },
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', minLength: 1 }
      }
    }
  };

  // GET all categories
  fastify.get('/categories', async (req, reply) => {
    try {
      const snapshot = await collection.get();
      const categories = [];
      snapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      reply.send({ success: true, data: categories });
    } catch (err) {
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  // GET one category by id
  fastify.get('/categories/:id', async (req, reply) => {
    try {
      const { id } = req.params;
      const doc = await collection.doc(id).get();
      if (!doc.exists) {
        return reply.status(404).send({ success: false, message: 'Category not found' });
      }
      reply.send({ success: true, data: { id: doc.id, ...doc.data() } });
    } catch (err) {
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  // POST create new category (auto-generated id)
  fastify.post('/categories', { schema: createCategorySchema }, async (req, reply) => {
    try {
      const { name, description } = req.body;
      const now = Timestamp.now();

      const docRef = await collection.add({
        name,
        description: description || '',
        createdAt: now,
        updatedAt: now
      });

      reply.status(201).send({
        success: true,
        data: { id: docRef.id, name, description }
      });
    } catch (err) {
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  // PUT update category by id
  fastify.put('/categories/:id', { schema: updateCategorySchema }, async (req, reply) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const docRef = collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return reply.status(404).send({ success: false, message: 'Category not found' });
      }

      await docRef.update({
        name,
        description: description || '',
        updatedAt: Timestamp.now()
      });

      reply.send({ success: true, data: { id, name, description } });
    } catch (err) {
      reply.status(500).send({ success: false, message: err.message });
    }
  });

  // DELETE category by id
  fastify.delete('/categories/:id', async (req, reply) => {
    try {
      const { id } = req.params;

      const docRef = collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return reply.status(404).send({ success: false, message: 'Category not found' });
      }

      await docRef.delete();

      reply.send({ success: true, message: `Category ${id} deleted` });
    } catch (err) {
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}
