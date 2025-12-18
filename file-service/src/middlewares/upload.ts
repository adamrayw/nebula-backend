import { s3 } from "../config/s3";
import multer from "multer";
import multers3 from 'multer-s3';

const upload = multer({
    storage: multers3({
        s3: s3,
        bucket: 'filemangementapp',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, 'uploads/' + file.originalname);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // MAX 10 MB
    }
}).single('file');

export default upload;