import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validation";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_URL,
  );
}

let client: S3Client | null = null;
function r2() {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

export type UploadError = "missing" | "type" | "size";

export function validateImage(file: unknown): UploadError | null {
  if (!(file instanceof File) || file.size === 0) return "missing";
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > MAX_UPLOAD_BYTES) return "size";
  return null;
}

/** Magic-byte check so a renamed file can't pass as an image */
function looksLikeImage(buf: Buffer, type: string) {
  if (type === "image/png") return buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (type === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (type === "image/webp") return buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
  return false;
}

/**
 * Uploads an image to Cloudflare R2 and returns its public URL.
 * Without R2 credentials (local development) the file is written to /public/uploads.
 */
export async function uploadImage(file: File, folder: "products" | "payments"): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(buf, file.type)) throw new Error("INVALID_IMAGE");

  const key = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${EXT[file.type]}`;

  if (r2Configured()) {
    await r2().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: buf,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
  }

  if (process.env.NODE_ENV === "production") throw new Error("R2_NOT_CONFIGURED");
  const dest = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return `/uploads/${key}`;
}
