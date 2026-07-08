import { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3"
import { readFileSync } from "fs"

// Minimal .env loader
const env = {}
try {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
    if (m) env[m[1]] = m[2]
  }
} catch {}

const endpoint = env.STORAGE_ENDPOINT ?? "http://localhost:9000"
const BUCKET   = env.STORAGE_BUCKET ?? "ecard"

const client = new S3Client({
  endpoint,
  region: env.STORAGE_REGION ?? "us-east-1",
  credentials: { accessKeyId: env.STORAGE_ACCESS_KEY ?? "", secretAccessKey: env.STORAGE_SECRET_KEY ?? "" },
  forcePathStyle: true,
})

try {
  await client.send(new HeadBucketCommand({ Bucket: BUCKET }))
  console.log(`Bucket "${BUCKET}" exists`)
} catch {
  await client.send(new CreateBucketCommand({ Bucket: BUCKET }))
  console.log(`Bucket "${BUCKET}" created`)
}

const policy = JSON.stringify({
  Version: "2012-10-17",
  Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
})

await client.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: policy }))
console.log("Public-read policy applied.")
