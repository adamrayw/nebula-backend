import { createClient } from "redis";
import hash from "object-hash";
import { NextFunction, Request, Response } from "express";

interface RedisClient extends ReturnType<typeof createClient> { }

let redisClient: RedisClient | undefined = undefined;

export async function initializeRedisClient() {
  // read the redis connection
  let redisURL = process.env.REDIS_URI;
  if (redisURL) {
    // create redis client
    redisClient = createClient({
      url: redisURL,
    }).on("error", (e: any) => {
      console.error(`Failed to create the Redis client with error : `);
      console.error(e);
    });

    try {
      await redisClient.connect();
      console.log("Redis connected successfully!");
    } catch (error) {
      console.error(`Connection to Redis failed with Error: `);
      console.error(error);
    }
  }
}

function requestToKey(req: Request) {
  const userId = typeof req.user !== "string" ? req.user?.id : undefined;
  if (req.path.startsWith('/file/getFiles') && req.query.s === '' && req.query.offset === '0') {
    return `${req.path}?offset=${req.query.offset}@${userId}`;
  } else if (req.path.startsWith('/file/starredFiles')) {
    return `${req.path}@${userId}`;
  }
}

function isRedisWorking() {
  // verify wheter there is an active connection
  // to a Redis server or not
  return !!redisClient?.isOpen;
}

async function writeData(key: any, data: any, options: any) {
  if (isRedisWorking()) {
    try {
      // write data to the Redis cache
      await redisClient?.set(key, data, options);
    } catch (e) {
      console.error(`Failed to cache data for key=${key}`, e);
    }
  }
}

async function readData(keys: string[]) {
  let cachedValue: string[] = [];

  if (isRedisWorking()) {
    // try to get the cached response from redis
    return await Promise.all(
      keys.map(async (key: string) => {
        try {
          return await redisClient?.get(key);
        } catch (e) {
          console.error(`Failed to delete key=${key}`, e);
        }
      })
    );
  }

  return cachedValue
}

async function deleteData(keys: string[]) {
  let cachedValue = undefined;

  if (isRedisWorking()) {
    await Promise.all(
      keys.map(async (key: string) => {
        try {
          const statusDelete = await redisClient?.del(key);
        } catch (e) {
          console.error(`Failed to delete key=${key}`, e);
        }
      })
    );
  }

  return cachedValue;
}

export function redisCachingMiddleware(
  options = {
    EX: 21600, // 6h
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (isRedisWorking()) {
      const keys: string[] = [];
      const key = requestToKey(req);

      if (key) {
        keys.push(key);
      }

      // if there is some cached data, retrieve it and return it
      const cachedValue = await readData(keys);

      if (cachedValue.length > 0 && cachedValue[0]) {
        try {
          // if it is JSON data, then return it
          res.json(JSON.parse(cachedValue[0]));
        } catch {
          // if it is not JSON data, then return it
          res.send(cachedValue[0]);
        }
      } else {
        // override how res.send behaves
        // to introduce the caching logic
        const oldSend = res.send;
        res.send = function (data) {
          // set the function back to avoid the 'double-send' effect
          res.send = oldSend;

          // cache the response only if it is successful
          if (res.statusCode.toString().startsWith("2")) {
            writeData(key, data, options).then();
          }

          return res.send(data);
        };

        next();
      }
    } else {
      next();
    }
  };
}

export function writeThought() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (isRedisWorking()) {
      const userId = typeof req.user !== "string" ? req.user?.id : undefined;
      const offset = req.query.offset;

      // menyimpan key yang akan dihapus
      let key: string[] = [];

      if (
        req.path === "/file/uploadFile" ||
        req.path.startsWith("/file/deleteFile") ||
        req.path.startsWith("/file/starred")
      ) {
        key.push(`/file/getFiles?offset=${offset}@${userId}`);
        key.push(`/file/starredFiles?offset=${offset}@${userId}`);
      } else {
        key.push(`/user/getUserInfo@${userId}`);
      }

      // Membaca data yang sudah di cache
      const cachedData = await readData(key);

      // Jika cachedData true, lakukan operasi delete key
      if (cachedData) {
        await deleteData(key);

        redisCachingMiddleware();

        return next();
      }
    }

    next();
  };
}
