# Dispatch Dashboard (Frontend)

Next.js 16 application for the Dispatch management system with real-time updates.

## Features

- 📊 Real-time dashboard display
- 🔐 Stack Auth authentication
- ⚡ Socket.IO for live updates
- 🚨 Emergency alert system with audio notifications
- 📱 Responsive design (desktop & mobile)
- 👮 Admin panel for managing data
- 🎨 Tailwind CSS styling

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see `../server/README.md`)
- Stack Auth account

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Update the following variables in `.env.local`:

   ```bash
   # Backend API URL
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

   # Stack Auth Configuration (from https://app.stack-auth.com/)
   NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
   ```

3. **Stack Auth Setup**
   - Go to [Stack Auth](https://app.stack-auth.com/)
   - Create a new project
   - Configure allowed origins (add `http://localhost:3000` for development)
   - Copy Project ID and Publishable Client Key
   - Configure sign-in/sign-up pages

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

### Public Dashboard (`/`)

- View-only display for public screens/TVs
- Real-time updates without authentication
- Shows:
  - Emergency alerts with audio notifications
  - Today's absences
  - Equipment outages
  - On-call staff
  - Current notices

### Admin Panel (`/admin`)

- Requires authentication via Stack Auth
- Full CRUD operations on all data
- Admin login tracking
- Real-time connection status
- Manage:
  - Absences
  - Equipment issues
  - On-call staff
  - Notices
  - Emergency alerts

### Authentication

- `/sign-in` - Sign in page (Stack Auth)
- `/sign-up` - Sign up page (Stack Auth)

## Project Structure

```
front/
├── app/
│   ├── page.tsx              # Public dashboard
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── admin/
│   │   ├── page.tsx         # Admin panel
│   │   └── layout.tsx       # Admin layout
│   ├── sign-in/
│   │   └── page.tsx        # Sign in page
│   └── sign-up/
│       └── page.tsx        # Sign up page
├── components/
│   ├── AbsenceTable.tsx     # Absences display
│   ├── ConnectionStatus.tsx # Socket connection indicator
│   ├── EmergencyBanner.tsx  # Alert banner with timer
│   ├── EquipmentTable.tsx   # Equipment issues display
│   ├── NoticeBoard.tsx      # Notices display
│   └── OnCallList.tsx       # On-call staff display
├── types/
│   └── index.ts            # TypeScript type definitions
├── stack/
│   ├── client.tsx          # Stack Auth client config
│   └── server.tsx          # Stack Auth server config
├── public/
│   └── alert-sound.wav     # Emergency alert audio
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Environment Variables

| Variable                                   | Required | Description                |
| ------------------------------------------ | -------- | -------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`                  | Yes      | Backend API URL            |
| `NEXT_PUBLIC_STACK_PROJECT_ID`             | Yes      | Stack Auth Project ID      |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Yes      | Stack Auth Publishable Key |

## Building for Production

```bash
npm run build
npm start
```

## Production Deployment

See [PRODUCTION_CHECKLIST.md](../docs/PRODUCTION_CHECKLIST.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Connect repository to Vercel
2. Set root directory to `front`
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Technologies Used

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Authentication:** Stack Auth
- **Real-time:** Socket.IO Client
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

## Key Features Explained

### Real-Time Updates

Socket.IO connects to the backend and listens for data changes:

```typescript
socket.on("update_absences", (data) => {
  setAbsences(data);
});
```

### Emergency Alerts

- Audio notification plays when new alert appears
- Visual timer for high/critical alerts
- Color-coded by severity (low, medium, high, critical)
- Auto-dismissible by admins

### Date Handling

Timezone-aware date handling to ensure consistent display:

```typescript
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString();
};
```

### Authentication Flow

1. User visits `/admin`
2. Redirected to `/sign-in` if not authenticated
3. Stack Auth handles authentication
4. Redirected back to `/admin` after successful login
5. Admin login tracked in database

## Development Tips

### Hot Reload

Next.js automatically reloads when you save files.

### TypeScript

All types are defined in `types/index.ts`. Update them if you modify the database schema.

### Styling

Uses Tailwind CSS utility classes. Customize in `tailwind.config.ts`.

### Testing Socket.IO

1. Start the backend server
2. Start the frontend
3. Open two browser windows
4. Make changes in admin panel
5. See updates in both windows instantly

## Troubleshooting

### Backend Connection Fails

- Verify backend is running on correct port
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check browser console for CORS errors

### Socket.IO Not Connecting

- Check connection status indicator on admin page
- Verify backend Socket.IO is running
- Check browser network tab for WebSocket/polling requests

### Authentication Issues

- Verify Stack Auth environment variables
- Check Stack Auth dashboard for allowed origins
- Clear browser cache and cookies
- Verify Stack Auth project is active

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Check for TypeScript errors: `npx tsc --noEmit`

## Performance

- Server-side rendering disabled for real-time components (`"use client"`)
- Socket.IO uses polling first for Render compatibility
- Images optimized via Next.js Image component (if using images)
- Tailwind CSS purges unused styles in production

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

ISC

## Support

For issues or questions, check:

- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Production Checklist](../docs/PRODUCTION_CHECKLIST.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stack Auth Documentation](https://docs.stack-auth.com/)
