# InHerify

**InHerify** ek "digital legacy vault" hai — matlab ek aisi website jaha user apne important cheezein (passwords, documents, digital will) safe rakh sakta hai, aur decide kar sakta hai ki uske baad (ya emergency mein) ye cheezein kisko milengi. Jaise ek locker hota hai bank mein, waise hi ye online locker hai digital zindagi ke liye.

## Ye project kis liye hai (in short)

Soch lo user ke paas hai: bank account passwords, crypto wallet keys, insurance papers, property documents — ye sab agar user ko kuch ho jaye to family ko kaise milega? InHerify isi problem ko solve karta hai:

1. User apne assets (passwords/accounts) aur documents (PDF, ID proof, etc.) vault mein daalta hai — encrypted rehta hai.
2. User apne trusted logo ko **"Nominee"** banata hai (jaise wife, son, lawyer) — unhe email pe verification link jaata hai.
3. User ek **Digital Will** likh sakta hai (draft → sign → publish), jisme likha hota hai ki kisko kya milega.
4. Agar kuch emergency ho, to nominees ko access mil sakta hai (admin ke through verify hone ke baad).

## Do parts mein bana hai

```
project/
├── app/          → Frontend (Next.js) — jo user ko dikhta hai
├── components/   → Reusable UI pieces (buttons, cards, forms, etc.)
├── services/     → Frontend se backend ko call karne ka layer
├── backend/      → Server (Node.js + Express) — sara real kaam yahan hota hai
│   ├── routes/   → API endpoints (login, vault, nominees, will, admin, ...)
│   ├── models/   → MongoDB database ka structure
│   └── uploads/  → Upload ki hui files yahan store hoti hain
```

- **Frontend:** Next.js + React + Tailwind CSS (dikhne wala part, sundar UI/animations ke saath)
- **Backend:** Node.js + Express (server jo requests handle karta hai)
- **Database:** MongoDB (sab data yahan save hota hai — users, assets, nominees, will, etc.)
- **Email:** Real Gmail SMTP se OTP aur verification emails jaate hain

## Features — kya kya real mein kaam karta hai

| Feature | Kya karta hai |
|---|---|
| **Signup/Login** | Email OTP verification ke saath real signup, login, forgot-password flow |
| **Vault (Assets)** | Password/account entries add-edit-delete karo, favorite maaro, nominees ke saath share karo |
| **Documents** | Real file upload (PDF, image, etc.) — preview, download, delete, share sab real hai |
| **Nominees** | Nominee add karte hi unhe email jaata hai; wo link click karke khud verify karte hain |
| **Digital Will** | Draft likho, save karo, sign karo, publish karo — har save pe version history banti hai |
| **Emergency Contacts** | Priority ke hisaab se contacts, reorder (up/down) bhi real hai |
| **Notifications** | Jab bhi koi real action hota hai (login, asset add, nominee verify, etc.) — real notification banti hai |
| **Activity Logs** | Har action ka audit trail — kaunsa action, kab, kis device/IP se hua |
| **Subscription/Billing** | Plan change real hai (Free/Pro/Legacy), lekin payment **fake hai** — Razorpay jaisa dikhne wala animation hai (spinner → success ✅) par asli payment gateway connect nahi hai |
| **Settings** | Profile edit, password change, 2FA on/off, photo upload, notification/privacy preferences — sab database mein save hota hai |
| **Admin Panel** | Alag se `/admin` — users manage karo, verification requests approve/reject karo, analytics dekho |

## Kaise chalayein (local mein)

**1. Backend setup:**
```bash
cd backend
npm install
# .env file mein DATABASE_URL, JWT_SECRET, SMTP details daalo
npm run dev
```
Backend chalega `http://localhost:4000` pe.

**2. Frontend setup:**
```bash
npm install
npm run dev
```
Frontend chalega `http://localhost:3000` pe.

Dono ek saath chalne chahiye — frontend backend se baat karta hai `http://localhost:4000/api` pe.

## Important: kya real hai, kya nahi (honest note)

- ✅ **Real:** Sab database se aata/jaata hai — koi bhi page pe dummy/mock data nahi hai. Sab CRUD (add/edit/delete) actually MongoDB mein save hota hai.
- ✅ **Real:** File upload real storage use karta hai (`backend/uploads/` folder), email real Gmail se jaata hai.
- ⚠️ **Simulated:** Payment/checkout ka "Pay" button ek fake-lekin-real-jaisa-dikhne-wala flow hai (RezoPay naam ka fake gateway) — koi asli paisa nahi kategi, sirf plan database mein update ho jaata hai.
- ⚠️ **Missing feature:** Admin ke "Verification Requests" page ke liye abhi koi user-facing form nahi hai jahan se koi document submit kare (jaise death certificate) — ye ek future feature hai jo banana baaki hai.

---

*Built with Next.js, Express, MongoDB. Made for learning/demo purpose — production mein use karne se pehle real payment gateway aur security review zaroor karo.*
