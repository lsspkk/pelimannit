import mongoose from "mongoose";

// const readyStates = {
//   disconnected: 0,
//   connected: 1,
//   connecting: 2,
//   disconnecting: 3,
// }

let pendingPromise = null;

export const dbConnect = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (pendingPromise) {
    await pendingPromise;
    return;
  }
  console.log("mongourl", process.env.MONGODB_URI);
  pendingPromise = mongoose.connect(process.env.MONGODB_URI, {});
  try {
    await pendingPromise;
  } finally {
    pendingPromise = null;
  }
};
