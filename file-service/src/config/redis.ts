import { createClient } from "redis";

interface RedisClient extends ReturnType<typeof createClient> {}

let redisClient: RedisClient | undefined;

export async function initializeRedisClient() {
  if (redisClient) {
    console.log("⚠️ Redis client is already initialized.");
    return redisClient; // Reuse client jika sudah ada
  }

  const redisURL = process.env.REDIS_URI;
  if (!redisURL) {
    console.warn("❌ No Redis URI found, skipping Redis initialization.");
    return;
  }

  redisClient = createClient({
    url: redisURL,
    socket: {
      keepAlive: 30000, // Keep connection alive for 30 seconds
      reconnectStrategy: (times: number) => Math.min(times * 50, 2000), // Exponential backoff
    },
  });

  redisClient.on("error", (error) => {
    console.error("❌ Redis connection error:", error);
  });

  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis!");
    return redisClient;
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    redisClient = undefined; // Reset client jika gagal
  }
}

// Function to safely close Redis connection when needed
export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    console.log("🛑 Redis connection closed.");
    redisClient = undefined;
  }
}

// Function to check Redis connection status
export function isRedisWorking(): boolean {
  return redisClient?.isOpen || false;
}

// Export client for direct access
export { redisClient };
