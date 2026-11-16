export const maxBountyImageBytes = 5 * 1024 * 1024

const imageTypes = {
  'image/jpeg': { extension: 'jpg', signature: [0xff, 0xd8, 0xff] },
  'image/png': {
    extension: 'png',
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  'image/webp': { extension: 'webp', signature: [0x52, 0x49, 0x46, 0x46] },
} as const

type Requirement = { name: string; level: 'REQUIRED' | 'RECOMMENDED' }

export type BountyCreationInput = {
  title: string
  description: string
  location: string
  scheduledAt: Date
  deadline: Date
  latitude: number | null
  longitude: number | null
  maximumVolunteers: number
  payPerVolunteer: string
  difficulty: 'EASY' | 'MEDIUM' | 'NORMAL' | 'HARD' | 'EXTRA_HARD'
  skills: Requirement[]
  equipment: Requirement[]
}

export function parseBountyCreationInput(
  formData: FormData,
): BountyCreationInput | { error: string } {
  const title = getText(formData, 'title').trim()
  const description = getText(formData, 'description').trim()
  const location = getText(formData, 'location').trim()
  const scheduledAt = parseDate(getText(formData, 'scheduledAt'))
  const deadline = parseDate(getText(formData, 'deadline'))
  const latitudeValue = getText(formData, 'latitude').trim()
  const longitudeValue = getText(formData, 'longitude').trim()
  const latitude = latitudeValue ? Number(latitudeValue) : null
  const longitude = longitudeValue ? Number(longitudeValue) : null
  const maximumVolunteers = Number(getText(formData, 'maximumVolunteers'))
  const payPerVolunteer = getText(formData, 'payPerVolunteer')
  const difficulty = getText(formData, 'difficulty')
  const skills = parseRequirements(formData, 'skill')
  const equipment = parseRequirements(formData, 'equipment')

  if (!title || title.length > 200) {
    return { error: 'Enter a title up to 200 characters.' }
  }
  if (!description || description.length > 10000) {
    return { error: 'Enter a description up to 10,000 characters.' }
  }
  if (!location || location.length > 500) {
    return { error: 'Enter a location up to 500 characters.' }
  }
  if (!scheduledAt) return { error: 'Enter a valid date and time.' }
  if (!deadline || deadline <= new Date()) {
    return { error: 'Choose a future sign-up deadline.' }
  }
  if (
    (latitudeValue && !longitudeValue) ||
    (!latitudeValue && longitudeValue)
  ) {
    return { error: 'Coordinates must include both latitude and longitude.' }
  }
  if (
    latitude !== null &&
    (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
  ) {
    return { error: 'Enter a valid latitude.' }
  }
  if (
    longitude !== null &&
    (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
  ) {
    return { error: 'Enter a valid longitude.' }
  }
  if (!Number.isSafeInteger(maximumVolunteers) || maximumVolunteers < 1) {
    return { error: 'Maximum volunteers must be a positive whole number.' }
  }
  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(payPerVolunteer)) {
    return { error: 'Enter a non-negative pay amount with up to two decimals.' }
  }
  if (
    !['EASY', 'MEDIUM', 'NORMAL', 'HARD', 'EXTRA_HARD'].includes(difficulty)
  ) {
    return { error: 'Choose a difficulty.' }
  }
  if ('error' in skills) return skills
  if ('error' in equipment) return equipment

  return {
    title,
    description,
    location,
    scheduledAt,
    deadline,
    latitude,
    longitude,
    maximumVolunteers,
    payPerVolunteer,
    difficulty: difficulty as BountyCreationInput['difficulty'],
    skills,
    equipment,
  }
}

export async function validateBountyImage(
  file: File,
): Promise<{ extension: string; body: Uint8Array } | null> {
  if (file.size > maxBountyImageBytes) return null
  const type = imageTypes[file.type as keyof typeof imageTypes]
  if (!type) return null

  const body = new Uint8Array(await file.arrayBuffer())
  if (!type.signature.every((byte, index) => body[index] === byte)) return null
  if (
    file.type === 'image/webp' &&
    new TextDecoder().decode(body.slice(8, 12)) !== 'WEBP'
  ) {
    return null
  }

  return { extension: type.extension, body }
}

function parseRequirements(
  formData: FormData,
  prefix: 'skill' | 'equipment',
): Requirement[] | { error: string } {
  const names = formData.getAll(`${prefix}Name`)
  const levels = formData.getAll(`${prefix}Level`)
  if (names.length > 3 || levels.length > 3 || names.length !== levels.length) {
    return { error: `Add up to three ${prefix} items.` }
  }

  const results: Requirement[] = []
  const seen = new Set<string>()
  for (let index = 0; index < names.length; index += 1) {
    const rawName = names[index]
    const rawLevel = levels[index]
    if (typeof rawName !== 'string' || typeof rawLevel !== 'string') {
      return { error: `Enter valid ${prefix} requirements.` }
    }

    const name = rawName.trim()
    if (!name && !rawLevel) continue
    if (
      !name ||
      name.length > 100 ||
      (rawLevel !== 'REQUIRED' && rawLevel !== 'RECOMMENDED')
    ) {
      return { error: `Enter a name and level for each ${prefix}.` }
    }

    const normalizedName = name.toLocaleLowerCase('en-US')
    if (seen.has(normalizedName)) {
      return { error: `Each ${prefix} must have a unique name.` }
    }
    seen.add(normalizedName)
    results.push({ name, level: rawLevel })
  }

  return results
}

function getText(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

function parseDate(value: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
