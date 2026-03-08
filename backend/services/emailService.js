import transporter from '../config/mailer.js';

const sender = process.env.MAIL_FROM || 'Mohana Pyro Park <mohanapyropark@gmail.com>';

const statusLabelMap = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  'reached-hub': 'Reached Hub',
  delivered: 'Delivered',
  'picked-up': 'Picked Up',
  cancelled: 'Cancelled'
};

const canSendEmail = () => Boolean(process.env.SMTP_PASS);

const safeSend = async (mailOptions) => {
  if (!canSendEmail()) {
    return { skipped: true, reason: 'SMTP_PASS not configured' };
  }

  try {
    await transporter.sendMail(mailOptions);
    return { skipped: false };
  } catch (error) {
    return { skipped: true, reason: error.message };
  }
};

export const sendOrderStatusEmail = async ({ to, customerName, orderNumber, status }) => {
  if (!to) return { skipped: true, reason: 'No customer email' };

  const statusLabel = statusLabelMap[status] || status;

  return safeSend({
    from: sender,
    to,
    subject: `Order ${orderNumber} - ${statusLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
        <p>Hi ${customerName || 'Customer'},</p>
        <p>Your order <strong>${orderNumber}</strong> is now at <strong>${statusLabel}</strong>.</p>
        <p>Thank you for shopping with Mohana Pyro Park.</p>
      </div>
    `
  });
};

export const sendOfferEmail = async ({ to, customerName, subject, message, html }) => {
  if (!to) return { skipped: true, reason: 'No customer email' };

  const content = html || `<p>${message || 'New exciting offers are now available at Mohana Pyro Park.'}</p>`;

  return safeSend({
    from: sender,
    to,
    subject: subject || '🔥 New Offers from Mohana Pyro Park',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
        <p>Hi ${customerName || 'Customer'},</p>
        ${content}
      </div>
    `
  });
};

export const sendBulkOfferEmails = async ({ customers, subject, message, html }) => {
  const results = await Promise.all(
    customers.map((customer) =>
      sendOfferEmail({
        to: customer.email,
        customerName: customer.name,
        subject,
        message,
        html
      })
    )
  );

  const sent = results.filter((result) => !result.skipped).length;
  const skipped = results.length - sent;

  return { sent, skipped, total: results.length };
};
