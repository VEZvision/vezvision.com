const escapeHtml = value => String(value ?? '').replace(
  /[&<>"']/g,
  character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
)

const cleanSiteUrl = siteUrl => String(siteUrl || '').replace(/\/$/, '')

function emailLayout({ language, preheader, eyebrow, title, content, siteUrl }) {
  const isEnglish = language === 'en'
  const safeSiteUrl = cleanSiteUrl(siteUrl)
  const footer = isEnglish
    ? 'This message was sent by VEZvision in response to an action on our website.'
    : 'Ta wiadomość została wysłana przez VEZvision w odpowiedzi na działanie na naszej stronie.'
  const footerNote = isEnglish
    ? 'If this message was not expected, no action is required.'
    : 'Jeśli ta wiadomość nie była oczekiwana, nie musisz nic robić.'

  return `<!doctype html>
<html lang="${isEnglish ? 'en' : 'pl'}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f7;color:#111827;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f6f6f7">
      <tr>
        <td align="center" style="padding:34px 14px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:608px;background:#ffffff;border:1px solid #e7e7ea;border-radius:24px;overflow:hidden;box-shadow:0 18px 46px rgba(15,23,42,.06)">
            <tr>
              <td style="padding:28px 32px 24px;border-bottom:1px solid #ededf0;background:#ffffff">
                <a href="${escapeHtml(safeSiteUrl)}" style="display:inline-block;text-decoration:none;color:#09090b">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle" style="width:34px;height:34px;background:#09090b;border-radius:11px;text-align:center">
                        <span style="display:inline-block;width:17px;height:17px;border-left:3px solid #ffffff;border-bottom:3px solid #ffffff;transform:rotate(-45deg);margin-top:6px"></span>
                      </td>
                      <td valign="middle" style="padding-left:11px;color:#09090b;font-size:20px;line-height:1;font-weight:700;letter-spacing:0">
                        VEZ<span style="font-weight:400;color:#3f3f46">vision</span>
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 34px;background:#ffffff">
                <p style="margin:0 0 12px;color:#71717a;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0 0 22px;color:#09090b;font-size:27px;line-height:1.2;font-weight:650;letter-spacing:0">${escapeHtml(title)}</h1>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#fbfbfc;border-top:1px solid #ededf0">
                <p style="margin:0;color:#71717a;font-size:12px;line-height:1.6">${footer}</p>
                <p style="margin:6px 0 0;color:#71717a;font-size:12px;line-height:1.6">${footerNote}</p>
                <p style="margin:10px 0 0;color:#a1a1aa;font-size:12px"><a href="${escapeHtml(safeSiteUrl)}" style="color:#52525b;text-decoration:none">vezvision.com</a></p>
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
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.6;border-collapse:collapse">
      <tr><td style="padding:0 0 10px;color:#71717a;width:104px;vertical-align:top">Kontakt</td><td style="padding:0 0 10px;color:#18181b;font-weight:650;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(fullName)}</td></tr>
      <tr><td style="padding:0 0 10px;color:#71717a;vertical-align:top">E-mail</td><td style="padding:0 0 10px;overflow-wrap:anywhere;word-break:break-word"><a href="mailto:${escapeHtml(email)}" style="color:#18181b;text-decoration:none">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:0 0 10px;color:#71717a;vertical-align:top">Telefon</td><td style="padding:0 0 10px;color:#18181b;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(phone)}</td></tr>` : ''}
      <tr><td style="padding:0 0 10px;color:#71717a;vertical-align:top">Temat</td><td style="padding:0 0 10px;color:#18181b;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(subject)}</td></tr>
    </table>
    <div style="margin-top:20px;padding:18px 20px;background:#f8f8f9;border:1px solid #e7e7ea;border-radius:14px;color:#27272a;font-size:14px;line-height:1.7;overflow-wrap:anywhere;word-break:break-word">${safeMessage}</div>`

  return {
    subject: `[VEZvision] ${subject}`,
    text: `Nowa wiadomość z formularza VEZvision\n\nKontakt: ${fullName}\nE-mail: ${email}${phone ? `\nTelefon: ${phone}` : ''}\nTemat: ${subject}\n\nWiadomość:\n${message}`,
    html: emailLayout({ language: 'pl', preheader: `Nowa wiadomość od ${fullName}`, eyebrow: 'Formularz kontaktowy', title: 'Nowa wiadomość', content, siteUrl }),
  }
}

export function contactAutoReplyEmail({ fullName, language, siteUrl }) {
  const isEnglish = language === 'en'
  const safeName = escapeHtml(fullName)
  const content = isEnglish
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">Hello ${safeName},</p><p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">Thank you for your message. It has reached the VEZvision team.</p><p style="margin:0;font-size:16px;line-height:1.7;color:#27272a">We will review the details and get back to you within one business day.</p>`
    : `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">Dzień dobry ${safeName},</p><p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#27272a">dziękujemy za wiadomość. Zgłoszenie dotarło do zespołu VEZvision.</p><p style="margin:0;font-size:16px;line-height:1.7;color:#27272a">Zapoznamy się ze szczegółami i wrócimy z odpowiedzią w ciągu jednego dnia roboczego.</p>`

  return {
    subject: isEnglish ? 'We received your message | VEZvision' : 'Otrzymaliśmy Twoją wiadomość | VEZvision',
    text: isEnglish
      ? `Hello ${fullName},\n\nThank you for your message. It has reached the VEZvision team. We will get back to you within one business day.`
      : `Dzień dobry ${fullName},\n\ndziękujemy za wiadomość. Zgłoszenie dotarło do zespołu VEZvision. Wrócimy z odpowiedzią w ciągu jednego dnia roboczego.`,
    html: emailLayout({ language, preheader: isEnglish ? 'Your message has reached our team.' : 'Twoja wiadomość dotarła do naszego zespołu.', eyebrow: isEnglish ? 'Message received' : 'Wiadomość odebrana', title: isEnglish ? 'We received your message' : 'Wiadomość dotarła', content, siteUrl }),
  }
}

export function newsletterConfirmationEmail({ language, confirmationUrl, siteUrl }) {
  const isEnglish = language === 'en'
  const safeUrl = escapeHtml(confirmationUrl)
  const button = isEnglish ? 'Confirm subscription' : 'Potwierdź zapis'
  const content = `
    <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#27272a">${isEnglish ? 'Confirm your email address to receive selected VEZvision updates.' : 'Potwierdź swój adres e-mail, aby otrzymywać wybrane aktualności VEZvision.'}</p>
    <p style="margin:0 0 24px"><a href="${safeUrl}" style="display:inline-block;padding:13px 20px;background:#09090b;color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:650">${button}</a></p>
    <p style="margin:0 0 12px;color:#71717a;font-size:13px;line-height:1.6">${isEnglish ? 'The link is valid for 48 hours. If you did not request this subscription, you can ignore this message.' : 'Link jest ważny przez 48 godzin. Jeśli nie prosiłeś o zapis, możesz zignorować tę wiadomość.'}</p>
    <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word">${isEnglish ? 'If the button does not work, copy this link into your browser:' : 'Jeśli przycisk nie działa, skopiuj ten link do przeglądarki:'}<br><a href="${safeUrl}" style="color:#52525b;text-decoration:none">${safeUrl}</a></p>`

  return {
    subject: isEnglish ? 'Confirm your subscription | VEZvision' : 'Potwierdź zapis | VEZvision',
    text: isEnglish
      ? `Confirm your VEZvision newsletter subscription:\n${confirmationUrl}\n\nThe link is valid for 48 hours.`
      : `Potwierdź zapis do newslettera VEZvision:\n${confirmationUrl}\n\nLink jest ważny przez 48 godzin.`,
    html: emailLayout({ language, preheader: isEnglish ? 'Confirm your VEZvision newsletter subscription.' : 'Potwierdź zapis do newslettera VEZvision.', eyebrow: 'VEZvision Newsletter', title: isEnglish ? 'Confirm your email address' : 'Potwierdź adres e-mail', content, siteUrl }),
  }
}
