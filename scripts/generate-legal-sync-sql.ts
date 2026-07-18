import { LEGAL_TEMPLATES } from "../src/data/legalTemplates";

function sqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

const documents = [
  {
    key: "privacy_policy",
    titlePl: "Polityka prywatności",
    titleEn: "Privacy Policy",
    content: LEGAL_TEMPLATES.privacy_policy,
  },
  {
    key: "terms",
    titlePl: "Regulamin świadczenia usług",
    titleEn: "Terms of Service",
    content: LEGAL_TEMPLATES.terms,
  },
  {
    key: "cookie_policy",
    titlePl: "Polityka plików cookies",
    titleEn: "Cookie Policy",
    content: LEGAL_TEMPLATES.cookie_policy,
  },
];

const values = documents
  .map(
    ({ key, titlePl, titleEn, content }) =>
      `(${sqlLiteral(key)}, ${sqlLiteral(titlePl)}, ${sqlLiteral(titleEn)}, ${sqlLiteral(content.pl)}, ${sqlLiteral(content.en)}, '2026.07.18', DATE '2026-07-18', true)`,
  )
  .join(",\n");

process.stdout.write(`BEGIN;
INSERT INTO public.vv_legal_documents (
  document_key, title_pl, title_en, content_pl, content_en,
  version, last_updated, is_published
) VALUES
${values}
ON CONFLICT (document_key) DO UPDATE SET
  title_pl = EXCLUDED.title_pl,
  title_en = EXCLUDED.title_en,
  content_pl = EXCLUDED.content_pl,
  content_en = EXCLUDED.content_en,
  version = EXCLUDED.version,
  last_updated = EXCLUDED.last_updated,
  is_published = EXCLUDED.is_published;
COMMIT;
`);
