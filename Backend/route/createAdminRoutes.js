export default async function createAdminRoutes(fastify) {
  const adminSchema = {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: {
          type: "string",
          minLength: 6,
          pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|:;\"'<>,.?/]).+$"
        }
      },
      additionalProperties: false
    }
  };

  fastify.post('/create-admin', { schema: adminSchema }, async (req, reply) => {
    try {
      const { email, password } = req.body;
      const db = fastify.firebase.firestore();

      // Check if email already exists
      const existing = await db.collection('AdminAccount').where('email', '==', email).get();
      if (!existing.empty) {
        return reply.status(409).send({ success: false, message: 'Email already exists' });
      }

      // Save new admin account (password plain text here for demo)
      await db.collection('AdminAccount').add({ email, password });

      return reply.send({ success: true, message: 'Admin account created' });

    } catch (err) {
      reply.status(500).send({ success: false, message: err.message });
    }
  });
}
