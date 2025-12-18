import { NextFunction, Request, Response } from "express";
import { redisClient } from "../config/redis";
import { StatusCodes } from "http-status-codes";

export async function cachingMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = typeof req?.user === "object" && "id" in req.user ? req.user.id : undefined;
        if (!userId) {
            console.log("❌ User ID not found, skipping cache");
            return next();
        }

        const offsetQuery = req.query.offset ?? "";
        const searchQuery = req.query.s ?? "";
        const sortBy = req.query.sortBy ?? "createdAt";
        const sortOrder = req.query.sortOrder ?? "DESC";

        // Jika ada filter sortBy, sortOrder, searchQuery, atau offsetQuery, skip cache
        // if (sortBy !== "createdBy" || sortOrder !== "DESC"|| searchQuery || offsetQuery !== "0") {
        //     return next();
        // }

        
        // Format key 
        const redisKey = `files@${userId}&s=${searchQuery}&offset=${offsetQuery}&sortBy=${sortBy}&orderBy=${sortOrder}`;

        console.log(`🔍 Checking cache for key: ${redisKey}`);

        // Cek apakah data ada di cache
        const cachedData = await redisClient?.get(redisKey);
        if (cachedData) {
            console.log("🚀 Data found in cache, returning cached data");
            
            // Set header untuk mencegah browser cache
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            
            return res.status(StatusCodes.OK).json(JSON.parse(cachedData));
        }

        console.log("🔍 Data not found in cache, fetching from database...");
        
        // Middleware tidak mengembalikan response, jadi lanjut ke controller
        next();

        // Setelah controller mengembalikan response, simpan ke Redis
        res.on("finish", async () => {
            if (res.statusCode === 200) {
                console.log("💾 Storing response data in cache...");
                const responseData = res.locals.data; // Pastikan controller menyimpan data ke res.locals.data

                if (responseData) {
                    await redisClient?.set(redisKey, JSON.stringify(responseData), { EX: 600000 }); // Simpan selama 10 menit
                    console.log("✔  Data stored in cache");
                }
            }
        });

    } catch (error) {
        console.error("🚨 Error in caching middleware:", error);
        next(); // Pastikan request tetap dilanjutkan jika terjadi error
    }
}

export async function writeCache(req: Request, res: Response, next: NextFunction) {
    const userId = typeof req?.user === "object" && "id" in req.user ? req.user.id : undefined;
    const offset = req.query.offset as string;

    let pattern = ``;

    if (req.path.startsWith('/file/undoTrash') || req.path.startsWith('/file/starredFiles')) {
        pattern = `files@${userId}*`
    } else if (req.path.startsWith('/file/deleteFile')) {
        pattern = `files@${userId}?search=*?offset=${offset}?*`
    }

    let cursor = 0;
    let keys: string[] = [];

    try {
        do {
            const result = await redisClient?.scan(cursor, {
                MATCH: pattern,
                COUNT: 1000,
            });

            cursor = result?.cursor ?? 0;

            if (result?.keys) {
                keys.push(...result.keys);
            }
        } while (cursor !== 0);

        if (keys.length > 0) {
            const deleteData = await redisClient?.del(keys);
            console.log("🚀 Data files deleted: ", deleteData);
        } else {
            console.log(`🤷 No cache keys for user ${userId}`);
        }
    } catch (error) {
        console.error("🚨 Error deleting cache: ", error);
    }

    next();
}