import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3"
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

// Uploaded images are served directly via <img src>, so the bucket must allow
// anonymous GetObject. Ensure the bucket exists and carries a public-read policy.
// Runs at most once per server process.
let bucketReady: Promise<void> | null = null

async function ensureBucketReady(): Promise<void> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: BUCKET }))
  } catch {
    // Bucket missing (or head denied) — try to create it, ignore "already exists"
    try {
      await client.send(new CreateBucketCommand({ Bucket: BUCKET }))
    } catch {
      /* already exists or created concurrently */
    }
  }

  const policy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${BUCKET}/*`],
      },
    ],
  })

  try {
    await client.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: policy }))
  } catch (err) {
    // Non-fatal: a managed/CDN bucket may forbid policy changes but already be public.
    console.warn("[storage] Could not set public-read bucket policy:", err instanceof Error ? err.message : err)
  }
}

function ready(): Promise<void> {
  if (!bucketReady) bucketReady = ensureBucketReady()
  return bucketReady
}

export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  extension: string,
): Promise<string> {
  await ready()

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
