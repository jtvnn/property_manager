# Property Manager Desktop Application

🎉 **Congratulations!** Your Property Manager web application has been successfully converted to a desktop application using Electron.

## 🚀 Quick Start

### Development Mode
1. **Start the Next.js server:**
   ```bash
   npm run dev
   ```

2. **In a new terminal, start the Electron app:**
   ```bash
   npm run electron
   ```

### Alternative: Combined Development
```bash
npm run electron:dev
```
This will start both Next.js and Electron automatically (requires `concurrently` and `wait-on` packages).

## 📦 Building for Distribution

### Build for Current Platform
```bash
npm run electron:dist
```

### Build for Specific Platforms
```bash
# Windows
npm run electron:dist -- --win

# macOS
npm run electron:dist -- --mac

# Linux
npm run electron:dist -- --linux
```

### Create Installer Packages
```bash
# Create installer (Windows .exe, macOS .dmg, Linux .AppImage)
npm run build:electron
```

## 🖥️ Desktop Features

### Native Application Features
- **🔧 Native Menus**: File, View, Window, and Help menus
- **⌨️ Keyboard Shortcuts**: 
  - `Ctrl/Cmd + D`: Dashboard
  - `Ctrl/Cmd + P`: Properties
  - `Ctrl/Cmd + Shift + T`: Tenants
  - `Ctrl/Cmd + M`: Maintenance
  - `Ctrl/Cmd + Shift + P`: Payments
  - `Ctrl/Cmd + N`: New Property
  - `Ctrl/Cmd + T`: New Tenant

### Window Management
- **Resizable**: Minimum size 1200x800, recommended 1400x900
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Offline Capable**: Your file-based data storage works perfectly offline

## 📁 File Structure

```
property_manager/
├── electron/                 # Electron configuration
│   ├── main.js              # Main Electron process
│   ├── preload.js           # Secure bridge script
│   └── icon.png             # Application icon
├── src/                     # Your Next.js app (unchanged)
├── data/                    # JSON data files (works offline)
└── dist-electron/           # Built desktop app files
```

## 🔧 Configuration Files

### Package.json Scripts
- `electron`: Run Electron with current setup
- `electron:dev`: Start Next.js and Electron together
- `electron:pack`: Build without installer
- `electron:dist`: Build with installer
- `build:electron`: Full production build

### Next.js Configuration
- Optimized for desktop environment
- Image optimization disabled for better Electron compatibility
- Webpack configured for Electron renderer process

## 📋 Data Storage

Your application uses **file-based JSON storage** which is perfect for desktop apps:
- **Offline Operation**: No internet required
- **Portable Data**: Users can backup/move their data folder
- **Fast Performance**: Direct file access
- **Simple Backup**: Just copy the `data/` folder

## 🎨 Customization

### Application Icon
Replace the placeholder icon in `electron/icon.png` with your brand icon. You'll need:
- `icon.png` (512x512 for Linux)
- `icon.ico` (for Windows)
- `icon.icns` (for macOS)

### Application Name & Details
Update in `package.json`:
```json
{
  "name": "your-app-name",
  "productName": "Your App Display Name",
  "description": "Your app description",
  "version": "1.0.0"
}
```

## 🚢 Distribution

### Auto-Updater (Optional)
To add automatic updates:
1. Install `electron-updater`
2. Configure update server
3. Add update checking to main.js

### Code Signing (For Production)
For Windows and macOS distribution:
1. Obtain code signing certificates
2. Configure in `package.json` build section
3. Use in CI/CD pipeline

## 🔐 Security Features

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer
- **Preload Script**: Secure communication bridge
- **External Links**: Open in system browser

## 🐛 Troubleshooting

### Common Issues

1. **"Port in use" errors**
   - Make sure no other Next.js servers are running
   - Check for other apps using port 3000

2. **App won't start**
   - Ensure Next.js dependencies are installed
   - Try running `npm run dev` first

3. **Build errors**
   - Clear `dist-electron/` folder
   - Run `npm run build` before `npm run electron:dist`

### Development Tips

1. **Hot Reload**: Changes to React components update automatically
2. **Electron Restart**: Changes to `electron/main.js` require app restart
3. **DevTools**: Available in development mode (F12)

## 📱 Future Enhancements

Consider adding these desktop-specific features:
- **System Tray**: Quick access from system tray
- **Notifications**: Native desktop notifications for rent reminders
- **File Associations**: Open property files directly
- **Auto-Start**: Launch on system startup
- **Backup Integration**: Automatic cloud backup
- **Print Support**: Native printing for reports

## 🎯 Next Steps

1. **Test thoroughly** on your target platforms
2. **Customize the icon** with your brand
3. **Set up code signing** for distribution
4. **Create installation packages** for users
5. **Consider adding native desktop features**

Your Property Manager is now a fully functional desktop application! 🎉