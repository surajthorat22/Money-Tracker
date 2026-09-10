import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const t = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1)
    raw[row] = 0
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

function setPixel(data, size, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 4
  data[i] = r
  data[i + 1] = g
  data[i + 2] = b
  data[i + 3] = a
}

function fillRect(data, size, x, y, w, h, r, g, b) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(data, size, xx, yy, r, g, b)
  }
}

function fillRoundRect(data, size, x, y, w, h, rad, r, g, b) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const cx = xx < x + rad ? x + rad : xx > x + w - rad - 1 ? x + w - rad - 1 : xx
      const cy = yy < y + rad ? y + rad : yy > y + h - rad - 1 ? y + h - rad - 1 : yy
      const inCorner = (xx < x + rad || xx > x + w - rad - 1) && (yy < y + rad || yy > y + h - rad - 1)
      if (inCorner) {
        const dx = xx - cx
        const dy = yy - cy
        if (dx * dx + dy * dy > rad * rad) continue
      }
      setPixel(data, size, xx, yy, r, g, b)
    }
  }
}

function drawIcon(size) {
  const data = Buffer.alloc(size * size * 4, 0)
  const s = size / 512
  fillRoundRect(data, size, 0, 0, size, size, Math.round(96 * s), 12, 22, 18)
  fillRoundRect(data, size, Math.round(72 * s), Math.round(220 * s), Math.round(150 * s), Math.round(170 * s), Math.round(18 * s), 46, 214, 148)
  const minY = Math.round(120 * s)
  const maxY = Math.round(230 * s)
  for (let y = minY; y <= maxY; y++) {
    const t = (y - minY) / (maxY - minY)
    const half = Math.round((75 * s) * t)
    const cx = Math.round(147 * s)
    for (let x = cx - half; x <= cx + half; x++) setPixel(data, size, x, y, 46, 214, 148)
  }
  fillRect(data, size, Math.round(280 * s), Math.round(270 * s), Math.round(48 * s), Math.round(120 * s), 90, 224, 176)
  fillRect(data, size, Math.round(348 * s), Math.round(210 * s), Math.round(48 * s), Math.round(180 * s), 62, 224, 160)
  fillRect(data, size, Math.round(416 * s), Math.round(160 * s), Math.round(48 * s), Math.round(230 * s), 180, 255, 214)
  return data
}

await mkdir(join(root, 'public/icons'), { recursive: true })

for (const size of [192, 512, 180]) {
  const buf = png(size, size, drawIcon(size))
  const dest =
    size === 180
      ? join(root, 'public/apple-touch-icon.png')
      : join(root, `public/icons/icon-${size}.png`)
  await mkdir(dirname(dest), { recursive: true })
  const fs = await import('node:fs/promises')
  await fs.writeFile(dest, buf)
  console.log('wrote', dest)
}
