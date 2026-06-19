import { buildEmailLayout, buildHeader, escapeHtml } from "../email-layout.ts";

interface AutoReplyData {
  fullName: string;
  lang: string;
  storageBaseUrl: string;
}

export function buildAutoReplyHtml(data: AutoReplyData): string {
  const isPl = data.lang === "pl";
  const fullName = escapeHtml(data.fullName);
  const greeting = isPl ? `Dzień dobry, ${fullName}!` : `Hello, ${fullName}!`;
  const body = isPl
    ? "Dziękujemy za wiadomość. Odpiszemy możliwie szybko, zwykle w ciągu 24 godzin."
    : "Thanks for your message. We will reply as soon as we can, usually within 24 hours.";
  const closing = isPl ? "Pozdrawiamy" : "Kind regards";
  const team = "VezVision";
  const logoUrl = data.storageBaseUrl
    ? `${data.storageBaseUrl}/logo-navbar.svg`
    : "";
  const xIconUrl = data.storageBaseUrl
    ? `${data.storageBaseUrl}/icons/x.svg`
    : "";
  const instagramIconUrl = data.storageBaseUrl
    ? `${data.storageBaseUrl}/icons/instagram.svg`
    : "";
  const linkedinIconUrl = data.storageBaseUrl
    ? `${data.storageBaseUrl}/icons/linkedin.svg`
    : "";
  const ctaLabel = isPl ? "Odwiedź naszą stronę" : "Visit our website";
  const tagline = isPl
    ? "Strony, aplikacje i automatyzacje dla firm."
    : "Websites, apps and automation for companies.";
  const disclaimer = isPl
    ? "Wiadomość wysłana automatycznie. Prosimy nie odpowiadać na ten adres."
    : "This message was sent automatically. Please do not reply to this address.";

  const content = `${buildHeader(data.lang, logoUrl, "")}
    <tr>
      <td style="padding:0 32px 24px 32px;">
        <p style="margin:0 0 16px;font-size:18px;color:#0f0f0f;font-weight:600;">${greeting}</p>
        <p style="margin:0 0 20px;color:#374151;line-height:1.7;font-size:15px;">${body}</p>
        <p style="margin:0;color:#374151;font-size:15px;">${closing},<br><strong style="color:#0f0f0f;">${team}</strong></p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px 28px 32px;text-align:center;">
        <a href="https://vezvision.com" style="display:inline-block;background:#04070d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">${ctaLabel}</a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 32px 16px 32px;">
        ${xIconUrl ? `<a href="https://x.com/vezvision" style="display:inline-block;margin:0 6px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-decoration:none;" target="_blank"><img src="${xIconUrl}" alt="X" width="16" height="16" style="display:block;" /></a>` : ""}
        ${instagramIconUrl ? `<a href="https://instagram.com/vezvision" style="display:inline-block;margin:0 6px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-decoration:none;" target="_blank"><img src="${instagramIconUrl}" alt="Instagram" width="16" height="16" style="display:block;" /></a>` : ""}
        ${linkedinIconUrl ? `<a href="https://linkedin.com/company/vezvision" style="display:inline-block;margin:0 6px;padding:8px;border:1px solid #e5e7eb;border-radius:6px;text-decoration:none;" target="_blank"><img src="${linkedinIconUrl}" alt="LinkedIn" width="16" height="16" style="display:block;" /></a>` : ""}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 32px 16px 32px;">
        <p style="margin:0;font-size:12px;color:#6b7280;">${tagline}</p>
      </td>
    </tr>`;

  const footer = `    <tr>
      <td align="center" style="padding:0 32px 24px 32px;border-top:1px solid #e5e7eb;">
        <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">
          ${disclaimer}
        </p>
      </td>
    </tr>`;

  return buildEmailLayout({
    lang: data.lang,
    logoUrl,
    contentHtml: content,
    footerHtml: footer,
  });
}

export function getAutoReplySubject(lang: string): string {
  return lang === "pl"
    ? "Potwierdzenie wiadomości VezVision"
    : "Message received by VezVision";
}
