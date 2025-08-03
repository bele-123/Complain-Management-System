# EEU Power Resolve - Complaint Management System

**Ethiopian Electric Utility Customer Complaint Management System**

A comprehensive web application for managing customer complaints and power outage reports for the Ethiopian Electric Utility (EEU).

## 🚀 Features

- **User Authentication & Authorization** - Role-based access control (Admin, Manager, Foreman, Call Attendant, Technician)
- **Complaint Management** - Create, track, and resolve customer complaints
- **Real-time Dashboard** - Analytics and statistics for complaint tracking
- **Multi-language Support** - English and Amharic language support
- **Google Apps Script Backend** - Serverless backend using Google Sheets as database
- **Responsive Design** - Mobile-friendly interface with modern UI

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Authentication**: Custom JWT-based authentication
- **Testing**: Vitest, React Testing Library

## 📋 Prerequisites

1. **Node.js & npm** - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. **Google Account** with access to Google Drive and Google Sheets
3. **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/bele-123/Complain-Management-System.git
cd Complain-Management-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_google_apps_script_url
VITE_APP_NAME=EEU Power Resolve
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Backend Setup (Google Apps Script)

For detailed backend setup instructions, see: [Google Apps Script Setup Guide](./google-apps-script/SETUP_GUIDE.md)

### Quick Backend Setup:

1. Create a Google Sheets spreadsheet
2. Set up a Google Apps Script project
3. Deploy the provided code as a web app
4. Update the frontend configuration with your web app URL

## 👥 Demo Credentials

For development/testing purposes:

- **Admin**: admin@eeu.gov.et / admin123
- **Manager**: manager@eeu.gov.et / manager123
- **Foreman**: foreman@eeu.gov.et / foreman123
- **Call Attendant**: callattendant@eeu.gov.et / attendant123
- **Technician**: technician@eeu.gov.et / tech123

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 🏗️ Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components (shadcn/ui)
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── data/               # Mock data and constants
```

## 🔐 Security Features

- Input sanitization and validation
- Role-based access control
- Rate limiting for login attempts
- Secure authentication flow
- CORS protection

## 🌍 Deployment

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically

### Option 2: Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Option 3: Manual Deployment
1. Run `npm run build`
2. Upload the `dist` folder to your web server

## 📚 Documentation

- [Backend Setup Guide](./google-apps-script/SETUP_GUIDE.md)
- [User Management Status](./USER_MANAGEMENT_STATUS.md)
- [Security Fixes](./SECURITY_FIXES.md)
- [Login Page Fixes](./LOGIN_PAGE_FIXES.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🙏 Acknowledgments

- Ethiopian Electric Utility (EEU) for project requirements
- shadcn/ui for the beautiful UI components
- React and Vite communities for excellent tooling

---

**Built with ❤️ for Ethiopian Electric Utility**