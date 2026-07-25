export interface CompressedImage {
  mimeType: string
  base64Data: string
}

const MAX_DIMENSION = 1024
const JPEG_QUALITY = 0.82

/**
 * Downscales/compresses a picked photo before upload — cuts upload time on
 * mobile networks and reduces Gemini's per-request cost (the server also
 * re-compresses defensively, but doing it here means most requests never
 * carry a multi-MB payload in the first place).
 */
export function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      const base64Data = dataUrl.split(',')[1]
      if (!base64Data) {
        reject(new Error('Failed to encode image'))
        return
      }
      resolve({ mimeType: 'image/jpeg', base64Data })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read the selected file as an image'))
    }

    img.src = objectUrl
  })
}
