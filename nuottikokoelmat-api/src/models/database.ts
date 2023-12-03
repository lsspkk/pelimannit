import { FastifyInstance } from "fastify";
import { FastifyPluginAsync } from "fastify";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

export const databaseConnection: FastifyPluginAsync = async (
  fastify: FastifyInstance,
) => {
  try {
    mongoose.connection.on("connected", () => {
      fastify.log.info({ actor: "MongoDB" }, "connected");
    });
    mongoose.connection.on("disconnected", () => {
      fastify.log.error({ actor: "MongoDB" }, "disconnected");
    });
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }
    await mongoose.connect(MONGODB_URI, {});
    fastify.decorate("db", {});
  } catch (error) {
    console.error(error);
  }
};

// const readyStates = {
//   disconnected: 0,
//   connected: 1,
//   connecting: 2,
//   disconnecting: 3,
// }

// next js serverless connection, with pending promise to avoid multiple connections
// let pendingPromise: Promise<typeof mongoose> | null = null;

// export const serverlessDbConnect = async (): Promise<void> => {
//   if (mongoose.connection.readyState >= 1) {
//     return;
//   }
//   if (pendingPromise) {
//     await pendingPromise;
//     return;
//   }
//   if (!process.env.MONGODB_URI) {
//     throw new Error("MONGODB_URI is not defined");
//   }
//   pendingPromise = mongoose.connect(process.env.MONGODB_URI, {});
//   try {
//     await pendingPromise;
//   } finally {
//     pendingPromise = null;
//   }
// };
