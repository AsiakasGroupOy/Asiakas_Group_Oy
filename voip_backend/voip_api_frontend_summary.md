
# ✅ Backend API Status - Handoff Summary

This document summarizes the current state of the VoIP backend API as of the latest commit on the `irum` branch.

---

## 🔗 Base URL for all API requests:
```
http://127.0.0.1:5000/api
```

---

## ✅ Working Features & Endpoints

### 📁 Contacts (`/contacts`)
- [x] GET `/` — Paginated contact list
- [x] GET `/all` — All contacts
- [x] GET `/<id>` — Single contact by ID
- [x] POST `/` — Create contact
- [x] PUT `/<id>` — Update contact
- [x] DELETE `/<id>` — Delete one contact
- [x] DELETE `/bulk-delete` — Bulk delete contacts

### 🏢 Organizations (`/organizations`)
- [x] DELETE `/bulk-delete` — Bulk delete organizations

### 📌 Statuses (`/statuses`)
- [x] DELETE `/bulk-delete` — Bulk delete statuses

### 📋 Calling Lists (`/callinglists`)
- [x] DELETE `/<id>` — Delete one list
- [x] DELETE `/bulk-delete` — Bulk delete calling lists

### 📞 Call Logs (`/calllogs`)
- [x] DELETE `/bulk-delete` — Bulk delete call logs

---

## 🧪 Testing Tools
- ✅ Postman Collection file included: `voip_api_postman_collection.json`
- ✅ API documentation file: `voip_api_documentation.md`

---

## 📌 Notes for Frontend Developers
- Use `Content-Type: application/json` for all POST/PUT/DELETE requests with body.
- Bulk delete endpoints expect a JSON body like:
```json
{
  "ids": [1, 2, 3]
}
```

---

Branch: `irum`  
Maintainer: [your name or GitHub username]  
Last updated: [today's date]

