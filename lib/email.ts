import { Resend } from "resend";

const FROM = "The Law Project <noreply@thelawproject.in>";

function buildHtml(body: string): string {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .map((l) => (l === "" ? "<br/>" : `<p style="margin:0 0 12px 0;line-height:1.65;">${l}</p>`))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4d65ff 0%,#3b4fd4 100%);padding:28px 36px;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">The Law Project</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">thelawproject.in</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;color:#1f2937;font-size:15px;">
            ${lines}
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 36px;"><hr style="border:none;border-top:1px solid #e5e7eb;" /></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px 28px;color:#9ca3af;font-size:12px;line-height:1.6;">
            <p style="margin:0;">© ${new Date().getFullYear()} The Law Project. All rights reserved.</p>
            <p style="margin:4px 0 0;">
              <a href="https://www.thelawproject.in" style="color:#4d65ff;text-decoration:none;">www.thelawproject.in</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEnrollmentEmail({
  to,
  courseTitle,
  emailBody,
}: {
  to: string;
  courseTitle: string;
  emailBody: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping enrollment email");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your enrollment is confirmed — ${courseTitle}`,
    html: buildHtml(emailBody),
    text: emailBody,
  });

  if (error) {
    console.error("Failed to send enrollment email:", error);
    throw new Error(typeof error === "object" ? JSON.stringify(error) : String(error));
  }
}
