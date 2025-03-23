import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

export const s3 = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 300000,
        socketTimeout: 300000
    }),
});

export const deleteObject = async (key: string) => {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: "filemangementapp",
      Key: key, // kayes_note.txt
    });
  
    try {
      const response = await s3.send(deleteCommand);
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };