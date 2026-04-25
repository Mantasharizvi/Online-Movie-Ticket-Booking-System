const https = require('https');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    let { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("Payment Order Creation Error: Invalid amount received", amount);
      return res.status(400).json({ error: "Invalid payment amount. Amount must be a positive number." });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("CRITICAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env");
      return res.status(500).json({ error: "Payment gateway configuration missing on server" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay works in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    // --- DIRECT REST API CALL (Bypassing the buggy SDK) ---
    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    
    const requestData = JSON.stringify(options);
    
    const apiOptions = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Length': requestData.length
      }
    };

    const apiReq = https.request(apiOptions, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
            res.json(response);
          } else {
            console.error("Razorpay API Error:", response);
            res.status(apiRes.statusCode).json(response);
          }
        } catch (e) {
          console.error("Failed to parse Razorpay response:", data);
          res.status(500).json({ error: "Invalid response from Razorpay" });
        }
      });
    });

    apiReq.on('error', (error) => {
      console.error("Razorpay Network Error:", error);
      res.status(500).json({ error: "Connection to Razorpay failed" });
    });

    apiReq.write(requestData);
    apiReq.end();

  } catch (error) {
    console.error("Payment Order Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Payment verification configuration missing" });
    }

    // Create signature to cross-verify
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({ success: true, message: "Payment verified securely" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
