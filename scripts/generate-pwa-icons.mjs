import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

async function main() {
  const svgPath = resolve(process.cwd(), 'public', 'Logo_vezvision_optimized.svg')
  const svgBuffer = await readFile(svgPath)

  const sizes = [192, 512]
  const outDir = resolve(process.cwd(), 'public', 'icons')

  await mkdir(outDir, { recursive: true })

  for (const size of sizes) {
    const png = await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer()
    const outPath = resolve(outDir, `icon-${size}x${size}.png`)
    await writeFile(outPath, png)
    console.log(`Generated ${outPath}`)
  }

  const maskablePng = await sharp(svgBuffer)
    .resize(512, 512, { fit: 'cover', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer()
  const maskablePath = resolve(outDir, 'icon-512x512-maskable.png')
  await writeFile(maskablePath, maskablePng)
  console.log(`Generated ${maskablePath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
