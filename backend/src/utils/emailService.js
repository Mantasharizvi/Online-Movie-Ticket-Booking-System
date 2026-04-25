const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a professional booking confirmation email
 * @param {Object} bookingDetails - { userEmail, userName, movieTitle, theaterName, showTime, seats, totalAmount, bookingId }
 */
exports.sendBookingEmail = async (details) => {
  const { userEmail, userName, movieTitle, theaterName, showTime, seats, totalAmount, bookingId } = details;

  const seatString = seats.map(s => `${s.row}${s.number}`).join(', ');
  const formattedDate = new Date(showTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; mx-auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: linear-gradient(135deg, #c084fc 0%, #d946ef 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background-color: #fcfcfc; }
        .ticket-box { background: white; border: 2px dashed #ddd; padding: 20px; border-radius: 10px; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #888; padding: 20px; }
        .label { font-weight: bold; color: #555; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
        .value { font-size: 16px; margin-bottom: 15px; color: #000; }
        .total { font-size: 20px; font-weight: bold; color: #d946ef; border-top: 1px solid #eee; pt: 10px; margin-top: 10px; }
        .btn { display: inline-block; padding: 12px 25px; background-color: #d946ef; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;">Booking Confirmed!</h1>
          <p style="margin:5px 0 0; opacity:0.8;">Get ready for the show, ${userName}</p>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Your ticket has been successfully booked. Please present this email at the cinema entrance.</p>
          
          <div class="ticket-box">
            <div class="label">Movie</div>
            <div class="value" style="font-size:22px; font-weight:800;">${movieTitle}</div>
            
            <div style="display:flex; justify-content:space-between;">
              <div style="flex:1;">
                <div class="label">Date & Time</div>
                <div class="value">${formattedDate}</div>
              </div>
            </div>

            <div class="label">Theater & Venue</div>
            <div class="value">${theaterName}</div>

            <div style="display:flex; justify-content:space-between;">
              <div style="flex:1;">
                <div class="label">Seats</div>
                <div class="value">${seatString}</div>
              </div>
              <div style="flex:1; text-align:right;">
                <div class="label">Booking ID</div>
                <div class="value">#${bookingId.toString().slice(-8).toUpperCase()}</div>
              </div>
            </div>

            <div class="total">
              Total Paid: ₹${totalAmount}
            </div>
          </div>

          <p style="margin-top:30px;">Enjoy your movie! If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
          &copy; 2026 Cinemate Movie Booking. All rights reserved.<br>
          This is an automated receipt. Please do not reply to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Cinemate Bookings" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🍿 Booking Confirmed: ${movieTitle}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
