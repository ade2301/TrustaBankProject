#  Trusta Bank

A modern, full-featured banking web application that brings the fintech experience to life. Think of it as a digital banking platform similar to Opay and Palmpay, but built from the ground up to showcase real-world banking features and security practices.

---

##  Live Demo

Check out the live app here: https://trusta-bank.vercel.app

---

##  What is Trusta Bank?

Trusta Bank is a complete banking simulation that lets you experience modern digital banking. Here's what you can do:

- **Sign up quickly** with just an email and password
- **Get your own account number** automatically (a unique 10-digit identifier)
- **Log in securely** and stay logged in with our JWT system
- **Send money** to other users with PIN verification for safety
- **Track everything** with a complete transaction history
- **Check your balance** anytime, anywhere

This project is all about building a secure, scalable banking system—the kind you'd expect from real fintech companies.

---

##  Key Features

###  Smart Authentication
We take security seriously. You get:
- Easy registration with email and password
- Secure login that remembers you (JWT tokens)
- Sessions that stay active so you don't have to keep logging in

###  Your Own Account Number
When you sign up, you instantly get a unique 10-digit account number—no duplicates, no confusion. It's yours and nobody else's.

###  Two-Layer Security
Money transfers require extra protection:
- Your password gets you in
- Your 4-digit PIN secures every transaction
Just like Opay and real banks do it.

###  Real Transactions
- Transfer money between accounts
- PIN verification on every transfer
- Complete record of everything you send and receive

###  Mobile-First Design
The whole app is built mobile-first. It feels like a real banking app on your phone, but it works perfectly on any device.

---

##  What We Built This With

**Frontend:**
- React (powered by Vite for blazing-fast development)
- React Router for smooth navigation

**Backend:**
- Node.js and Express.js (the server framework)
- MongoDB for storing all the data

**Security:**
- bcrypt to protect passwords and PINs (they're hashed, not stored plain text)
- JWT (JSON Web Tokens) for secure sessions

---

##  How It's Organized

```bash
client/        # React frontend (Vite)
server/        # Express backend

server/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── utils/
 └── server.js
```

---

##  Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/trusta-bank.git
cd trusta-bank
```

---

### 2. Install dependencies

#### Frontend Setup

```bash
cd client
npm install
```

#### Backend Setup

```bash
cd server
npm install
```

---

### 3. Set Up Your Environment Variables

In your `/server` folder, create a `.env` file and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=Trusta Bank <your-email@gmail.com>
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM=Trusta Bank <no-reply@mail.yourdomain.com>
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

Email provider options:
- `MAIL_PROVIDER=smtp` uses Nodemailer (Gmail SMTP)
- `MAIL_PROVIDER=resend` uses Resend API (recommended in production)
- `MAIL_PROVIDER=auto` tries Resend first, then falls back to SMTP

Optional (frontend, only if not using Vite proxy):

```env
VITE_API_BASE_URL=http://localhost:5000
```

Just replace those values with your actual MongoDB connection string, Paystack secret key, and generate a strong JWT secret key.

---

### 4. Get Everything Running

#### Fire up the backend

```bash
cd server
npm run dev
```

#### Start the frontend in another terminal

```bash
cd client
npm run dev
```

That's it! Your app should now be running.

---

##  How We Keep Your Money Safe

Security isn't an afterthought here—it's built in from day one:

- **Your passwords and PINs** are encrypted using bcrypt (we never store the real codes)
- **Your sessions** are secured with JWT tokens
- **Account numbers** are unique and verified—no two people can have the same one
- **Big transactions** require PIN verification as an extra safety layer

---

##  Cool Stuff Coming Soon

We're constantly improving Trusta Bank. Here's what's on the roadmap:

-  Virtual debit cards you can use instantly
-  Personal finance dashboard with insights
-  Real-time notifications for your transactions
-  Support for multiple languages
-  Progressive Web App so it works offline too

---

##  Built By

**Adeniyi Ademola**

---

## Want to Help?

We'd love your contributions! This is an open project, so feel free to fork it, make improvements, and send pull requests our way.

---

##  License & Disclaimer

This project is built for learning and demonstration purposes. It's a great way to understand how real fintech apps work, but it's not a real bank and shouldn't be used with real money.