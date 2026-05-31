import { describe, expect, it } from 'vitest'

import { normalizeSettingsEntries } from '@/services/settings'

describe('normalizeSettingsEntries', () => {
  it('normalizes public site settings and builds contact address', () => {
    const settings = normalizeSettingsEntries([
      {
        key: 'site_identity',
        value: {
          siteName: 'VezVision',
          logoUrl: 'https://cdn.example.com/logo.svg',
          faviconUrl: 'https://cdn.example.com/favicon.svg',
          defaultOgImageUrl: 'https://cdn.example.com/og.png',
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
      {
        key: 'contact',
        value: {
          email: 'contact@vezvision.com',
          phone: '+48 572 711 535',
          addressLine1: 'Złote Łany 11',
          city: 'Bielsko-Biała',
          country: 'Poland',
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
      {
        key: 'seo',
        value: {
          siteTitle: 'VezVision',
          siteDescription: 'Modern websites',
          keywords: ['ai', 'web'],
          siteUrl: 'https://vezvision.com',
          robots: 'index,follow',
          ogSiteName: 'VezVision',
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
      {
        key: 'maintenance_mode',
        value: {
          enabled: true,
          message: 'Planned maintenance',
          description: 'We will be back soon',
          allowedIps: ['127.0.0.1'],
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
      {
        key: 'navigation',
        value: {
          items: [
            {
              id: 'about',
              href: '/about',
              labelPl: 'O nas',
              labelEn: 'About',
              enabled: true,
            },
          ],
          contactButtonLabelPl: 'Kontakt',
          contactButtonLabelEn: 'Contact',
          contactButtonHref: '/contact',
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
      {
        key: 'footer',
        value: {
          subtitlePl: 'Nowa jakość cyfrowego rozwoju',
          subtitleEn: 'A new quality of digital growth',
          taglinePl: 'Biznes, technologia, kreatywność — w jednym miejscu.',
          taglineEn: 'Business, technology, creativity — in one place.',
          ctaLabelPl: 'Zacznij współpracę',
          ctaLabelEn: 'Start cooperation',
          ctaHref: '/contact',
          legalLinks: [
            {
              id: 'privacy',
              href: '/privacy-policy',
              labelPl: 'Polityka Prywatności',
              labelEn: 'Privacy Policy',
              enabled: true,
            },
          ],
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
    ])

    expect(settings.identity.siteName).toBe('VezVision')
    expect(settings.contact.address).toBe('Złote Łany 11, Bielsko-Biała')
    expect(settings.seo.keywords).toEqual(['ai', 'web'])
    expect(settings.maintenance.allowedIps).toEqual(['127.0.0.1'])
    expect(settings.navigation.items).toHaveLength(1)
    expect(settings.footer.legalLinks[0]?.href).toBe('/privacy-policy')
  })

  it('returns empty-safe defaults for missing or invalid records', () => {
    const settings = normalizeSettingsEntries([
      {
        key: 'contact',
        value: 'invalid',
        updated_at: '2026-03-31T00:00:00Z',
      },
    ])

    expect(settings.contact.email).toBe('')
    expect(settings.social.linkedin).toBe('')
    expect(settings.maintenance.enabled).toBe(false)
    expect(settings.company.legalName).toBe('')
    expect(settings.navigation.items).toEqual([])
    expect(settings.footer.legalLinks).toEqual([])
  })

  it('drops unsafe CMS URLs while keeping safe public links', () => {
    const settings = normalizeSettingsEntries([
      {
        key: 'navigation',
        value: {
          items: [
            { href: 'javascript:alert(1)', labelPl: 'Bad', labelEn: 'Bad' },
            { href: '//evil.example', labelPl: 'Protocol-relative', labelEn: 'Protocol-relative' },
            { href: 'https://vezvision.com/about', labelPl: 'Safe', labelEn: 'Safe' },
          ],
          contactButtonHref: 'javascript:alert(1)',
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
      {
        key: 'social',
        value: {
          linkedin: 'https://linkedin.com/company/vezvision',
          instagram: '/not-external',
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
      {
        key: 'seo',
        value: {
          siteUrl: 'javascript:alert(1)',
        },
        updated_at: '2026-03-31T00:00:00Z',
      },
    ])

    expect(settings.navigation.items).toHaveLength(1)
    expect(settings.navigation.items[0]?.href).toBe('https://vezvision.com/about')
    expect(settings.navigation.contactButtonHref).toBe('')
    expect(settings.social.linkedin).toBe('https://linkedin.com/company/vezvision')
    expect(settings.social.instagram).toBe('')
    expect(settings.seo.siteUrl).toBe('')
  })
})
