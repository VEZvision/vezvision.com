import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ffffff"/>
  <text x="600" y="290" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="80" font-weight="700" fill="#0f0f0f" text-anchor="middle" letter-spacing="-2">VEZvision</text>
  <text x="600" y="370" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="#6b7280" text-anchor="middle">Modern AI &amp; automation solutions for business</text>
</svg>`

async function main() {
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  const outPath = resolve(process.cwd(), 'public', 'og-image.png')
  await writeFile(outPath, png)
  console.log(`OG image written to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
