const formatIndianPhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');

  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length > 10 && String(phone).startsWith('+')) return String(phone);

  return null;
};

const buildToAddress = (phone, channel) => {
  const normalized = formatIndianPhone(phone);
  if (!normalized) return null;
  return channel === 'whatsapp' ? `whatsapp:${normalized}` : normalized;
};

const getTwilioConfig = (channel) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const smsFrom = process.env.TWILIO_FROM_NUMBER;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

  const from = channel === 'whatsapp'
    ? (whatsappFrom || 'whatsapp:+14155238886')
    : smsFrom;

  if (!accountSid || !authToken || !from) {
    throw new Error('Missing Twilio configuration. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and sender number env vars');
  }

  return { accountSid, authToken, from };
};

export const sendTwilioMessage = async ({ toPhone, body, mediaUrl, channel = 'whatsapp' }) => {
  const { accountSid, authToken, from } = getTwilioConfig(channel);
  const to = buildToAddress(toPhone, channel);

  if (!to) {
    return {
      success: false,
      error: 'Invalid phone number'
    };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.append('To', to);
  params.append('From', from);
  params.append('Body', body);

  if (mediaUrl) {
    params.append('MediaUrl', mediaUrl);
  }

  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const result = await response.json();

  if (!response.ok) {
    const twilioCode = result.code ? ` (Twilio ${result.code})` : '';
    return {
      success: false,
      error: `${result.message || 'Twilio send failed'}${twilioCode}`,
      code: result.code
    };
  }

  return {
    success: true,
    sid: result.sid,
    status: result.status
  };
};

export { formatIndianPhone };
