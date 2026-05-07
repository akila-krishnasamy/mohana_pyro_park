import User from '../models/User.js';
import { sendTwilioMessage, formatIndianPhone } from '../services/twilioService.js';
import { sendOfferEmail } from '../services/emailService.js';

const ALLOWED_CAMPAIGN_TYPES = ['offer', 'voucher', 'reminder'];
const ALLOWED_CHANNELS = ['sms', 'whatsapp', 'email'];
const EMAIL_BATCH_SIZE = Number(process.env.EMAIL_BATCH_SIZE || 10);

// @desc    Get campaign recipients summary
// @route   GET /api/campaigns/recipients
// @access  Private/Manager+
export const getCampaignRecipientsSummary = async (req, res, next) => {
  try {
    const allCustomers = await User.find({
      role: 'customer',
      isActive: true
    }).select('phone email');

    const validPhone = allCustomers.filter((u) => u.phone && formatIndianPhone(u.phone));
    const validEmail = allCustomers.filter((u) => u.email && u.email.includes('@'));

    res.json({
      success: true,
      totalCustomers: allCustomers.length,
      validNumbers: validPhone.length,
      validEmails: validEmail.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get campaign recipient list
// @route   GET /api/campaigns/recipients/list
// @access  Private/Manager+
export const getCampaignRecipientsList = async (req, res, next) => {
  try {
    const { search = '', limit = 300 } = req.query;

    const query = {
      role: 'customer',
      isActive: true
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const recipients = await User.find(query)
      .select('name phone email')
      .sort({ name: 1 })
      .limit(Math.min(Number(limit) || 300, 1000));

    const mappedRecipients = recipients.map((user) => ({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      isValidPhone: Boolean(formatIndianPhone(user.phone)),
      isValidEmail: Boolean(user.email && user.email.includes('@'))
    }));

    res.json({
      success: true,
      count: mappedRecipients.length,
      recipients: mappedRecipients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send campaign message to all registered customers
// @route   POST /api/campaigns/send
// @access  Private/Manager+
export const sendCampaignToCustomers = async (req, res, next) => {
  try {
    let parsedRecipientIds = [];
    if (Array.isArray(req.body.recipientIds)) {
      parsedRecipientIds = req.body.recipientIds;
    } else if (typeof req.body.recipientIds === 'string' && req.body.recipientIds.trim()) {
      try {
        const decoded = JSON.parse(req.body.recipientIds);
        if (Array.isArray(decoded)) {
          parsedRecipientIds = decoded;
        }
      } catch {
        parsedRecipientIds = req.body.recipientIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);
      }
    }

    const uploadedMediaUrl = req.file
      ? `${req.protocol}://${req.get('host')}/api/uploads/campaigns/${req.file.filename}`
      : '';

    const {
      campaignType,
      title,
      message,
      mediaUrl,
      channel = 'sms'
    } = req.body;

    // Always use the already-parsed array; req.body.recipientIds is a raw JSON string
    const recipientIds = parsedRecipientIds;

    const finalMediaUrl = uploadedMediaUrl || mediaUrl;

    if (!ALLOWED_CAMPAIGN_TYPES.includes(campaignType)) {
      return res.status(400).json({
        success: false,
        message: 'campaignType must be one of: offer, voucher, reminder'
      });
    }

    if (!ALLOWED_CHANNELS.includes(channel)) {
      return res.status(400).json({
        success: false,
        message: 'channel must be sms, whatsapp or email'
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (finalMediaUrl) {
      try {
        new URL(finalMediaUrl);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'mediaUrl must be a valid URL'
        });
      }
    }

    // Build recipient query based on channel
    const isEmail = channel === 'email';

    if (isEmail && !process.env.SMTP_PASS) {
      return res.status(400).json({
        success: false,
        message: 'Email channel is not configured. Please set SMTP_PASS in backend .env'
      });
    }

    const query = { role: 'customer', isActive: true };

    if (isEmail) {
      query.email = { $exists: true, $ne: '' };
    } else {
      query.phone = { $exists: true, $ne: '' };
    }

    if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      query._id = { $in: recipientIds };
    }

    const customers = await User.find(query).select('name phone email');

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: isEmail
          ? 'No registered customers with email addresses found'
          : 'No registered customers with phone numbers found'
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failures = [];

    if (isEmail) {
      // ── EMAIL CHANNEL ──
      const emailSubject = title
        ? title.trim()
        : `${campaignType.charAt(0).toUpperCase() + campaignType.slice(1)} from Mohana Pyro Park`;

      const imageHtml = finalMediaUrl
        ? `<div style="text-align:center;margin:16px 0;"><img src="${finalMediaUrl}" alt="Campaign Image" style="max-width:480px;border-radius:8px;" /></div>`
        : '';

      const bodyHtml = `
        <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;max-width:600px;margin:0 auto;">
          <div style="background:#dc2626;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h2 style="color:#fff;margin:0;">Mohana Pyro Park</h2>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            ${imageHtml}
            <p>Hi {{name}},</p>
            <p style="white-space:pre-line;">${String(message).trim()}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
            <p style="font-size:12px;color:#6b7280;">Mohana Pyro Park — Quality Fireworks at the Best Price</p>
          </div>
        </div>`;

      for (let i = 0; i < customers.length; i += EMAIL_BATCH_SIZE) {
        const batch = customers.slice(i, i + EMAIL_BATCH_SIZE);

        const batchResults = await Promise.all(
          batch.map(async (customer) => {
            if (!customer.email) {
              return {
                success: false,
                customer: customer.name,
                email: customer.email,
                reason: 'No email address'
              };
            }

            try {
              const personalHtml = bodyHtml.replace('{{name}}', customer.name || 'Customer');
              const result = await sendOfferEmail({
                to: customer.email,
                customerName: customer.name,
                subject: emailSubject,
                html: personalHtml
              });

              if (result.skipped) {
                return {
                  success: false,
                  customer: customer.name,
                  email: customer.email,
                  reason: result.reason
                };
              }

              return {
                success: true,
                customer: customer.name,
                email: customer.email
              };
            } catch (err) {
              return {
                success: false,
                customer: customer.name,
                email: customer.email,
                reason: err.message
              };
            }
          })
        );

        for (const result of batchResults) {
          if (result.success) {
            sentCount += 1;
          } else {
            failedCount += 1;
            failures.push({
              customer: result.customer,
              email: result.email,
              reason: result.reason
            });
          }
        }
      }
    } else {
      // ── SMS / WHATSAPP CHANNEL ──
      const campaignHeader = title
        ? `*${title.trim()}*\n`
        : `*${campaignType.toUpperCase()}*\n`;

      const fullMessage = `${campaignHeader}${String(message).trim()}`;

      for (const customer of customers) {
        try {
          const sendResult = await sendTwilioMessage({
            toPhone: customer.phone,
            body: fullMessage,
            mediaUrl: finalMediaUrl,
            channel
          });

          if (sendResult.success) {
            sentCount += 1;
          } else {
            failedCount += 1;
            failures.push({
              customer: customer.name,
              phone: customer.phone,
              reason: sendResult.error,
              code: sendResult.code || null
            });
          }
        } catch (error) {
          failedCount += 1;
          failures.push({
            customer: customer.name,
            phone: customer.phone,
            reason: error.message
          });
        }
      }
    }

    const firstFailureReason = failures[0]?.reason;
    const summaryMessage = failedCount > 0 && firstFailureReason
      ? `Campaign completed. Sent: ${sentCount}, Failed: ${failedCount}. First error: ${firstFailureReason}`
      : `Campaign completed. Sent: ${sentCount}, Failed: ${failedCount}`;

    res.json({
      success: true,
      message: summaryMessage,
      totals: {
        customers: customers.length,
        sent: sentCount,
        failed: failedCount
      },
      failures: failures.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};
