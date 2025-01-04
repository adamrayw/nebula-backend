import { S3Client } from "@aws-sdk/client-s3";
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";
import multer from "multer";
import multers3 from 'multer-s3';

const s3 = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: "AKIAU6VTTGT7PXD3SK6N",
        secretAccessKey: "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",
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 300000,
        socketTimeout: 300000
    }),
});

const upload = multer({
    storage: multers3({
        s3: s3,
        bucket: 'filemangementapp',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, 'uploads/' + Date.now() + '_' + file.originalname);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // MAX 10 MB
    }
}).single('file');

export default upload;