// Client-side image crop / resize / compress for avatar & banner uploads (contract §2 POST /users/avatar).
// Pure math helpers are exported for unit tests; the canvas pipeline only touches the DOM when called.

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = Object.freeze(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
export const IMAGE_PRESETS = Object.freeze({
  avatar: Object.freeze({ width: 512, height: 512 }),
  banner: Object.freeze({ width: 1500, height: 500 })
})
export const QUALITY_START = 0.92
export const QUALITY_MIN = 0.4
export const QUALITY_STEP = 0.12
// Input files above this size are rejected before decoding (protects the tab from huge bitmaps)
export const MAX_INPUT_BYTES = 25 * 1024 * 1024

const WEBP = 'image/webp'
const JPEG = 'image/jpeg'
const EXTENSIONS = Object.freeze({ [WEBP]: 'webp', [JPEG]: 'jpg', 'image/png': 'png' })

const isPositive = (n) => Number.isFinite(n) && n > 0

/**
 * Centered "cover" crop: the largest source rectangle with the target aspect ratio.
 * Returns `{ sx, sy, sw, sh }` in source pixels.
 */
export const computeCoverCrop = (srcWidth, srcHeight, targetWidth, targetHeight) => {
  if (![srcWidth, srcHeight, targetWidth, targetHeight].every(isPositive)) {
    throw new Error('computeCoverCrop: dimensions must be positive numbers')
  }
  const targetRatio = targetWidth / targetHeight
  const srcRatio = srcWidth / srcHeight
  if (srcRatio > targetRatio) {
    const sw = Math.round(srcHeight * targetRatio)
    return { sx: Math.round((srcWidth - sw) / 2), sy: 0, sw, sh: srcHeight }
  }
  const sh = Math.round(srcWidth / targetRatio)
  return { sx: 0, sy: Math.round((srcHeight - sh) / 2), sw: srcWidth, sh }
}

/** Output size for a crop: the preset size, scaled down (never up) when the crop is smaller. */
export const computeOutputSize = (crop, preset) => {
  const scale = Math.min(1, crop.sw / preset.width, crop.sh / preset.height)
  return {
    width: Math.max(1, Math.round(preset.width * scale)),
    height: Math.max(1, Math.round(preset.height * scale))
  }
}

/** Descending encoder quality steps, always ending exactly at `min`. */
export const qualitySteps = (start = QUALITY_START, min = QUALITY_MIN, step = QUALITY_STEP) => {
  if (!(step > 0) || start < min) return [min]
  const count = Math.floor((start - min) / step + 1e-9) + 1
  const steps = Array.from({ length: count }, (_, i) => Math.round((start - i * step) * 100) / 100)
  return steps[steps.length - 1] === min ? steps : [...steps, min]
}

/** Strips a `data:<mime>;base64,` prefix if present. */
export const stripDataUrlPrefix = (value = '') => {
  const comma = value.indexOf(',')
  return value.startsWith('data:') && comma >= 0 ? value.slice(comma + 1) : value
}

/** Decoded byte size of a base64 string (or data URL) without decoding it. */
export const estimateBase64Bytes = (value = '') => {
  const clean = stripDataUrlPrefix(value).replace(/\s/g, '')
  if (!clean) return 0
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  return Math.floor((clean.length * 3) / 4) - padding
}

/** `photo.HEIC` + `image/webp` → `photo.webp`; falls back to `kind.ext`. */
export const replaceExtension = (fileName, mimeType, fallbackBase = 'image') => {
  const ext = EXTENSIONS[mimeType] || 'img'
  const base = String(fileName || '').replace(/\.[^./\\]+$/, '').replace(/[^\w.-]+/g, '-').slice(0, 80)
  return `${base || fallbackBase}.${ext}`
}

/** Validates the raw input file. Returns an error code or null. */
export const validateImageFile = (file) => {
  if (!file) return 'missing'
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_INPUT_BYTES) return 'inputTooLarge'
  return null
}

// ---- Browser-only pipeline ----

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    URL.revokeObjectURL(url)
    resolve(img)
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    reject(Object.assign(new Error('Image could not be decoded'), { code: 'decode' }))
  }
  img.src = url
})

const canvasToBlob = (canvas, type, quality) => new Promise((resolve) => {
  canvas.toBlob((blob) => resolve(blob), type, quality)
})

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(stripDataUrlPrefix(String(reader.result || '')))
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})

const drawCropped = (img, preset) => {
  const crop = computeCoverCrop(img.naturalWidth, img.naturalHeight, preset.width, preset.height)
  const size = computeOutputSize(crop, preset)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, size.width, size.height)
  return canvas
}

// Browsers that cannot encode WebP silently return PNG from toBlob — detect and use JPEG instead
const pickMimeType = async (canvas) => {
  const probe = await canvasToBlob(canvas, WEBP, QUALITY_START)
  return probe && probe.type === WEBP ? WEBP : JPEG
}

const encodeWithinLimit = async (canvas) => {
  const mimeType = await pickMimeType(canvas)
  for (const quality of qualitySteps()) {
    const blob = await canvasToBlob(canvas, mimeType, quality)
    if (blob && blob.size <= MAX_UPLOAD_BYTES) return { blob, mimeType }
  }
  throw Object.assign(new Error('Image is too large after compression'), { code: 'tooLarge' })
}

/**
 * Crops, resizes and compresses an image file for `kind` ('avatar' | 'banner').
 * Resolves `{ base64, mimeType, fileName, previewUrl, size }`; caller must revoke `previewUrl`.
 */
export const prepareImageUpload = async (file, kind) => {
  const invalid = validateImageFile(file)
  if (invalid) throw Object.assign(new Error(`Invalid image: ${invalid}`), { code: invalid })
  const preset = IMAGE_PRESETS[kind] || IMAGE_PRESETS.avatar
  const img = await loadImage(file)
  const { blob, mimeType } = await encodeWithinLimit(drawCropped(img, preset))
  const base64 = await blobToBase64(blob)
  return {
    base64,
    mimeType,
    fileName: replaceExtension(file.name, mimeType, kind),
    previewUrl: URL.createObjectURL(blob),
    size: blob.size
  }
}
