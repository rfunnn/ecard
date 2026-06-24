import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { randomBytes } from "crypto"

const client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY ?? "",
    secretAccessKey: process.env.STORAGE_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
})

const BUCKET = process.env.STORAGE_BUCKET ?? "ecard"

function publicUrl(key: string): string {
  const base = process.env.STORAGE_PUBLIC_URL
    ? process.env.STORAGE_PUBLIC_URL.replace(/\/$/, "")
    : `${process.env.STORAGE_ENDPOINT?.replace(/\/$/, "")}/${BUCKET}`
  return `${base}/${key}`
}

export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  extension: string,
): Promise<string> {
  const key = `${randomBytes(10).toString("hex")}.${extension}`
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  )
  return publicUrl(key)
}
