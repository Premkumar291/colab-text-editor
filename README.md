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

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd colab-text-editor
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # Also install sync-service dependencies
    cd colab-sync-service && npm install && cd ..
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file (root) and `.env` (colab-sync-service) with:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    # In production, use wss://your-sync-domain.com
    NEXT_PUBLIC_COLAB_WS_URL=ws://localhost:1234
    PORT=1234
    ```

3.  **Run the application**:
    ```bash
    # Start the frontend
    npm run dev
    
    # In a separate terminal, start the sync service
    cd colab-sync-service && npm run dev
    ```

4.  **Access the app**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## 📄 Documentation

- **Architecture & Optimizations**: See [optimization.md](./optimization.md) for details on CRDT implementation and persistence.
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
