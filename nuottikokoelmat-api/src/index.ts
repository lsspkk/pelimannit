import "dotenv/config";
import Fastify from "fastify";
import { archiveRoutes } from "./api/archiveRoutes";
import { databaseConnection } from "./models/database";

const fastify = Fastify({
  logger: true,
});

fastify.register(archiveRoutes);
fastify.register(databaseConnection);

fastify.get("/health", async () => ({ server: "up" }));
const PORT = process.env.FASTIFY_PORT ? process.env.FASTIFY_PORT : 5000;

const start = async () => {
  try {
    await fastify.listen(PORT, "0.0.0.0");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
