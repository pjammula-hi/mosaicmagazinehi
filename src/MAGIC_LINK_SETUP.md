# Magic Link Email Configuration Guide

## Overview
Mosaic Magazine uses Supabase's built-in authentication with magic links. This guide will help you configure email delivery for production use.

## Quick Setup (5 minutes)

### Step 1: Enable Email Authentication in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to: `https://supabase.com/dashboard/project/leatxjnijihzjxkmhmuk`

2. **Enable Email Provider**
   - Left sidebar: **Authentication** → **Providers**
   - Find the **Email** provider
   - Toggle it **ON**
   - Set **Authentication method** to: **"Magic Link"** (or "Magic Link + Password")
   - Click **Save**

### Step 2: Configure Email Templates (Optional but Recommended)

1. **Customize Magic Link Email**
   - Go to: **Authentication** → **Email Templates**
   - Select **"Magic Link"** template
   - Customize the email template to match Mosaic Magazine branding
   - Click **Save**

### Step 3: Test with Default Email Service

Supabase provides a default email service for testing:
- **Free tier**: 3 emails per hour
- **Good for**: Initial testing and development
- **Limitation**: Emails may be delayed or go to spam

**To test:**
1. Add a test user in the Admin Dashboard
2. Try logging in with magic link
3. Check your email inbox (and spam folder)

---

## Production Setup (Recommended)

For production use, you should configure a custom SMTP provider for reliable email delivery.

### Option 1: Use Supabase's Recommended Providers

Supabase supports these email providers (no code changes needed):

#### **1. Resend** (Recommended - Modern & Simple)
- **Free tier**: 100 emails/day, 3,000/month
- **Setup**:
  1. Sign up at [resend.com](https://resend.com)
  2. Get API key
  3. In Supabase: **Project Settings** → **Auth** → **SMTP Settings**
  4. Enter Resend SMTP credentials:
     - Host: `smtp.resend.com`
     - Port: `465` or `587`
     - Username: `resend`
     - Password: `YOUR_RESEND_API_KEY`
  5. Verify domain (optional but recommended for deliverability)

#### **2. SendGrid**
- **Free tier**: 100 emails/day
- **Setup**:
  1. Sign up at [sendgrid.com](https://sendgrid.com)
  2. Create API key
  3. In Supabase SMTP settings:
     - Host: `smtp.sendgrid.net`
     - Port: `587`
     - Username: `apikey`
     - Password: `YOUR_SENDGRID_API_KEY`

#### **3. Mailgun**
- **Free tier**: 5,000 emails/month (first 3 months)
- **Setup**:
  1. Sign up at [mailgun.com](https://mailgun.com)
  2. Get SMTP credentials
  3. In Supabase SMTP settings:
     - Host: `smtp.mailgun.org`
     - Port: `587`
     - Username: `YOUR_MAILGUN_USERNAME`
     - Password: `YOUR_MAILGUN_PASSWORD`

#### **4. AWS SES** (Best for high volume)
- **Free tier**: 62,000 emails/month (if sending from EC2)
- **Setup**: [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

### Option 2: Custom SMTP Server

If your school has an SMTP server:

1. **Get SMTP credentials from IT department**
2. **Configure in Supabase**:
   - Go to: **Project Settings** → **Auth** → **SMTP Settings**
   - Enter your school's SMTP details
   - Test the connection

---

## Email Configuration in Supabase

### Navigate to SMTP Settings:
1. Supabase Dashboard → **Project Settings**
2. Click **Auth** in the left menu
3. Scroll down to **SMTP Settings**

### Configure Email Settings:

```
SMTP Host: smtp.yourprovider.com
SMTP Port: 587 (or 465 for SSL)
SMTP Username: your-username
SMTP Password: your-password
Sender Email: noreply@mosaicmagazinehi.com
Sender Name: Mosaic Magazine
```

### Test Email Configuration:
1. Click **"Send Test Email"** in Supabase dashboard
2. Enter your email address
3. Check if email arrives

---

## Email Template Customization

### Default Magic Link Email Template

Supabase sends this by default. You can customize it in **Auth** → **Email Templates**:

```html
<h2>Your Magic Link - Mosaic Magazine</h2>
<p>Click the link below to sign in:</p>
<a href="{{ .ConfirmationURL }}">Sign In to Mosaic Magazine</a>
```

### Recommended Template for Mosaic Magazine:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">MOSAIC</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Magazine</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Your Magic Link is Ready!</h2>
      
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
        Click the button below to securely access Mosaic Magazine. This link will expire in 1 hour.
      </p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="{{ .ConfirmationURL }}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          Access Mosaic Magazine
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        <strong>Security Notice:</strong> This link is unique to you and expires in 1 hour. Don't share it with anyone.
      </p>
      
      <p style="color: #9ca3af; font-size: 13px; margin: 15px 0 0 0;">
        If you didn't request this link, you can safely ignore this email.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">© 2025 Mosaic Magazine. All rights reserved.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">This is an automated message, please do not reply.</p>
    </div>
    
  </div>
</body>
</html>
```

---

## Troubleshooting

### Emails Not Arriving

1. **Check Spam Folder**
   - Magic link emails often go to spam initially
   - Mark as "Not Spam" to improve deliverability

2. **Verify SMTP Settings**
   - Go to Supabase → Project Settings → Auth → SMTP Settings
   - Click "Send Test Email"
   - Check Supabase logs for errors

3. **Check Email Quota**
   - Default Supabase email: 3 emails/hour
   - Verify you haven't hit the limit

4. **Verify Domain (Production)**
   - Add DNS records to verify your domain
   - This significantly improves deliverability

### Magic Link Not Working

1. **Link Expired**
   - Default expiry: 1 hour
   - Ask user to request a new link

2. **User Not in System**
   - User must be added by admin first
   - Check Admin Dashboard → User Management

3. **Check Browser Console**
   - Open Developer Tools → Console
   - Look for error messages

### Common Errors

**"User not found or inactive"**
- Solution: Admin must add user via Admin Dashboard first

**"Email service not configured"**
- Solution: Configure SMTP in Supabase Auth settings

**"Failed to send email"**
- Solution: Check SMTP credentials and provider status

---

## Security Best Practices

1. **Use HTTPS Only**
   - Magic links should only work over HTTPS in production

2. **Set Appropriate Expiry**
   - Default: 1 hour (recommended)
   - Configure in Supabase → Auth → Email settings

3. **Monitor Failed Attempts**
   - Check Audit Logs in Admin Dashboard
   - Look for unusual patterns

4. **Educate Users**
   - Don't share magic links
   - Report suspicious emails

---

## NYC Schools Specific Notes

### For schools.nyc.gov Email Addresses:

1. **Whitelist Supabase IPs**
   - Contact NYC DOE IT to whitelist Supabase email servers
   - Provide them with your SMTP provider's IP ranges

2. **Use NYC DOE SMTP (If Available)**
   - Some schools have access to NYC DOE SMTP servers
   - Contact your IT coordinator

3. **Email Filtering**
   - NYC DOE has strict email filters
   - May need to whitelist sender domain
   - Test with IT department first

---

## Support

### Supabase Documentation
- [Email Auth Guide](https://supabase.com/docs/guides/auth/auth-email)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

### Provider Documentation
- [Resend Docs](https://resend.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com)
- [Mailgun Docs](https://documentation.mailgun.com)

---

## Next Steps

1. ✅ Enable Email authentication in Supabase
2. ✅ Test with default email service
3. ⏳ Choose production SMTP provider
4. ⏳ Configure SMTP settings
5. ⏳ Customize email template
6. ⏳ Verify domain (optional)
7. ⏳ Test with real users

---

*Last updated: November 16, 2025*
