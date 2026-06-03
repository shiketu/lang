import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { BlobRef, BlobStorageProvider } from "./interfaces";

export class S3BlobStorage implements BlobStorageProvider {
  private client: S3Client;

  constructor(
    private bucket: string,
    region: string,
    private prefix?: string
  ) {
    // Credentials come from the standard env vars
    // (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION).
    this.client = new S3Client({ region });
  }

  private k(key: string): string {
    return this.prefix ? `${this.prefix}/${key}` : key;
  }

  async put(key: string, data: Buffer, contentType: string): Promise<BlobRef> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.k(key),
        Body: data,
        ContentType: contentType,
      })
    );
    return { key, size: data.length, contentType };
  }

  async get(
    key: string
  ): Promise<{ data: Buffer; contentType: string } | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: this.k(key) })
      );
      if (!res.Body) return null;
      const bytes = await res.Body.transformToByteArray();
      return {
        data: Buffer.from(bytes),
        contentType: res.ContentType ?? "application/octet-stream",
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: this.k(key) })
      );
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: this.k(key) })
      );
      return true;
    } catch {
      return false;
    }
  }

  // Not used for serving (videos go through createSignedUrl); kept for interface parity.
  getUrl(key: string): string {
    return this.k(key);
  }

  async createSignedUrl(key: string, expiresIn: number): Promise<string | null> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: this.k(key) }),
      { expiresIn }
    );
  }
}
