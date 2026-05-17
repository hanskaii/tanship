export interface PurchaseConfirmationData {
	planName: string;
	licenseKey: string;
	userName: string;
	billingUrl: string;
}

export const purchaseConfirmationTemplate = (
	data: PurchaseConfirmationData
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your ${data.planName} License Key</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 16px; }
    .container { max-width: 560px; margin: 0 auto; background: #111111; border-radius: 12px; border: 1px solid #1e1e1e; overflow: hidden; }
    .header { background: #161616; border-bottom: 1px solid #1e1e1e; padding: 28px 32px; }
    .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .logo-icon { width: 24px; height: 24px; background: #7c3aed; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .logo-name { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; color: #f5f5f5; }
    .body { padding: 32px; }
    h1 { font-size: 20px; font-weight: 700; color: #f5f5f5; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 28px; }
    .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-bottom: 8px; }
    .license-box { background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 600; letter-spacing: 0.05em; color: #a78bfa; word-break: break-all; line-height: 1.5; }
    .steps { background: #0d0d0d; border: 1px solid #1e1e1e; border-radius: 8px; overflow: hidden; margin-bottom: 28px; }
    .step { display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #1a1a1a; }
    .step:last-child { border-bottom: none; }
    .step-num { width: 20px; height: 20px; background: #1e1e1e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #888; flex-shrink: 0; margin-top: 1px; }
    .step-text { font-size: 13px; color: #aaa; line-height: 1.5; }
    .step-text strong { color: #e5e5e5; }
    .cta { display: block; background: #7c3aed; color: #fff !important; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 28px; }
    .footer { font-size: 11px; color: #444; line-height: 1.6; border-top: 1px solid #1a1a1a; padding: 20px 32px; }
    a { color: #a78bfa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <span class="logo-name">Tanship</span>
      </div>
    </div>
    <div class="body">
      <h1>You're in, ${data.userName}! 🎉</h1>
      <p class="subtitle">Thanks for purchasing <strong>${data.planName}</strong>. Your license key is below — keep it safe.</p>

      <p class="label">Your License Key</p>
      <div class="license-box">${data.licenseKey}</div>

      <p class="label">Next Steps</p>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Copy your license key</strong> above and store it somewhere safe (password manager, notes, etc.)</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">Go to your <strong><a href="${data.billingUrl}">Billing page</a></strong> and enter your GitHub username to claim repository access.</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Accept the GitHub invitation</strong> you'll receive separately from GitHub — gives you access to the private repo.</div>
        </div>
      </div>

      <a href="${data.billingUrl}" class="cta">Claim Your GitHub Access →</a>

      <p style="font-size: 12px; color: #555;">Questions? Reply to this email and we'll help you out.</p>
    </div>
    <div class="footer">
      © 2026 Tanship — You're receiving this because you purchased ${data.planName}.
    </div>
  </div>
</body>
</html>`;
