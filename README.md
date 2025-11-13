# CCA Ticketing System – Frontend (React)

This repository contains the **frontend web application** for the **Saint Louis University Center for Culture and the Arts (CCA) Ticket Monitoring System**.  
It is built using **React (Vite)**, styled with **Tailwind CSS**, and integrated with **Pusher** for real-time updates.

---

## Features

- Interactive and responsive user interface
- Role-based dashboard views for CCA Head, Trainer, Distributor, and Audience
- Real-time notifications and updates via **Pusher**
- Integration with backend REST API for all data operations
- Continuous deployment on **Vercel**

---

## Prerequisites

Before running the frontend locally, make sure you have:

- [Node.js](https://nodejs.org/en/download) (v18 or newer)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- The backend server running locally or hosted on Vercel

---

## Installation

1. **Clone the repository**

   ```bash
   git clone <frontend_repository_url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the root directory and add the following variables:**
   ```bash
   VITE_API_BASE_URL=http://localhost:3000
   VITE_PUSHER_KEY=your_pusher_key
   VITE_PUSHER_CLUSTER=ap1
   VITE_APP_WRITE_PROJECT_ID=your_appwrite_project_id
   VITE_APP_WRITE_BUCKET_ID=your_appwrite_bucket_id
   VITE_APP_WRITE_ENDPOINT=your_appwrite_endpoint_id
   ```

## Running the Project Locally

Start the frontend development server:

```bash
npm run dev
```

By default, it runs on:
http://localhost:5173

Make sure your backend server is running before accessing the site.

### Integration Notes

The frontend communicates with the backend through the `VITE_API_BASE_URL` variable.

Real-time events are managed via Pusher, synchronized with backend configurations.

Ensure all `.env` values match those used in the backend for seamless communication.

## Deployment

This frontend is preconfigured for deployment on Vercel:

1. Push your changes to the main branch on GitHub.
2. Import the repository into Vercel.
3. Add the environment variables (VITE_API_BASE_URL, VITE_PUSHER_KEY, VITE_PUSHER_CLUSTER) in the Vercel project settings.
4. Click Deploy.

Vercel will automatically build, optimize, and host your frontend.

## Additional Notes

The source code for both frontend and backend is hosted in private GitHub repositories.
Request access from the development team to clone and deploy the projects.

Both systems are architecturally configured to work seamlessly with Vercel’s deployment environment, ensuring consistent performance, real-time connectivity, and automated updates from GitHub.
