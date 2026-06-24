const nodemailer = require("nodemailer");

// Create reusable transporter
// Transporter = the email sending engine
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,  // your gmail
      pass: process.env.EMAIL_PASS   // app password
    }
  });
};


// ─────────────────────────────────────
// Send email to a single recipient
// ─────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Blood Donor Finder 🩸" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return false;  // don't crash app if email fails
  }
};


// ─────────────────────────────────────
// Send emergency request email to donor
// ─────────────────────────────────────
const sendEmergencyEmail = async ({ donorEmail, donorName, request, requester }) => {

  const urgencyColor = {
    normal: "#28a745",    // green
    urgent: "#fd7e14",    // orange
    critical: "#dc3545"   // red
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .body { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .urgency-badge { 
          display: inline-block;
          padding: 5px 15px; 
          border-radius: 20px; 
          color: white;
          font-weight: bold;
          background-color: ${urgencyColor[request.urgency]};
        }
        .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .info-row { display: flex; margin: 8px 0; }
        .label { font-weight: bold; width: 140px; color: #555; }
        .value { color: #333; }
        .blood-group { 
          font-size: 48px; 
          font-weight: bold; 
          color: #dc3545; 
          text-align: center;
          padding: 10px;
        }
        .btn { 
          display: block;
          background-color: #dc3545; 
          color: white; 
          padding: 15px 30px; 
          text-align: center;
          border-radius: 8px; 
          text-decoration: none;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <h1>🩸 Emergency Blood Request</h1>
        </div>

        <div class="body">
          <p>Dear <strong>${donorName}</strong>,</p>
          <p>Someone urgently needs your blood. You can save a life today.</p>

          <div class="blood-group">${request.bloodGroup}</div>

          <div style="text-align:center; margin-bottom:15px;">
            <span class="urgency-badge">
              ${request.urgency.toUpperCase()} 🚨
            </span>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="label">🏥 Hospital:</span>
              <span class="value">${request.hospital}</span>
            </div>
            <div class="info-row">
              <span class="label">📍 Location:</span>
              <span class="value">${request.city}, ${request.state}</span>
            </div>
            <div class="info-row">
              <span class="label">👤 Patient:</span>
              <span class="value">${requester.name}</span>
            </div>
            <div class="info-row">
              <span class="label">📞 Contact:</span>
              <span class="value">${requester.phone}</span>
            </div>
            ${request.message ? `
            <div class="info-row">
              <span class="label">💬 Message:</span>
              <span class="value">${request.message}</span>
            </div>
            ` : ""}
          </div>

          <p>If you are available to donate, please contact the patient directly or login to respond through the app.</p>

          <div class="footer">
            <p>Blood Donor Finder — Saving lives together 🩸</p>
            <p>If you don't want to receive these emails, update your availability in the app.</p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: donorEmail,
    subject: `🚨 Urgent: ${request.bloodGroup} blood needed at ${request.hospital}, ${request.city}`,
    html
  });
};


// ─────────────────────────────────────
// Send confirmation email to requester
// ─────────────────────────────────────
const sendRequestConfirmation = async ({ requesterEmail, requesterName, donorsCount, request }) => {

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; padding: 20px; text-align: center; border-radius: 8px; }
        .header h1 { color: white; margin: 0; }
        .body { padding: 20px; }
        .count { font-size: 48px; font-weight: bold; color: #28a745; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Request Sent Successfully</h1>
        </div>
        <div class="body">
          <p>Dear <strong>${requesterName}</strong>,</p>
          <p>Your blood request has been sent to matching donors.</p>
          
          <div class="count">${donorsCount}</div>
          <p style="text-align:center;">donors have been notified</p>

          <p><strong>Request Details:</strong></p>
          <p>Blood Group: ${request.bloodGroup}</p>
          <p>Hospital: ${request.hospital}</p>
          <p>City: ${request.city}</p>
          <p>Urgency: ${request.urgency}</p>

          <p>Donors will contact you directly on your registered phone number.</p>
          <p>Stay calm. Help is on the way. 🙏</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: requesterEmail,
    subject: `✅ Blood request sent — ${donorsCount} donors notified`,
    html
  });
};


module.exports = { 
  sendEmail, 
  sendEmergencyEmail,
  sendRequestConfirmation
};