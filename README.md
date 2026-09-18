# GET YOUR JOB

Find Work. Hire Workers. Build Your Future.

## 1. Project overview
GET YOUR JOB is a web application platform to connect workers with employers. Built with modern web technologies, it features a scalable React frontend, an administrative dashboard, and a Firebase-powered serverless backend.

## 2. Technology stack
- **Frontend**: React, Vite, TypeScript, React Router, TanStack Query, React Hook Form, Zod
- **Admin**: React, Vite, TypeScript, React Router
- **Backend**: Firebase Cloud Functions (TypeScript)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Cloud Storage

## 3. Folder structure
```
GET-YOUR-JOB/
├── frontend/    # User-facing web application
├── admin/       # Administrator dashboard
├── functions/   # Firebase Cloud Functions (backend)
├── docs/        # Project documentation
├── .gitignore
├── README.md
└── SETUP_STATUS.md
```

## 4. Prerequisites
- Node.js (v18+)
- npm (v9+)
- Git
- Firebase CLI (`npm install -g firebase-tools`)

## 5. Installation commands
From the project root, run the following commands to install dependencies for each module:
```bash
# Frontend
cd frontend
npm install

# Admin
cd ../admin
npm install

# Functions
cd ../functions
npm install
```

## 6. Frontend start command
```bash
cd frontend
npm run dev
```

## 7. Admin start command
```bash
cd admin
npm run dev
```

## 8. Functions start command
```bash
cd functions
npm run build -- --watch
# To emulate functions locally:
firebase emulators:start --only functions
```

## 9. Firebase setup steps
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named "GET-YOUR-JOB".
3. Enable Firestore Database (start in production or test mode).
4. Enable Storage.
5. Enable Authentication (Email/Password, Google, etc. as needed).
6. Upgrade to the Blaze (pay-as-you-go) plan to deploy Functions.
7. Run `firebase login` to authenticate the CLI.
8. Run `firebase use --add <PROJECT_ID>` from the root of this repository.

## 10. Environment variable setup
Copy the example environment files and fill in your Firebase configuration keys:
- `frontend/.env.example` -> `frontend/.env`
- `admin/.env.example` -> `admin/.env`
- `functions/.env.example` -> `functions/.env`

## 11. Firebase deployment commands
```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting (frontend/admin depending on target setup)
firebase deploy --only hosting
```

## 12. Security rules deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

## 13. Development workflow
1. Create a feature branch (`git checkout -b feature/my-feature`).
2. Run development servers for frontend/admin.
3. Test backend changes using Firebase Emulators.
4. Commit changes following conventional commits.
5. Push to remote and create a Pull Request.
