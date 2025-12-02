# Amington Hall - Walkthrough Register Form

A premium, branded wedding inquiry form for Amington Hall featuring a sophisticated black and gold design theme.

## ✨ Features

- **Premium Design**: Elegant black, gold, and white color scheme with gradient effects
- **Responsive Layout**: Fully responsive design that works seamlessly on all devices
- **Modern Date Picker**: Custom-styled Flatpickr calendar with theme-matching design
- **Brand Integration**: Dynamic logo positioning in top-right corner with responsive sizing
- **Smooth Animations**: Professional transitions and hover effects throughout
- **Form Validation**: Client-side validation with required field indicators
- **Success Messaging**: Elegant submission confirmation with smooth animations

## 🎨 Design Highlights

- **Typography**: Classic serif font family (Georgia, Times New Roman)
- **Color Palette**:
  - Primary Gold: `#d4af37`
  - Secondary Gold: `#b8962e`
  - Background: Dark gradient (`#0a0a0a` to `#1a1a1a`)
  - Accents: White with varying opacity
- **Effects**: 
  - Golden glow overlays
  - Smooth box shadows
  - Premium gradient buttons
  - Custom-styled form inputs

## 📋 Form Fields

1. **Your Name** - Text input
2. **Groom's Name** - Text input
3. **Bride's Name** - Text input
4. **Ethnicity / Cultural Background** - Text input
5. **Event Date** - Premium date picker (Flatpickr)

## 🚀 Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Advanced styling with gradients, transitions, and responsive design
- **JavaScript (ES6+)** - Form handling and interactions
- **Flatpickr** - Modern, accessible date picker library

## 📦 Dependencies

- [Flatpickr](https://flatpickr.js.org/) - Date picker (loaded via CDN)

## 🛠️ Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/systemifyautomation/AH-Forms.git
   ```

2. Navigate to the project directory:
   ```bash
   cd AH-Forms
   ```

3. Add the `logo.png` file to the root directory (the Amington Hall logo)

4. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

5. Visit `http://localhost:8000` in your browser

## 📁 Project Structure

```
AH-Forms/
├── index.html          # Main HTML file
├── styles.css          # Custom styling
├── script.js           # Form functionality and Flatpickr configuration
├── logo.png            # Amington Hall logo (add this file)
└── README.md           # Documentation
```

## 🎯 Key Features Explained

### Premium Date Picker
- Black and gold themed calendar
- Prevents selection of past dates
- Smooth animations and transitions
- Mobile-friendly interface
- Custom date format display

### Responsive Logo
- Dynamic sizing using CSS `clamp()`
- Desktop: 60px - 100px
- Mobile: 50px - 70px
- Positioned in top-right corner
- Subtle hover effects

### Form Validation
- All fields marked as required
- Gold asterisk indicators
- Client-side validation before submission
- Success message on submission

## 🎨 Customization

### Colors
Edit the CSS variables and color values in `styles.css`:
- Gold colors: `#d4af37`, `#b8962e`
- Background gradients: Adjust in the `body` styles
- Border colors: Update `rgba(212, 175, 55, ...)` values

### Form Fields
Add or modify fields in `index.html` following the existing structure:
```html
<div class="form-group">
    <label for="field-id">
        Your Question? <span class="required">*</span>
    </label>
    <input type="text" id="field-id" name="field-id" placeholder="Placeholder text" required>
</div>
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

Copyright © 2025 Amington Hall. All rights reserved.

## 👥 Credits

Developed for Amington Hall's client onboarding process.
