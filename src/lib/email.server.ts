import { Resend } from "resend";

export interface BookingEmailPayload {
  reference: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberName: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
}

function getResendClient(): Resend | null {
  const apiKey =
    process.env.RESEND_API_KEY ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_RESEND_API_KEY);
  if (!apiKey || apiKey === "re_123456789_placeholder") {
    return null;
  }
  return new Resend(apiKey);
}

function formatDatePretty(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates modern dark/gold HTML for the customer's appointment confirmation email.
 */
function buildCustomerEmailHtml(data: BookingEmailPayload): string {
  const prettyDate = formatDatePretty(data.date);
  const locationText = "1430 Kona St #105, Honolulu, HI 96814";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed - Tom's Barber</title>
</head>
<body style="margin:0; padding:0; background-color:#0d0d0e; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#e4e4e7;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0d0d0e; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background-color:#141416; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align:center; border-bottom:1px solid #27272a; background: linear-gradient(180deg, #1f1f23 0%, #141416 100%);">
              <h1 style="margin:0; font-family:'Georgia', serif; font-size:26px; font-weight:700; color:#d4af37; letter-spacing: 0.05em; text-transform:uppercase;">
                Tom's Barber
              </h1>
              <p style="margin:6px 0 0; font-size:12px; text-transform:uppercase; letter-spacing:0.2em; color:#a1a1aa;">
                Honolulu • Premium Grooming
              </p>
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding: 32px 32px 16px; text-align:center;">
              <div style="display:inline-block; width:52px; height:52px; line-height:52px; border-radius:50%; background-color:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:#d4af37; font-size:24px; margin-bottom:16px;">
                ✓
              </div>
              <h2 style="margin:0; font-family:'Georgia', serif; font-size:22px; color:#ffffff; font-weight:600;">
                Your Appointment is Confirmed!
              </h2>
              <p style="margin:8px 0 0; font-size:14px; color:#a1a1aa;">
                Hi <strong style="color:#ffffff;">${escapeHtml(data.customerName)}</strong>, we’ve reserved your chair. Below are your booking details.
              </p>
            </td>
          </tr>

          <!-- Reference Code Box -->
          <tr>
            <td style="padding: 0 32px 24px;" align="center">
              <div style="background-color:rgba(212,175,55,0.08); border:1px dashed #d4af37; border-radius:12px; padding:16px 24px; text-align:center; display:inline-block; min-width:240px;">
                <span style="display:block; font-size:11px; text-transform:uppercase; letter-spacing:0.18em; color:#a1a1aa; font-weight:600; margin-bottom:4px;">
                  Booking Reference
                </span>
                <span style="font-family:'Georgia', serif; font-size:28px; font-weight:bold; color:#d4af37; letter-spacing:0.1em;">
                  ${escapeHtml(data.reference)}
                </span>
              </div>
            </td>
          </tr>

          <!-- Booking Summary Table -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#1a1a1e; border:1px solid #27272a; border-radius:12px; padding:16px;">
                <tr>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#a1a1aa; font-size:13px; font-weight:500;">Service</td>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#ffffff; font-size:14px; font-weight:600; text-align:right;">
                    ${escapeHtml(data.serviceName)} <span style="color:#d4af37; font-size:13px;">($${data.servicePrice})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#a1a1aa; font-size:13px; font-weight:500;">Barber</td>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#ffffff; font-size:14px; font-weight:600; text-align:right;">
                    ${escapeHtml(data.barberName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#a1a1aa; font-size:13px; font-weight:500;">Date</td>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#ffffff; font-size:14px; font-weight:600; text-align:right;">
                    ${escapeHtml(prettyDate)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#a1a1aa; font-size:13px; font-weight:500;">Time</td>
                  <td style="padding:10px 8px; border-bottom:1px solid #27272a; color:#d4af37; font-size:14px; font-weight:bold; text-align:right;">
                    ${escapeHtml(data.time)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 8px; color:#a1a1aa; font-size:13px; font-weight:500;">Location</td>
                  <td style="padding:10px 8px; color:#ffffff; font-size:13px; text-align:right;">
                    ${escapeHtml(locationText)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reminder -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <div style="background-color:#1a1a1e; border-left:3px solid #d4af37; padding:14px 16px; border-radius:0 8px 8px 0; font-size:13px; color:#d4d4d8;">
                <strong style="color:#d4af37;">Please Note:</strong> We kindly request that you arrive 5 minutes before your scheduled appointment time.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align:center; background-color:#0f0f11; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.6;">
              <p style="margin:0 0 6px;">Questions or need to reschedule? Simply reply to this email or call us directly.</p>
              <p style="margin:0; font-weight:500; color:#a1a1aa;">Tom's Barber • 1430 Kona St #105, Honolulu, HI 96814</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generates clear notification HTML for the shop owner/barber.
 */
function buildOwnerEmailHtml(data: BookingEmailPayload): string {
  const prettyDate = formatDatePretty(data.date);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Appointment Notification</title>
</head>
<body style="margin:0; padding:0; background-color:#0d0d0e; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#e4e4e7;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0d0d0e; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background-color:#141416; border:1px solid #27272a; border-radius:16px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color:#d4af37; color:#000000; text-align:left;">
              <h2 style="margin:0; font-size:20px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">
                ✂️ New Appointment Alert
              </h2>
              <p style="margin:4px 0 0; font-size:13px; font-weight:600; opacity:0.9;">
                Reference: ${escapeHtml(data.reference)}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px;">
              <h3 style="margin:0 0 16px; font-size:16px; color:#ffffff; border-bottom:1px solid #27272a; padding-bottom:8px;">
                Customer Info
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px; font-size:14px;">
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa; width:110px;">Name:</td>
                  <td style="padding:6px 0; color:#ffffff; font-weight:bold;">${escapeHtml(data.customerName)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa;">Phone:</td>
                  <td style="padding:6px 0;">
                    <a href="tel:${escapeHtml(data.customerPhone)}" style="color:#d4af37; text-decoration:none; font-weight:bold;">${escapeHtml(data.customerPhone)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa;">Email:</td>
                  <td style="padding:6px 0;">
                    <a href="mailto:${escapeHtml(data.customerEmail)}" style="color:#d4af37; text-decoration:none;">${escapeHtml(data.customerEmail)}</a>
                  </td>
                </tr>
                ${
                  data.notes
                    ? `
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa; vertical-align:top;">Notes:</td>
                  <td style="padding:6px 0; color:#e4e4e7; font-style:italic;">${escapeHtml(data.notes)}</td>
                </tr>
                `
                    : ""
                }
              </table>

              <h3 style="margin:0 0 16px; font-size:16px; color:#ffffff; border-bottom:1px solid #27272a; padding-bottom:8px;">
                Appointment Info
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:14px;">
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa; width:110px;">Service:</td>
                  <td style="padding:6px 0; color:#ffffff; font-weight:bold;">${escapeHtml(data.serviceName)} ($${data.servicePrice})</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa;">Barber:</td>
                  <td style="padding:6px 0; color:#ffffff;">${escapeHtml(data.barberName)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa;">Date:</td>
                  <td style="padding:6px 0; color:#ffffff; font-weight:bold;">${escapeHtml(prettyDate)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#a1a1aa;">Time:</td>
                  <td style="padding:6px 0; color:#d4af37; font-weight:bold; font-size:15px;">${escapeHtml(data.time)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color:#18181b; text-align:center; font-size:12px; color:#71717a;">
              Tom's Barber Automated Booking Notification System
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sends both the customer confirmation email and the shop owner notification email in parallel.
 */
export async function sendBookingEmails(payload: BookingEmailPayload): Promise<{
  customerEmailSuccess: boolean;
  ownerEmailSuccess: boolean;
  error?: string;
}> {
  const resend = getResendClient();

  if (!resend) {
    console.log(
      `[Resend Email Notice] RESEND_API_KEY is not configured in .env. Skipping real email delivery for booking ref: ${payload.reference}`,
    );
    return {
      customerEmailSuccess: false,
      ownerEmailSuccess: false,
      error: "RESEND_API_KEY missing or not set",
    };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_RESEND_FROM_EMAIL) ||
    "Tom's Barber <appointments@tomsbarber.website>";

  const ownerEmail =
    process.env.SHOP_OWNER_EMAIL ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SHOP_OWNER_EMAIL) ||
    "thetxtbarbersone@gmail.com";

  try {
    const [customerRes, ownerRes] = await Promise.allSettled([
      resend.emails.send({
        from: fromEmail,
        to: payload.customerEmail,
        subject: `✂️ Appointment Confirmed - Tom's Barber [Ref: ${payload.reference}]`,
        html: buildCustomerEmailHtml(payload),
      }),
      resend.emails.send({
        from: fromEmail,
        to: ownerEmail,
        subject: `🚨 NEW BOOKING: ${payload.customerName} - ${payload.date} at ${payload.time}`,
        html: buildOwnerEmailHtml(payload),
      }),
    ]);

    const customerSuccess = customerRes.status === "fulfilled" && !customerRes.value.error;
    const ownerSuccess = ownerRes.status === "fulfilled" && !ownerRes.value.error;

    if (
      customerRes.status === "rejected" ||
      (customerRes.status === "fulfilled" && customerRes.value.error)
    ) {
      const err = customerRes.status === "rejected" ? customerRes.reason : customerRes.value.error;
      console.error("[Resend] Error sending customer confirmation email:", err);
    }

    if (
      ownerRes.status === "rejected" ||
      (ownerRes.status === "fulfilled" && ownerRes.value.error)
    ) {
      const err = ownerRes.status === "rejected" ? ownerRes.reason : ownerRes.value.error;
      console.error("[Resend] Error sending shop owner notification email:", err);
    }

    return {
      customerEmailSuccess: customerSuccess,
      ownerEmailSuccess: ownerSuccess,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Resend] Unexpected error while sending booking emails:", err);
    return {
      customerEmailSuccess: false,
      ownerEmailSuccess: false,
      error: msg,
    };
  }
}
