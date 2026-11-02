import { describe, it, expect } from 'vitest'
import {
  IMAGE_PRESETS,
  MAX_INPUT_BYTES,
  computeCoverCrop,
  computeOutputSize,
  estimateBase64Bytes,
  qualitySteps,
  replaceExtension,
  stripDataUrlPrefix,
  validateImageFile
} from '~/utils/imageResize'

describe('computeCoverCrop', () => {
  it('center-crops a landscape source to a square', () => {
    expect(computeCoverCrop(1000, 500, 512, 512)).toEqual({ sx: 250, sy: 0, sw: 500, sh: 500 })
  })

  it('center-crops a portrait source to a square', () => {
    expect(computeCoverCrop(400, 1000, 512, 512)).toEqual({ sx: 0, sy: 300, sw: 400, sh: 400 })
  })

  it('crops a square source to a 3:1 banner keeping full width', () => {
    expect(computeCoverCrop(1200, 1200, 1500, 500)).toEqual({ sx: 0, sy: 400, sw: 1200, sh: 400 })
  })

  it('crops a very wide source to a 3:1 banner keeping full height', () => {
    expect(computeCoverCrop(4000, 500, 1500, 500)).toEqual({ sx: 1250, sy: 0, sw: 1500, sh: 500 })
  })

  it('returns the full image when ratios already match', () => {
    expect(computeCoverCrop(3000, 1000, 1500, 500)).toEqual({ sx: 0, sy: 0, sw: 3000, sh: 1000 })
  })

  it('throws on non-positive dimensions', () => {
    expect(() => computeCoverCrop(0, 100, 10, 10)).toThrow()
    expect(() => computeCoverCrop(100, NaN, 10, 10)).toThrow()
  })
})

describe('computeOutputSize', () => {
  it('uses the preset size when the crop is large enough', () => {
    expect(computeOutputSize({ sw: 2000, sh: 2000 }, IMAGE_PRESETS.avatar)).toEqual({ width: 512, height: 512 })
  })

  it('never upscales a small crop', () => {
    expect(computeOutputSize({ sw: 300, sh: 100 }, IMAGE_PRESETS.banner)).toEqual({ width: 300, height: 100 })
  })
})

describe('qualitySteps', () => {
  it('descends from start and ends exactly at min', () => {
    expect(qualitySteps(0.92, 0.4, 0.12)).toEqual([0.92, 0.8, 0.68, 0.56, 0.44, 0.4])
  })

  it('does not duplicate min when the steps land on it', () => {
    expect(qualitySteps(0.9, 0.5, 0.2)).toEqual([0.9, 0.7, 0.5])
  })

  it('falls back to [min] for invalid input', () => {
    expect(qualitySteps(0.3, 0.4, 0.1)).toEqual([0.4])
    expect(qualitySteps(0.9, 0.4, 0)).toEqual([0.4])
  })
})

describe('base64 helpers', () => {
  it('strips a data URL prefix', () => {
    expect(stripDataUrlPrefix('data:image/webp;base64,QUJD')).toBe('QUJD')
    expect(stripDataUrlPrefix('QUJD')).toBe('QUJD')
  })

  it('estimates decoded byte size including padding', () => {
    expect(estimateBase64Bytes('QUJD')).toBe(3)
    expect(estimateBase64Bytes('QUI=')).toBe(2)
    expect(estimateBase64Bytes('QQ==')).toBe(1)
    expect(estimateBase64Bytes('data:image/png;base64,QUJDRA==')).toBe(4)
    expect(estimateBase64Bytes('')).toBe(0)
  })
})

describe('replaceExtension', () => {
  it('swaps the extension for the encoded mime type', () => {
    expect(replaceExtension('My Photo.HEIC', 'image/webp')).toBe('My-Photo.webp')
    expect(replaceExtension('shot.png', 'image/jpeg')).toBe('shot.jpg')
  })

  it('uses the fallback base for empty names', () => {
    expect(replaceExtension('', 'image/webp', 'avatar')).toBe('avatar.webp')
  })
})

describe('validateImageFile', () => {
  it('accepts supported image types', () => {
    expect(validateImageFile({ type: 'image/png', size: 1000 })).toBeNull()
  })

  it('rejects missing, unsupported and oversized files', () => {
    expect(validateImageFile(null)).toBe('missing')
    expect(validateImageFile({ type: 'application/pdf', size: 10 })).toBe('type')
    expect(validateImageFile({ type: 'image/jpeg', size: MAX_INPUT_BYTES + 1 })).toBe('inputTooLarge')
  })
})
