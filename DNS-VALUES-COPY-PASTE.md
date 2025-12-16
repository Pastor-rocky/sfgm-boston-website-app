# 📋 Copy-Paste DNS Values

## Record 1: Root Domain (sfgmboston.com)

**Type:**
```
ALIAS Record
```

**Host:**
```
@
```

**Value:**
```
sfgm-boston-website-app.onrender.com
```

**TTL:**
```
Automatic
```

---

## Record 2: WWW Subdomain (www.sfgmboston.com)

**Type:**
```
CNAME Record
```

**Host:**
```
www
```

**Value:**
```
sfgm-boston-website-app.onrender.com
```

**TTL:**
```
Automatic
```

---

## If ALIAS Record Not Available

Use this instead for Record 1:

**Type:**
```
A Record
```

**Host:**
```
@
```

**Value:**
```
216.24.57.1
```

**TTL:**
```
Automatic
```

---

## Quick Copy List

**ALIAS Record:**
- Host: `@`
- Value: `sfgm-boston-website-app.onrender.com`

**CNAME Record:**
- Host: `www`
- Value: `sfgm-boston-website-app.onrender.com`

**A Record (backup):**
- Host: `@`
- Value: `216.24.57.1`


