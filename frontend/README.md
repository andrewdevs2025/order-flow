# Nexa Order Flow Frontend

A modern React + TypeScript + Vite frontend application for the Nexa Order Flow management system.

## Features

- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - Modern React with hooks
- 🔷 **TypeScript** - Type-safe development
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧭 **React Router** - Client-side routing
- 🔄 **TanStack Query** - Server state management
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **Error Boundaries** - Graceful error handling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app runs on `http://localhost:3000` and automatically proxies API requests to the backend at `http://localhost:3001`.

### Project Structure

```
src/
├── app/
│   ├── constants/     # App configuration and constants
│   ├── services/      # API services and HTTP clients
│   └── utils/         # Utility functions
├── components/        # Reusable UI components
├── pages/            # Page components
├── types/            # TypeScript type definitions
├── App.tsx           # Main app component
├── main.tsx          # App entry point
└── index.css         # Global styles
```

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=Nexa Order Flow MVP
VITE_ENABLE_DEBUG=true
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
