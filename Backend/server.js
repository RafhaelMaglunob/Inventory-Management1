import Fastify from "fastify";
import cors from "@fastify/cors";
import admin from "firebase-admin";
import websocket from "@fastify/websocket";
import CategoryRoutes from "./route/categoryRoutes.js";
import InventoryRoutes from "./route/inventoryRoutes.js";
import LoginRoutes from "./route/loginRoutes.js";
import SupplierRoutes from './route/supplierRoutes.js';
import TransactionRoutes from "./route/transactionRoutes.js";
import WebsocketRoutes from "./route/websocketRoutes.js";
import CreateAdminAccount from "./route/createAdminRoutes.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const fastify = Fastify({ logger: true });

fastify.decorate('firebase', admin);

const start = async () => {
  try {
    await fastify.register(websocket);
    await fastify.register(cors, {
      origin: true,
      credentials: true
    });

    await fastify.register(CategoryRoutes, {prefix: '/api'});
    await fastify.register(InventoryRoutes, {prefix: '/api'});
    await fastify.register(LoginRoutes);
    await fastify.register(SupplierRoutes, { prefix: '/api' });
    await fastify.register(TransactionRoutes, {prefix: '/api'});
    await fastify.register(CreateAdminAccount, {prefix: '/api'});
    await fastify.register(WebsocketRoutes);

    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
    
  }
};

start();
