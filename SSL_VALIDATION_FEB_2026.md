# SSL Validation Instructions - Feb 2026

**Why are you receiving this?**
Cloudflare needs to verify that you still own `mosaicmagazinehi.com` before they can renew your security (SSL) certificate. This is a standard check that happens periodically or when rules change.

**Action Required:**
You need to add two "TXT" records to your DNS settings (where you bought your domain, e.g., GoDaddy, Namecheap, or Vercel if you manage DNS there).

## 1. Login to your Domain Registrar
Go to the website where you bought `mosaicmagazinehi.com`.

## 2. Add these 2 Records

### Record 1
*   **Type:** `TXT`
*   **Name (Host):** `_acme-challenge`
*   **Value:** `CSmIT53Q9L0SbIfVwGlgTfzNFFt5yHGA5VolJrJBKIU`
*   **TTL:** Lowest possible (e.g., 300 seconds or "Automatic")

### Record 2
*   **Type:** `TXT`
*   **Name (Host):** `_acme-challenge.www`
*   **Value:** `AhOV1OfTekGvojFtsw8k4Bh76wVakuBL6Ikoj0Dk-5g`
*   **TTL:** Lowest possible (e.g., 300 seconds or "Automatic")

## 3. Validate
**Wait 1-2 minutes** after adding the records, then click this link:
[Complete Validation Link](https://certvalidate.cloudflare.com/validations/txt/acme?domain=mosaicmagazinehi.com&token=CSmIT53Q9L0SbIfVwGlgTfzNFFt5yHGA5VolJrJBKIU&certificate_pack_id=a2fa9f53-82c1-4342-b186-3501cd42e522)

---
*Deadline: Saturday, February 7, 2026*
