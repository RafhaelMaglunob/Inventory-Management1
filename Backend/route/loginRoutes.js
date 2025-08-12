export default async function loginRoutes(fastify, opts) {
  const accountSchema = {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" }  // No pattern or minLength here
      },
      additionalProperties: false
    }
  };

  fastify.post('/login', { schema: accountSchema }, async (req, reply) => {
    try {
      const { email, password } = req.body;
      const db = fastify.firebase.firestore();

      const adminQuery = await db.collection('AdminAccount')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (adminQuery.empty) {
        return reply.status(401).send({ success: false, message: 'Invalid credentials' });
      }

      const adminDoc = adminQuery.docs[0].data();

      if (adminDoc.password !== password) {
        return reply.status(401).send({ success: false, message: 'Invalid credentials' });
      }

      const token = await fastify.firebase.auth().createCustomToken(adminQuery.docs[0].id);

      return reply.send({
        success: true,
        message: 'Login successful',
        token
      });

    } catch (err) {
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}
