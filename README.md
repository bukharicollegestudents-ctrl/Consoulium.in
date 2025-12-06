# Consoulium Admin Panel

A modern admin dashboard for the Consoulium Cultural Fest '25, built with React 19, Vite 6, and Firebase.

## Features

- Real-time leaderboard and results management
- News and events content management
- Responsive design with modern UI
- Firebase backend integration
- Performance optimized with lazy loading and code splitting

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase (for backend data)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd consoulium-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your Firebase credentials.

### Running the Application

#### Development Mode
```bash
npm run dev
```
The application will be available at http://localhost:3000

#### Production Build
```bash
npm run build
```
This creates a production-ready build in the `dist/` directory.

#### Preview Production Build
```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Sign up/in to [Vercel](https://vercel.com)
3. Import your repository
4. Configure the project:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables in the Vercel dashboard:
   - Your Firebase configuration variables
6. Deploy!

### Manual Deployment

After building the project (`npm run build`), you can deploy the `dist/` folder to any static hosting service:
- Netlify
- Firebase Hosting
- AWS S3
- GitHub Pages

## Project Structure

```
├── components/          # React components
├── dist/               # Production build (generated)
├── node_modules/       # Dependencies (generated)
├── public/             # Static assets
├── src/                # Source files
├── .env.local          # Environment variables (not included in repo)
├── .gitignore          # Files ignored by git
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
├── README.md           # This file
├── tsconfig.json       # TypeScript configuration
├── vercel.json         # Vercel deployment configuration
└── vite.config.ts      # Vite configuration
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Previews the production build locally

## Technologies Used

- [React 19](https://reactjs.org/)
- [Vite 6](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- [Lucide React](https://lucide.dev/)

## Learn More

To learn more about the technologies used in this project:

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)