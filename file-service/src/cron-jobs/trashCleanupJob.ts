import cron from 'node-cron';
import UploadRespository from '../repositories/FileRepository';

export const startTrashCleanupJob = () => {
    const fileController = new UploadRespository();
    // Run every one minute
    cron.schedule("*/1 * * * *", async () => {
        console.log("🔍 Checking for expired files in trash...");
        await fileController.deleteExpiredFiles();
        console.log("🗑  Trash cleanup completed!");
    });

    console.log("🚀 Trash cleanup job started!");
}