import { readdir } from 'node:fs/promises'
import path from 'node:path'

export const builtInProfileImages = [
  { id: 'sprout', label: 'Sprout', symbol: '🌿', color: '#b4ee90' },
  { id: 'deer', label: 'Deer', symbol: '🦌', color: '#e7c78b'},
  { id: 'crow', label: 'Crow', symbol: '🐦‍⬛', color: '#c0bbd4'},
  { id: 'dragon', label: 'Dragon', symbol: '🐉', color: '#a5e9a5'},
  { id: 'bee', label: 'Bee', symbol: '🐝', color: '#ecee90' },
  { id: 'earth', label: 'Earth', symbol: '🌎', color: '#a2a7e9' },
  { id: 'pick', label: 'Pickaxe', symbol: '⛏', color: '#c5c5c5' },
  { id: 'hammer', label: 'Hammer', symbol: '🛠', color: '#bb8f185d' },
  { id: 'swords', label: 'Swords', symbol: '⚔', color: '#eb8f8f' },
  { id: 'bow', label: 'Bow', symbol: '🏹', color: '#eb8fe7' },
  { id: 'alien', label: 'Alien', symbol: '👾', color: '#dd81f0' },
  { id: 'bigfoot', label: 'Bigfoot', symbol: '🫈', color: '#4bd457' },
] as const

const profileImageDirectory = path.join(process.cwd(), 'public', 'profile-images')
const imageExtensionPattern = /\.(?:png|jpe?g|webp|gif|avif)$/i

export type ProfileImageOption =
  | (typeof builtInProfileImages)[number]
  | { id: `file:${string}`; label: string; imageUrl: string }

export async function getProfileImageOptions(): Promise<ProfileImageOption[]> {
  let filenames: string[] = []

  try {
    filenames = await readdir(profileImageDirectory)
  } catch {
    return [...builtInProfileImages]
  }

  const customImages = filenames
    .filter((filename) => imageExtensionPattern.test(filename))
    .sort()
    .map((filename) => {
      const label = path
        .parse(filename)
        .name.replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())

      return {
        id: `file:${filename}` as `file:${string}`,
        label,
        imageUrl: `/profile-images/${encodeURIComponent(filename)}`,
      }
    })

  return [...builtInProfileImages, ...customImages]
}

export async function isProfileImageId(value: unknown): Promise<boolean> {
  if (typeof value !== 'string') return false
  const options = await getProfileImageOptions()
  return options.some((option) => option.id === value)
}
