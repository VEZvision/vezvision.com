import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateSitemap } from './lib/sitemap'

async function main() {
  const xml = await generateSitemap()
  const outPath = resolve(process.cwd(), 'public', 'sitemap.xml')
  await writeFile(outPath, xml, 'utf-8')
  console.log(`Sitemap written to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
