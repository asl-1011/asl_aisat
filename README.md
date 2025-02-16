# ASL (Aisat Super League) Website

This is the official website for the **Aisat Super League (ASL)**, built with [Next.js](https://nextjs.org), [Flask](https://flask.palletsprojects.com/), and [Tailwind CSS](https://tailwindcss.com/). The ASL website provides real-time match data, rankings, upcoming fixtures, player stats, and a fantasy league.

![ASL Banner](https://source.unsplash.com/featured/?football,soccer)

## Features

- **Live Match Updates**: Real-time scores, goal scorers, and match events.
- **Rankings & Stats**: Player and team performance tracking.
- **Fantasy League**: Create and manage your dream team.
- **Admin Panel**: Manage teams, players, and matches.
- **Authentication**: Secure login/signup with Supabase.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/asl-1011/asl_aisat.git
cd asl_aisat
```

### 2. Install Dependencies

```bash
npm install # or yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory and configure the necessary environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=''
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=your-secret-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=
AES_SECRET_KEY=2d2a1d4c9e8b7f6d5a0c3b1e4d2f9a8e7c6b5d4a1f0e9c8b7a6d5c4b3e2f1a0d
AES_SECRET_IV=op1e2d3c4b5a69788c9e0f1a2b3c4d5e6
```

Make sure your Supabase keys are handled securely and **never exposed** to the frontend.

### 4. Run the Development Server

```bash
npm run dev  # or yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## Deployment

The ASL website is hosted on **[asl.1011.cloud](https://asl.1011.cloud)**. You can also explore more projects on **[1011.cloud](https://1011.cloud)**.

The recommended platform for deploying this project is **Vercel**. You can deploy it by clicking the button below:

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

Alternatively, you can deploy on your preferred platform using Docker, Netlify, or DigitalOcean.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [ASL Website Guide](#)
- [Fantasy League Rules](#)

## Screenshots

![Live Match](https://source.unsplash.com/featured/?soccer,stadium)

Enjoy building the ASL experience!

