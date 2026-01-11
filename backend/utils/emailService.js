const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email when admin responds to quote
exports.sendQuoteResponseEmail = async (quote) => {
  try {
    const recipientEmail = quote.client ? quote.client.email : quote.guestInfo.email;
    const recipientName = quote.client ? quote.client.name : quote.guestInfo.name;
    
    const statusEmojis = {
      'reviewing': '👀',
      'quoted': '💰',
      'accepted': '✅',
      'in_progress': '🚀',
      'revision_requested': '🔄',
      'completed': '🎉',
      'rejected': '❌'
    };
    
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #1C4D8C, #50c2f7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
          .status-reviewing { background: #2196F3; color: white; }
          .status-quoted { background: #9C27B0; color: white; }
          .status-accepted { background: #4CAF50; color: white; }
          .status-rejected { background: #f44336; color: white; }
          .info-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #50c2f7; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #50c2f7; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quote Request Update</h1>
            <p>Your quote has been ${quote.status === 'quoted' ? 'reviewed' : 'updated'}!</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Good news! We've updated your quote request for "<strong>${quote.projectName}</strong>".</p>
            
            <div class="status-badge status-${quote.status}">
              ${statusEmojis[quote.status] || '📋'} Status: ${quote.status.replace('_', ' ').toUpperCase()}
            </div>
            
            <div class="info-box">
              <p><strong>Project:</strong> ${quote.projectName}</p>
              <p><strong>Service:</strong> ${quote.service.name}</p>
              ${quote.quotedPrice > 0 ? `<p><strong>Quoted Price:</strong> ₱${quote.quotedPrice.toLocaleString()}</p>` : ''}
              <p><strong>Deadline:</strong> ${new Date(quote.deadline).toLocaleDateString()}</p>
            </div>
            
            ${quote.adminNotes ? `
              <h3>Message from Jefrey:</h3>
              <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; border-radius: 5px;">
                ${quote.adminNotes}
              </p>
            ` : ''}
            
            ${!quote.client ? `
              <p style="margin-top: 30px;">
                <strong>Want to track your quote in real-time?</strong><br>
                Create a free account to view updates and manage your projects!
              </p>
              <a href="http://localhost:5500/register.html" class="button">Create Account</a>
            ` : `
              <a href="http://localhost:5500/client-dashboard.html" class="button">View Dashboard</a>
            `}
            
            <div class="footer">
              <p>Questions? Reply to this email or contact us at:<br>
              📧 ${process.env.EMAIL_USER}<br>
              📱 +63 995 330 5063</p>
              <p style="margin-top: 20px;">© 2026 Jefrey Jurado Design. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `${statusEmojis[quote.status]} Your Quote Request Update - ${quote.projectName}`,
      html: emailHTML
    });
    
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};