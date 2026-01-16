# 🎙️ StudioBook - University Recording Studio Booking System

A stunning, premium booking system for university recording studios and collaboration spaces. Features 3D effects, glassmorphism, smooth animations, and an immersive user experience.

![StudioBook Preview](https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200)

## ✨ Features

- **🎨 Premium UI Design**
  - 3D tilt card effects with mouse tracking
  - Glassmorphism with blur effects
  - Floating particle animations
  - Gradient orb backgrounds
  - Smooth page transitions
  - Custom cursor glow effect

- **📅 Booking System**
  - Real-time availability checking
  - Date and time slot selection
  - Multiple room support
  - Booking confirmation with animations
  - Cancel/modify bookings

- **🚪 Room Management**
  - 4 rooms (2 Recording, 2 Session)
  - Equipment lists per room
  - Capacity information
  - Status indicators

- **📊 Calendar View**
  - Weekly calendar overview
  - Color-coded bookings
  - All rooms at a glance

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Steps

```bash
# 1. Navigate to the project folder
cd studiobook

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000
```

---

## 🌐 Deploy to Vercel (FREE) - Step by Step

### Method 1: GitHub + Vercel (Recommended)

#### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create account)
2. Click the **+** icon → **New repository**
3. Name it `studiobook`
4. Keep it **Public** (free)
5. Click **Create repository**

#### Step 2: Push Your Code to GitHub

```bash
# In your studiobook folder, run these commands:

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - StudioBook app"

# Add your GitHub repo as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/studiobook.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access GitHub
4. Click **Add New...** → **Project**
5. Find your `studiobook` repo → Click **Import**
6. Settings will auto-detect (Vite + React)
7. Click **Deploy**
8. Wait ~1 minute for build
9. 🎉 Your site is live at `https://studiobook-xxxxx.vercel.app`

### Method 2: Vercel CLI (Direct Upload)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build the project
npm run build

# 3. Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? studiobook
# - Which directory is your code in? ./
# - Want to override settings? No

# 4. For production deployment:
vercel --prod
```

---

## 🌐 Deploy to Netlify (FREE) - Alternative

### Method 1: Drag & Drop

1. Build your project:
   ```bash
   npm run build
   ```

2. Go to [netlify.com](https://netlify.com)
3. Sign up / Log in
4. Drag the `dist` folder to the deploy area
5. Done! Get your URL

### Method 2: GitHub Integration

1. Push code to GitHub (same as Vercel steps)
2. Go to [netlify.com](https://netlify.com)
3. Click **Add new site** → **Import an existing project**
4. Choose **GitHub**
5. Select your `studiobook` repo
6. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click **Deploy site**

---

## 📁 Project Structure

```
studiobook/
├── public/
│   └── favicon.svg          # App icon
├── src/
│   ├── App.jsx              # Main React component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── vercel.json              # Vercel settings
└── README.md                # This file
```

---

## 🎨 Customization

### Change Room Information

Edit the `rooms` array in `src/App.jsx`:

```javascript
const rooms = [
  { 
    id: 1, 
    name: 'Your Room Name', 
    subtitle: 'Room Description',
    type: 'recording', // or 'session'
    equipment: ['Item 1', 'Item 2'], 
    capacity: 4, 
    gradient: 'from-purple-500 to-indigo-600',
    accent: '#8B5CF6',
    icon: '🎙️',
    image: 'https://your-image-url.com/image.jpg'
  },
  // ... more rooms
];
```

### Change Time Slots

Edit the `timeSlots` array:

```javascript
const timeSlots = [
  { time: '09:00', label: '9:00 AM', period: 'morning' },
  { time: '10:00', label: '10:00 AM', period: 'morning' },
  // ... add or remove slots
];
```

### Change Colors

Main gradient colors can be found in Tailwind classes:
- `from-purple-500 to-indigo-600` - Purple theme
- `from-cyan-500 to-blue-600` - Blue theme
- `from-emerald-500 to-teal-600` - Green theme
- `from-amber-500 to-orange-600` - Orange theme

### Change University Name

Search for "University Media Center" in `App.jsx` and replace it.

---

## 🔧 Adding a Real Database (Supabase)

To make bookings persist, you can add Supabase (free tier):

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Create a `bookings` table:

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  purpose VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

5. Add environment variables to Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Styles Not Loading
Make sure Tailwind is properly configured:
```bash
npx tailwindcss init -p
```

### Deployment Issues
- Check Vercel/Netlify build logs
- Ensure `dist` folder is being generated
- Verify `vercel.json` is in root folder

---

## 📱 Mobile Responsive

The app is fully responsive and works on:
- 📱 Mobile phones
- 📟 Tablets
- 💻 Laptops
- 🖥️ Desktop monitors

---

## 🎯 Future Enhancements

- [ ] Email notifications for bookings
- [ ] Admin dashboard
- [ ] Google Calendar integration
- [ ] User authentication
- [ ] Recurring bookings
- [ ] Equipment checkout system

---

## 📄 License

MIT License - feel free to use for your university!

---

## 🙏 Credits

- UI Design: Glassmorphism + 3D Effects
- Images: Unsplash
- Icons: Emoji + SVG
- Framework: React + Vite + Tailwind CSS

---

Made with ❤️ for university media centers everywhere
