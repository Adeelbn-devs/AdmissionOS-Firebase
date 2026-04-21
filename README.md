<div align="center">
  <img src="images/collage logo.jpg" alt="AdmissionOS Logo" width="120" />
  <h1>AdmissionOS</h1>
  <p><strong>A Modern, Serverless Admission Management System</strong></p>
</div>

---

## 📖 Project Overview

**AdmissionOS** is a complete modernization of a legacy PHP-based admissions portal into a lightning-fast, high-performance Single Page Application (SPA). Built from the ground up to eliminate dependency bloat, this serverless architecture leverages plain vanilla JavaScript and Firebase to provide a seamless, real-time experience for both students and administrators. 

Say goodbye to slow page loads and complex SQL maintenance. Welcome to the future of academic enrollments.

## ✨ Key Features

- **Multi-step Smart Application Form:** A streamlined, 5-step wizard that significantly reduces cognitive load and application abandonment rates.
- **Real-time Seat Inventory:** Live seat matrices powered by Firestore that update instantaneously as applications process, preventing overbooking.
- **Premium Glassmorphism UI/UX:** A stunning, modern interface featuring frosted glass aesthetics, subtle micro-animations, and dynamic visual feedback.
- **Claude AI Vision Integration (Simulated):** Future-proofed with placeholder logic mimicking Claude's Vision API to automatically verify uploaded documents for authenticity, completeness, and readability.

## 🛠 Tech Stack

Our stack is intentionally lightweight to prioritize speed, maintainability, and developer experience:

- **HTML5 & CSS3:** Semantic structure with cutting-edge CSS for the glassmorphism design system.
- **JavaScript (ES6+):** Clean, modular, to-the-point vanilla JS without the overhead of heavy frameworks.
- **Bootstrap 5:** For rapid, responsive grid layouts and utility classes.
- **Firebase Firestore & Storage:** Serverless NoSQL database and secure bucket storage handling real-time data sync and document processing seamlessly.

## 🚀 Installation & Setup

Getting AdmissionOS running locally takes just a few minutes.

### 1. Clone the Repository
```bash
https://github.com/Adeelbn-devs/AdmissionOS-Firebase.git
cd AdmissionOS-Firebase
```

### 2. Configure Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new web project and enable **Firestore Database** and **Storage**.
3. Update the Firestore Security Rules for development:
   ```text
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; 
       }
     }
   }
   ```
4. Grab your Firebase config object and paste the credentials into `firebase_config.js`.

### 3. Seed Initial Data
1. Open up the project directory.
2. Launch `seed_firestore.html` in your browser.
3. Click the "Seed Branch Data to Firestore" button to initialize the database with default branches and seat availability.

### 4. Run the Application
You can use any local server to run the project. For example, using Python or Node.js:
```bash
npx serve .
# or
python -m http.server 8000
```
Navigate to `http://localhost:8000` to view the application in action.

## 📂 Project Structure

```text
AdmissionOS-Firebase/
├── images/                  # Static assets and logos
├── admin.html               # Secure dashboard for administrative tasks
├── application_form.html    # The 5-step student SPA wizard
├── firebase_config.js       # Firebase initialization & API credentials
├── firebase_service.js      # Core CRUD logic & database abstractions
├── index.html               # Landing page showcasing the program
├── seat_balances.html       # Real-time public-facing seat matrix
├── seed_firestore.html      # Development utility for seeding the DB
├── styles.css               # The core Glassmorphism design system
└── README.md                # You are here!
```

## 🗺 Future Roadmap

- **Autonomous Document Processing:** Replace the simulated AI placeholders with the actual **Claude Vision API** to read, extract, and approve SSLC certificates and Aadhar cards instantly.
- **AI-Powered Queries:** Connect the currently static "Student AI Assistant" chatbot to Claude's conversational API to guide applicants through their specific eligibility questions dynamically.

## 💙 Why Open Source?

AdmissionOS was refined and open-sourced as part of the **Claude for OSS program**. Our goal is to demonstrate how AI can assist in transforming rigid, legacy codebases into highly maintainable, premium-grade modern applications. We hope this repo serves as an educational blueprint for schools, developers, and institutions looking to leap into the serverless era!
