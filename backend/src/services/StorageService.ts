import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config";
import { generateId } from "../lib/helpers";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export class StorageService {
  async upload(
    buffer: Buffer,
    contentType: string,
    folder: string
  ): Promise<{ key: string; publicUrl: string }> {
    const ext = contentType.split("/")[1] ?? "bin";
    const key = `${folder}/${generateId()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: config.r2.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return {
      key,
      publicUrl: `${config.r2.publicUrl}/${key}`,
    };
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: config.r2.bucket, Key: key }),
      { expiresIn: expiresInSeconds }
    );
  }

  async delete(key: string): Promise<void> {
    await s3.send(
      new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: key })
    );
  }
}

export const storageService = new StorageService();
