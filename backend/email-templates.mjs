const escapeHtml = value => String(value ?? '').replace(
  /[&<>"']/g,
  character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
)

const cleanSiteUrl = siteUrl => String(siteUrl || '').replace(/\/$/, '')

function emailLayout({ language, preheader, eyebrow, title, content, siteUrl }) {
  const isEnglish = language === 'en'
  const logoUrl = `${cleanSiteUrl(siteUrl)}/email-logo.png`
  const footer = isEnglish
    ? 'This message was sent by VEZvision in response to an action on our website.'
    : 'Ta wiadomość została wysłana przez VEZvision w odpowiedzi na działanie na naszej stronie.'

  return `<!doctype html>
<html lang="${isEnglish ? 'en' : 'pl'}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;color:#111827;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f5">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #e4e4e7;border-radius:18px;overflow:hidden">
            <tr>
              <td style="padding:28px 32px 24px;border-bottom:1px solid #ededf0">
                <a href="${escapeHtml(cleanSiteUrl(siteUrl))}" style="display:inline-block;text-decoration:none">
                  <img src="${escapeHtml(logoUrl)}" width="164" height="30" alt="VEZvision" style="display:block;width:164px;height:auto;border:0">
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 34px">
                <p style="margin:0 0 12px;color:#71717a;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0 0 22px;color:#09090b;font-size:28px;line-height:1.2;font-weight:650;letter-spacing:-.02em">${escapeHtml(title)}</h1>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#fafafa;border-top:1px solid #ededf0">
                <p style="margin:0;color:#71717a;font-size:12px;line-height:1.6">${footer}</p>
                <p style="margin:7px 0 0;color:#a1a1aa;font-size:12px">vezvision.com</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function contactNotificationEmail({ fullName, email, phone, subject, message, siteUrl }) {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.6">
      <tr><td style="padding:0 0 8px;color:#71717a;width:96px">Kontakt</td><td style="padding:0 0 8px;color:#18181b;font-weight:600">${escapeHtml(fullName)}</td></tr>
      <tr><td style="padding:0 0 8px;color:#71717a">E-mail</td><td style="padding:0 0 8px"><a href="mailto:${escapeHtml(email)}" style="color:#18181b">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:0 0 8px;color:#71717a">Telefon</td><td style="padding:0 0 8px;color:#18181b">${escapeHtml(phone)}</td></tr>` : ''}
      <tr><td style="padding:0 0 8px;color:#71717a">Temat</td><td style="padding:0 0 8px;color:#18181b">${escapeHtml(subject)}</td></tr>
    </table>
    <div style="margin-top:22px;padding:20px;background:#f7f7f8;border:1px solid #e4e4e7;border-radius:12px;color:#27272a;font-size:14px;line-height:1.7">${safeMessage}</div>`

  return {
    subject: `[VEZvision] ${subject}`,
    text: `Nowa wiadomość z formularza VEZvision\n\nKontakt: ${fullName}\nE-mail: ${email}${phone ? `\nTelefon: ${phone}` : ''}\nTemat: ${subject}\n\n${message}`,
    html: emailLayout({ language: 'pl', preheader: `Nowa wiadomość od ${fullName}`, eyebrow: 'Formularz kontaktowy', title: 'Nowa wiadomość', content, siteUrl }),
  }
}

export function contactAutoReplyEmail({ fullName, language, siteUrl }) {
  const isEnglish = language === 'en'
  const safeName = escapeHtml(fullName)
  const content = isEnglish
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">Hello ${safeName},</p><p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">Thank you for contacting us. Your message has reached the VEZvision team.</p><p style="margin:0;font-size:16px;line-height:1.7;color:#27272a">We will review the details and reply within one business day.</p>`
    : `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">Dzień dobry ${safeName},</p><p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">dziękujemy za kontakt. Twoja wiadomość dotarła do zespołu VEZvision.</p><p style="margin:0;font-size:16px;line-height:1.7;color:#27272a">Zapoznamy się ze szczegółami i odpowiemy w ciągu jednego dnia roboczego.</p>`

  return {
    subject: isEnglish ? 'We received your message | VEZvision' : 'Otrzymaliśmy Twoją wiadomość | VEZvision',
    text: isEnglish
      ? `Hello ${fullName},\n\nThank you for contacting us. Your message has reached the VEZvision team. We will reply within one business day.`
      : `Dzień dobry ${fullName},\n\ndziękujemy za kontakt. Twoja wiadomość dotarła do zespołu VEZvision. Odpowiemy w ciągu jednego dnia roboczego.`,
    html: emailLayout({ language, preheader: isEnglish ? 'Your message has reached our team.' : 'Twoja wiadomość dotarła do naszego zespołu.', eyebrow: isEnglish ? 'Message received' : 'Wiadomość odebrana', title: isEnglish ? 'Thank you for getting in touch' : 'Dziękujemy za kontakt', content, siteUrl }),
  }
}

export function newsletterConfirmationEmail({ language, confirmationUrl, siteUrl }) {
  const isEnglish = language === 'en'
  const safeUrl = escapeHtml(confirmationUrl)
  const button = isEnglish ? 'Confirm subscription' : 'Potwierdź zapis'
  const content = `
    <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#27272a">${isEnglish ? 'Confirm your email address to receive selected VEZvision updates.' : 'Potwierdź swój adres e-mail, aby otrzymywać wybrane aktualności VEZvision.'}</p>
    <p style="margin:0 0 24px"><a href="${safeUrl}" style="display:inline-block;padding:13px 20px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:650">${button}</a></p>
    <p style="margin:0;color:#71717a;font-size:13px;line-height:1.6">${isEnglish ? 'The link is valid for 48 hours. If you did not request this subscription, you can ignore this message.' : 'Link jest ważny przez 48 godzin. Jeśli nie prosisz o zapis, możesz zignorować tę wiadomość.'}</p>`

  return {
    subject: isEnglish ? 'Confirm your subscription | VEZvision' : 'Potwierdź zapis | VEZvision',
    text: isEnglish
      ? `Confirm your VEZvision newsletter subscription:\n${confirmationUrl}\n\nThe link is valid for 48 hours.`
      : `Potwierdź zapis do newslettera VEZvision:\n${confirmationUrl}\n\nLink jest ważny przez 48 godzin.`,
    html: emailLayout({ language, preheader: isEnglish ? 'Confirm your VEZvision newsletter subscription.' : 'Potwierdź zapis do newslettera VEZvision.', eyebrow: 'VEZvision Newsletter', title: isEnglish ? 'One more step' : 'Jeszcze jeden krok', content, siteUrl }),
  }
}
