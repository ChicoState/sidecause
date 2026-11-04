import { randomUUID } from 'node:crypto'

import { Prisma } from '../../../generated/prisma/client'
import { auth } from '../../../auth'
import {
  maxBountyImageBytes,
  parseBountyCreationInput,
  validateBountyImage,
} from '../../../lib/bounty-creation-input'
import { deleteObject, uploadObject } from '../../../lib/object-storage'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  const session = await auth()
  const posterId = session?.user?.id
  if (!posterId) {
    return apiError(401, 'UNAUTHENTICATED', 'Sign in to create a post.')
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > maxBountyImageBytes + 64 * 1024) {
    return apiError(
      422,
      'VALIDATION_ERROR',
      'The image must be 5 MB or smaller.',
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return apiError(422, 'VALIDATION_ERROR', 'Enter valid post details.')
  }

  const parsed = parseBountyCreationInput(formData)
  if ('error' in parsed) {
    return apiError(422, 'VALIDATION_ERROR', parsed.error)
  }

  const imageValue = formData.get('image')
  let upload: {
    key: string
    url: string
    type: string
    body: Uint8Array
  } | null = null

  if (imageValue instanceof File && imageValue.size > 0) {
    const validatedImage = await validateBountyImage(imageValue)
    if (!validatedImage) {
      return apiError(
        422,
        'VALIDATION_ERROR',
        'Choose a JPEG, PNG, or WebP image smaller than 5 MB.',
      )
    }
    const key = `bounties/${randomUUID()}.${validatedImage.extension}`
    upload = {
      key,
      url: `/api/media/${key}`,
      type: imageValue.type,
      body: validatedImage.body,
    }
  } else if (
    imageValue &&
    typeof imageValue === 'string' &&
    imageValue !== ''
  ) {
    return apiError(422, 'VALIDATION_ERROR', 'Choose a valid image file.')
  }

  try {
    if (upload) {
      await uploadObject(upload.key, upload.body, upload.type)
    }

    const bounty = await prisma.bounty.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        locationLabel: parsed.location,
        imageUrl: upload?.url ?? null,
        latitude:
          parsed.latitude === null ? null : new Prisma.Decimal(parsed.latitude),
        longitude:
          parsed.longitude === null
            ? null
            : new Prisma.Decimal(parsed.longitude),
        scheduledAt: parsed.scheduledAt,
        deadline: parsed.deadline,
        maxVolunteers: parsed.maximumVolunteers,
        payPerVolunteer: new Prisma.Decimal(parsed.payPerVolunteer),
        difficulty: parsed.difficulty,
        posterId,
        skillRequirements: {
          create: parsed.skills,
        },
        equipmentRequirements: {
          create: parsed.equipment,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        locationLabel: true,
        status: true,
        imageUrl: true,
        latitude: true,
        longitude: true,
        scheduledAt: true,
        deadline: true,
        maxVolunteers: true,
        payPerVolunteer: true,
        difficulty: true,
        createdAt: true,
        skillRequirements: { select: { name: true, level: true } },
        equipmentRequirements: { select: { name: true, level: true } },
      },
    })

    return Response.json(
      {
        data: {
          ...bounty,
          payPerVolunteer: bounty.payPerVolunteer.toString(),
          currentVolunteers: 0,
        },
      },
      { status: 201 },
    )
  } catch {
    if (upload) {
      try {
        await deleteObject(upload.key)
      } catch {
        // Keep the API response generic if cleanup cannot remove an orphan.
      }
    }
    return apiError(500, 'INTERNAL_ERROR', 'The post could not be created.')
  }
}

function apiError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message, details: {} } }, { status })
}
