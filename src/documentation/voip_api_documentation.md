
# 📞 VoIP API - Backend Routes Summary

Base URL: `http://127.0.0.1:5000/api`

---

## 📁 Contacts (`/contacts`)
| Method | Endpoint                | Description                | Body Required |
|--------|-------------------------|----------------------------|---------------|
| GET    | `/`                     | Get paginated contacts     | No            |
| GET    | `/all`                  | Get all contacts           | No            |
| GET    | `/<int:contact_id>`     | Get single contact         | No            |
| POST   | `/`                     | Create a new contact       | Yes           |
| PUT    | `/<int:contact_id>`     | Update a contact           | Yes           |
| DELETE | `/<int:contact_id>`     | Delete a contact           | No            |
| DELETE | `/bulk-delete`          | Bulk delete contacts       | Yes           |

**Bulk Delete Body Example:**
```json
{
  "ids": [1, 2, 3]
}
```

---

## 🏢 Organizations (`/organizations`)
| Method | Endpoint         | Description               | Body Required |
|--------|------------------|---------------------------|---------------|
| DELETE | `/bulk-delete`    | Bulk delete organizations | Yes           |

---

## 📌 Statuses (`/statuses`)
| Method | Endpoint         | Description          | Body Required |
|--------|------------------|----------------------|---------------|
| DELETE | `/bulk-delete`    | Bulk delete statuses | Yes           |

---

## 📋 Calling Lists (`/callinglists`)
| Method | Endpoint                  | Description                  | Body Required |
|--------|----------------------------|------------------------------|---------------|
| DELETE | `/<int:calling_list_id>`    | Delete a single calling list | No            |
| DELETE | `/bulk-delete`              | Bulk delete calling lists    | Yes           |

---

## 📞 Call Logs (`/calllogs`)
| Method | Endpoint         | Description           | Body Required |
|--------|------------------|-----------------------|---------------|
| DELETE | `/bulk-delete`    | Bulk delete call logs | Yes           |

**Bulk Delete Body Example (for Organizations, Statuses, Calling Lists, Call Logs):**
```json
{
  "ids": [1, 2, 3]
}
```

---

# ✅ Notes for Frontend Developers:
- Always send `Content-Type: application/json` header.
- For all bulk-delete operations, provide a body with an `"ids"` array.
- If an ID does not exist, the server will return `404 Not Found`.
- All API responses are in JSON format.
