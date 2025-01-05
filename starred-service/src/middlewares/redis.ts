import { createClient } from "redis";
import hash from 'object-hash';
import { NextFunction, Request, Response } from "express";


interface RedisClient extends ReturnType<typeof createClient> { }

let redisClient: RedisClient | undefined = undefined;

export async function initializeRedisClient() {
    // read the redis connection
    let redisURL = process.env.REDIS_URI;
    if (redisURL) {
        // create redis client
        redisClient = createClient({
            url: redisURL
        }).on("error", (e: any) => {
            console.error(`Failed to create the Redis client with error : `)
            console.error(e)
        })

        try {
            await redisClient.connect();
            console.log('Redis connected successfully!')
        } catch (error) {
            console.error(`Connection to Redis failed with Error: `)
            console.error(error)
        }
    }
}

function requestToKey(req: Request) {
    const userId = typeof req.user !== 'string' ? req.user?.id : undefined;

    return `${req.path}@${userId}`
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

async function readData(key: any) {
    let cachedValue = undefined;
    if (isRedisWorking()) {
        // try to get the cached response from redis
        return await redisClient?.get(key);
    }

    return cachedValue;
}

async function deleteData(key: any) {
    let cachedValue = undefined;

    if (isRedisWorking()) {
        return await redisClient?.del(key);
    }

    return cachedValue;
}

export function redisCachingMiddleware(
    options = {
        EX: 21600, // 6h
    }
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (isRedisWorking() && req.query.s === '' && req.query.offset === "0") {
            const key = requestToKey(req);

            // if there is some cached data, retrieve it and return it
            const cachedValue = await readData(key);

            if (cachedValue) {
                try {
                    // if it is JSON data, then return it
                    res.json(JSON.parse(cachedValue));
                } catch {
                    // if it is not JSON data, then return it
                    res.send(cachedValue);
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
            // membuat custom key, kalau menggunakan requestToKey path akan mengarah ke file/uploadFile
            const userId = typeof req.user !== 'string' ? req.user?.id : undefined;
            let key = undefined
            if (req.path === '/file/uploadFile' || req.path.startsWith('/file/deleteFile')) {
                key = `/file/getFiles@${userId}`
            } else {
                key = `/user/getUserInfo@${userId}`
            }

            const cachedData = await readData(key);

            if (cachedData) {
                // Jika cachedData true, lakukan operasi delete key
                const deleteKey = await deleteData(key)

                redisCachingMiddleware()

                return next();
            }
        }

        next();
    };
}