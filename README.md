# Colab Text Editor

A modern, professional-grade collaborative rich-text editor built with Next.js, TipTap, and Yjs.

## ✨ Features

- **Real-time Collaboration**: Powered by **Yjs (CRDT)** and **Hocuspocus**, enabling multiple users to edit simultaneously with zero conflicts.
- **Rich Text Experience**: Full support for Bold, Italic, Underline, Headings, Lists, and Blockquotes.
- **Server-side Persistence**: Document state is saved automatically to MongoDB from the synchronization microservice, ensuring no data loss.
- **Presence Tracking**: Live participant avatars and real-time cursor indicators for a social writing experience.
- **Secure Architecture**: JWT-based authentication for WebSocket rooms and API routes.
- **Premium UI**: Sleek "Canvas" design with adaptive status indicators and a responsive, feature-rich toolbar.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), TipTap, Tailwind CSS, Lucide Icons.
- **Synchronization**: Yjs (CRDT), Hocuspocus Server.
- **Backend/DB**: MongoDB (via Mongoose), JWT Authentication.
- **Styling**: Modern OKLCH color system with Backdrop-blur surfaces.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository
Get the code onto your machine:
```bash
git clone <repository-url>
cd colab-text-editor
```

### 2. Install Dependencies
You need to install packages for both the frontend and the synchronization service.

**Main App:**
```bash
npm install
```

**Sync Service:**
```bash
cd colab-sync-service
npm install
cd ..
```

### 3. Setup Environment Variables
Create the following files to store your credentials safely.

**Frontend (`.env.local`):**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_COLAB_WS_URL=ws://localhost:1234
```

**Sync Service (`colab-sync-service/.env`):**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=1234
```

### 4. Launch the Application
Start both services (requires two terminal windows).

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Sync Service):**
```bash
cd colab-sync-service
npm run dev
```

Once both are running, open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 Documentation

- **Project Structure**: See [files.md](./files.md) for a detailed description of every file and folder.
- **API Reference**: Standard REST routes for document metadata and user management.

## 🏛️ Technical Implementation

- **CRDT Sync**: Uses Yjs binary updates to minimize network payload and handle complex merge scenarios.
- **Persistence**: Implements `onStoreDocument` hooks on the Hocuspocus server to periodically flush document state to MongoDB. Hocuspocus is the **Single Source of Truth** for content.
- **Presence**: Awareness protocol synchronization for cursors and participant metadata.

## 🌐 Production Checklist

Before pushing to a live environment, ensure:
- **Secure WebSockets**: Use `wss://` instead of `ws://` in production.
- **Port Security**: Ensure the synchronization service port (default `1234`) is open on your firewall but restricted to your application domain if possible.
- **Process Management**: Use a process manager like **PM2** to keep the synchronization service running.
- **Database Indexing**: Ensure `docId` and `userId` fields have indexes in MongoDB for optimal performance.
