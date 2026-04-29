export interface ShowcaseNotificationData {
	submitterName: string;
	projectName: string;
	projectUrl: string;
	description: string;
	twitterHandle?: string | null;
	adminReviewUrl: string;
}

export const showcaseNotificationTemplate = (
	d: ShowcaseNotificationData
) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 16px; color: #111;">
  <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">New Showcase Submission</h2>
  <p style="font-size: 13px; color: #666; margin-top: 0;">Someone wants to be featured on the Tanflare showcase.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px;">
    <tr>
      <td style="padding: 8px 0; color: #666; width: 140px;">Submitter</td>
      <td style="padding: 8px 0; font-weight: 600;">${d.submitterName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">Project</td>
      <td style="padding: 8px 0; font-weight: 600;">${d.projectName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666;">URL</td>
      <td style="padding: 8px 0;"><a href="${d.projectUrl}" style="color: #ff6b35;">${d.projectUrl}</a></td>
    </tr>
    ${d.twitterHandle ? `<tr><td style="padding: 8px 0; color: #666;">Twitter</td><td style="padding: 8px 0;">@${d.twitterHandle}</td></tr>` : ""}
    <tr>
      <td style="padding: 8px 0; color: #666; vertical-align: top;">Description</td>
      <td style="padding: 8px 0;">${d.description}</td>
    </tr>
  </table>

  <a href="${d.adminReviewUrl}"
     style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;">
    Review in Admin Panel →
  </a>

  <p style="font-size: 11px; color: #aaa; margin-top: 32px;">Tanflare Platform — admin notification</p>
</body>
</html>`;
