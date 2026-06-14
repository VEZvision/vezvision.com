#!/usr/bin/env node
/**
 * Splits monolithic pl.ts / en.ts into section files under src/data/translations/{pl,en}/.
 * Run: node scripts/split-translations.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const translationsDir = path.join(root, 'src/data/translations')

function slugify(sectionName) {
  return sectionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function parseSections(filePath, exportName) {
  const content = fs.readFileSync(filePath, 'utf8')
  const bodyMatch = content.match(new RegExp(`export const ${exportName} = \\{([\\s\\S]*)\\}\\s*as const;?\\s*$`))
  if (!bodyMatch) throw new Error(`Could not parse ${filePath}`)

  const lines = bodyMatch[1].split('\n')
  const sections = new Map()
  let current = 'misc'
  let buffer = []

  const flush = () => {
    if (buffer.length === 0) return
    const existing = sections.get(current) ?? []
    sections.set(current, [...existing, ...buffer])
    buffer = []
  }

  for (const line of lines) {
    const comment = line.match(/^\s*\/\/\s*(.+)\s*$/)
    if (comment) {
      flush()
      current = slugify(comment[1])
      continue
    }
    if (line.trim()) buffer.push(line)
  }
  flush()

  return sections
}

function writeLocale(locale, exportName, sourceFile) {
  const sections = parseSections(sourceFile, exportName)
  const outDir = path.join(translationsDir, locale)
  fs.mkdirSync(outDir, { recursive: true })

  const imports = []
  const spreads = []

  for (const [section, lines] of sections.entries()) {
    const fileName = `${section}.ts`
    const varName = `${section}Translations`
    const filePath = path.join(outDir, fileName)
    const fileBody = `export const ${varName} = {\n${lines.join('\n')}\n} as const\n`
    fs.writeFileSync(filePath, fileBody)
    imports.push(`import { ${varName} } from './${section}'`)
    spreads.push(`  ...${varName},`)
  }

  const indexPath = path.join(outDir, 'index.ts')
  const indexBody = `${imports.join('\n')}\n\nexport const ${exportName} = {\n${spreads.join('\n')}\n} as const\n`
  fs.writeFileSync(indexPath, indexBody)
}

writeLocale('pl', 'plTranslations', path.join(translationsDir, 'pl.ts'))
writeLocale('en', 'enTranslations', path.join(translationsDir, 'en.ts'))

fs.writeFileSync(
  path.join(translationsDir, 'index.ts'),
  `export { plTranslations as pl } from './pl'\nexport { enTranslations as en } from './en'\n`,
)

console.log('Translations split into src/data/translations/pl/ and en/')
