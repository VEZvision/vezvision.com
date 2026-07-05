interface EmailLayoutData {
  lang: string;
  logoUrl: string;
  contentHtml: string;
  footerHtml?: string;
  siteUrl: string;
}

export function buildEmailLayout(data: EmailLayoutData): string {
  return `<!DOCTYPE html>
<html lang="${data.lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Inter,system-ui,-apple-system,sans-serif;color:#0f0f0f;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
${data.contentHtml}
${data.footerHtml ?? defaultFooter(data.lang, data.logoUrl, data.siteUrl)}
  </table>
</body>
</html>`;
}

function defaultFooter(lang: string, logoUrl: string, siteUrl: string): string {
  const copyright =
    lang === "pl"
      ? "Wiadomość wysłana z formularza kontaktowego na"
      : "Message sent from the contact form at";
  const safeUrl = siteUrl || "https://vezvision.com";
  return `    <tr>
      <td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          ${copyright} <a href="${safeUrl}" style="color:#04070d;text-decoration:underline;">vezvision.com</a>
        </p>
      </td>
    </tr>`;
}

export function buildHeader(
  lang: string,
  logoUrl: string,
  badgeText: string,
  siteUrl: string,
): string {
  const safeUrl = siteUrl || "https://vezvision.com";
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="VEZvision" height="28" style="display:block;height:28px;width:auto;" />`
    : '<span style="font-size:20px;font-weight:700;">VEZvision</span>';
  return `    <tr>
      <td style="padding:28px 32px 20px 32px;text-align:center;">
        <a href="${safeUrl}" style="display:inline-block;text-decoration:none;">
          ${logo}
        </a>
        <span style="display:inline-block;margin-top:12px;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:9999px;padding:4px 12px;">${badgeText}</span>
      </td>
    </tr>`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
