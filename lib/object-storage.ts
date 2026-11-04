import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

let client: S3Client | undefined

function getClient(): S3Client {
  if (client) return client

  const endpoint = process.env.S3_ENDPOINT
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  client = new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? 'us-east-1',
    forcePathStyle: Boolean(endpoint),
    credentials:
      accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined,
  })

  return client
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET
  if (!bucket) throw new Error('S3_BUCKET is not configured.')
  return bucket
}

export async function uploadObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  const s3 = getClient()
  const bucket = getBucket()

  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode
    const name = (error as { name?: string }).name
    if (status !== 404 && name !== 'NotFound' && name !== 'NoSuchBucket') {
      throw error
    }

    try {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }))
    } catch (createError) {
      if (
        (createError as { name?: string }).name !== 'BucketAlreadyOwnedByYou'
      ) {
        throw createError
      }
    }
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'private, no-store',
    }),
  )
}

export async function readObject(
  key: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  const result = await getClient().send(
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
  )

  if (!result.Body) throw new Error('Stored image has no body.')

  return {
    body: await result.Body.transformToByteArray(),
    contentType: result.ContentType ?? 'application/octet-stream',
  }
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key }),
  )
}
