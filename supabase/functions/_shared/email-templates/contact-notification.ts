import { buildEmailLayout, buildHeader, escapeHtml } from "../email-layout.ts";

interface ContactNotificationData {
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  lang: string;
  storageBaseUrl: string;
  siteUrl: string;
}

export function buildContactNotificationHtml(
  data: ContactNotificationData,
): string {
  const fullName = escapeHtml(data.fullName);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : null;
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message);
  const logoUrl = data.storageBaseUrl
    ? `${data.storageBaseUrl}/logo-navbar.svg`
    : "";
  const badgeText =
    data.lang === "pl" ? "Formularz kontaktowy" : "Contact form";
  const heading = data.lang === "pl" ? "Nowa wiadomość" : "New message";
  const labels =
    data.lang === "pl"
      ? { fullName: "Imię i nazwisko", phone: "Telefon", subject: "Temat" }
      : { fullName: "Full name", phone: "Phone", subject: "Subject" };

  const phoneRow = phone
    ? `<tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;width:120px;border-bottom:1px solid #e5e7eb;">${labels.phone}</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;">${phone}</td></tr>`
    : "";

  const content = `${buildHeader(logoUrl, badgeText, data.siteUrl)}
    <tr>
      <td style="padding:0 32px 20px 32px;">
        <h1 style="margin:0;font-size:22px;line-height:1.2;color:#0f0f0f;font-weight:700;letter-spacing:-0.02em;">${heading}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 24px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;width:120px;border-bottom:1px solid #e5e7eb;">${labels.fullName}</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;">${fullName}</td></tr>
          <tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;border-bottom:1px solid #e5e7eb;">Email</td><td style="padding:10px 16px;color:#374151;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#04070d;text-decoration:underline;">${email}</a></td></tr>
          ${phoneRow}
          <tr><td style="padding:10px 16px;font-weight:600;color:#0f0f0f;">${labels.subject}</td><td style="padding:10px 16px;color:#374151;">${subject}</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 32px 32px;">
        <div style="padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
          <p style="margin:0 0 8px 0;font-weight:600;color:#0f0f0f;font-size:13px;">${data.lang === "pl" ? "Wiadomość" : "Message"}:</p>
          <p style="margin:0;color:#374151;white-space:pre-wrap;line-height:1.6;font-size:14px;">${message}</p>
        </div>
      </td>
    </tr>`;

  return buildEmailLayout({
    lang: data.lang,
    logoUrl,
    contentHtml: content,
    siteUrl: data.siteUrl,
  });
}

export function getNotificationSubject(lang: string, subject: string): string {
  return lang === "pl"
    ? `Nowa wiadomość z formularza kontaktowego: ${subject}`
    : `New contact form message: ${subject}`;
}
