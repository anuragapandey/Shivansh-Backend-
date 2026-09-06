import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const canSendEmail = Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM)

const transporter = canSendEmail
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED,
      },
    })
  : null

const formatItems = (items) =>
  items
    .map((item) => `${item.name} (${item.weight}) x ${item.quantity || item.qty} - Rs. ${item.price}`)
    .join('\n')

const formatItemRows = (items) =>
  items
    .map((item) => {
      const quantity = item.quantity || item.qty
      const total = item.price * quantity

      return `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #f0dfbd;">
            <strong>${item.name}</strong><br>
            <span style="color:#7a5a49;font-size:13px;">${item.weight}</span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #f0dfbd;text-align:center;">${quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #f0dfbd;text-align:right;">Rs. ${item.price}</td>
          <td style="padding:12px;border-bottom:1px solid #f0dfbd;text-align:right;"><strong>Rs. ${total}</strong></td>
        </tr>
      `
    })
    .join('')

const orderHtml = ({ order, items, title, intro, deliveryLocation, isStoreCopy = false }) => `
  <!doctype html>
  <html>
    <body style="margin:0;background:#fff8e7;font-family:Arial,Helvetica,sans-serif;color:#32150e;">
      <div style="max-width:680px;margin:0 auto;padding:24px;">
        <div style="background:#8f2118;color:#fff8e7;padding:22px;border-radius:18px 18px 0 0;">
          <div style="font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Shivansh Snacks</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.15;">${title}</h1>
        </div>
        <div style="background:#fffdf7;border:1px solid #ead7af;border-top:0;padding:22px;border-radius:0 0 18px 18px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">${intro}</p>

          <div style="display:grid;gap:10px;background:#fff4d4;border-radius:14px;padding:16px;margin-bottom:18px;">
            <div><strong>Order ID:</strong> ${order.id}</div>
            <div><strong>Mobile:</strong> ${order.customer?.phone || 'N/A'}</div>
            <div><strong>Email:</strong> ${order.customer?.email || 'N/A'}</div>
            <div><strong>Delivery location:</strong> ${deliveryLocation}</div>
          </div>

          <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #f0dfbd;border-radius:12px;overflow:hidden;">
            <thead>
              <tr style="background:#f5b72f;color:#32150e;">
                <th style="padding:12px;text-align:left;">Item</th>
                <th style="padding:12px;text-align:center;">Qty</th>
                <th style="padding:12px;text-align:right;">Price</th>
                <th style="padding:12px;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${formatItemRows(items)}</tbody>
          </table>

          <div style="margin-top:18px;text-align:right;font-size:20px;font-weight:900;color:#8f2118;">
            Grand Total: Rs. ${order.subtotal}
          </div>

          <p style="margin:20px 0 0;color:#684437;font-size:14px;line-height:1.6;">
            ${
              isStoreCopy
                ? 'Please contact the customer to confirm delivery and payment.'
                : 'We received your order. Our team will contact you soon for delivery and payment confirmation.'
            }
          </p>
        </div>
      </div>
    </body>
  </html>
`

const storeEmail = 'shivanshsnacks@gmail.com'

export async function sendOrderEmails(order, items) {
  if (!transporter) return

  const customerEmail = order.customer?.email
  const deliveryLocation = order.customer?.location || order.customer?.address || 'N/A'
  const customerText = [
    'Thank you for ordering from Shivansh Snacks.',
    '',
    `Order ID: ${order.id}`,
    `Total: Rs. ${order.subtotal}`,
    `Mobile: ${order.customer?.phone || 'N/A'}`,
    `Delivery location: ${deliveryLocation}`,
    '',
    'Items:',
    formatItems(items),
    '',
    'We will contact you soon for delivery confirmation.',
  ].join('\n')

  const storeText = [
    'New Shivansh Snacks order received.',
    '',
    `Order ID: ${order.id}`,
    `Phone: ${order.customer?.phone || 'N/A'}`,
    `Email: ${customerEmail || 'N/A'}`,
    `Location: ${deliveryLocation}`,
    `Total: Rs. ${order.subtotal}`,
    '',
    'Items:',
    formatItems(items),
  ].join('\n')

  const customerHtml = orderHtml({
    order,
    items,
    title: 'Order Confirmation',
    intro: 'Thank you for ordering from Shivansh Snacks. Your order details are below.',
    deliveryLocation,
  })

  const storeHtml = orderHtml({
    order,
    items,
    title: 'New Order Received',
    intro: 'A new customer order has been placed from the website.',
    deliveryLocation,
    isStoreCopy: true,
  })

  const emails = [
    transporter.sendMail({
      from: env.SMTP_FROM,
      to: storeEmail,
      subject: `New order - ${order.id}`,
      text: storeText,
      html: storeHtml,
    }),
  ]

  if (customerEmail) {
    emails.push(
      transporter.sendMail({
        from: env.SMTP_FROM,
        to: customerEmail,
        subject: `Shivansh Snacks order received - ${order.id}`,
        text: customerText,
        html: customerHtml,
      }),
    )
  }

  await Promise.allSettled(emails)
}
