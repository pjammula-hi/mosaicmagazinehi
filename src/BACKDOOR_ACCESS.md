# Admin/Editor Backdoor Access

## 🔐 Secret Staff Login

To access the admin/editor login page (bypassing the public magic link login), use the secret URL path:

### Production URL:
```
https://www.mosaicmagazinehi.com/emoh
```

### Local Development:
```
http://localhost:5173/emoh
```

Or with hash (works on any domain):
```
https://www.mosaicmagazinehi.com/#emoh
```

### How It Works:
1. Navigate to `/emoh` (which is "home" spelled backwards)
2. The staff login form (email + password) will appear automatically
3. Enter your admin or editor credentials
4. You'll be logged in with full staff access

### Why "emoh"?
It's "home" spelled backwards - a simple, memorable backdoor that's not obvious to regular users browsing the site.

### Going Back:
Click the "← Back to Reader Login" button to return to the magic link login for students/teachers.

---

## Troubleshooting

If `/emoh` shows a 404 error:
1. Try the hash version: `https://www.mosaicmagazinehi.com/#emoh`
2. Make sure the `_redirects` file exists in the `/public` folder (for Netlify)
3. Make sure `vercel.json` exists at the root (for Vercel)
4. Redeploy your application after adding these files

**Note:** This backdoor is for admin and editor accounts only. Students and teachers should continue using the magic link authentication on the home page.
