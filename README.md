# Colab Text Editor

A modern, collaborative rich-text editor built with Next.js and TipTap.

## Features

- **Rich Text Editing**: Powered by TipTap, supporting Bold, Italic, Underline, and structured Heading formats.
- **Auto-save**: Real-time content persistence with debounced database synchronization.
- **Clean UI**: Minimalist design inspired by Google Docs for a focused writing experience.
- **Secure Authentication**: JWT-based user registration and login.
- **Responsive Design**: Works seamlessly across desktop and mobile devices.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Editor**: TipTap (@tiptap/react, @tiptap/starter-kit)
- **Styling**: Tailwind CSS / Vanilla CSS
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT / Bcrypt

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd colab-text-editor
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file with:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## Optimization Techniques

For a detailed breakdown of the performance and UX optimizations implemented in this project, please refer to [optimization.md](./optimization.md).

## Implementation Details

- **TipTap Integration**: The editor uses a custom `Editor` component wrapping TipTap's `EditorContent`.
- **Toolbar**: A custom `Toolbar` component provides formatting controls with active state indicators.
- **Persistence**: Content is saved as HTML in MongoDB to ensure formatting is preserved across sessions.
