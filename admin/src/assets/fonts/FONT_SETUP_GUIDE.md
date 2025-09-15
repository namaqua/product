# Adding Custom TTF Font to Your PIM System

## 🎯 Quick Setup

### 1. Place Your Font File
Copy your `.ttf` file to:
```
/Users/colinroets/dev/projects/product/admin/src/assets/fonts/
```

Example:
```bash
cp ~/Downloads/MyFont.ttf /Users/colinroets/dev/projects/product/admin/src/assets/fonts/
```

### 2. Update the Font CSS File
Edit `/Users/colinroets/dev/projects/product/admin/src/assets/fonts/custom-fonts.css`:

```css
@font-face {
  font-family: 'MyFont';  /* Replace with your font name */
  src: url('./MyFont.ttf') format('truetype');  /* Replace with your file name */
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 3. Import Font CSS
Edit `/Users/colinroets/dev/projects/product/admin/src/index.css`:

Add this line after the @tailwind directives:
```css
@import './assets/fonts/custom-fonts.css';
```

### 4. Configure Tailwind
Edit `/Users/colinroets/dev/projects/product/admin/tailwind.config.js`:

```javascript
theme: {
  extend: {
    fontFamily: {
      // Option A: Replace default sans font
      sans: ['MyFont', 'Noto Sans', 'system-ui', ...],
      
      // Option B: Add as custom font family
      custom: ['MyFont', 'sans-serif'],
      brand: ['MyFont', 'sans-serif'],
      heading: ['MyFont', 'sans-serif'],
    },
  },
}
```

## 📝 Usage Examples

### Global Application (Entire Site)
If you set your font as `sans` in Tailwind config, it's automatically applied everywhere.

### Component-Specific Usage
```jsx
// Using custom font family
<h1 className="font-custom text-4xl">Welcome</h1>
<p className="font-brand">Brand text</p>

// Using arbitrary values
<div className="font-['MyFont'] text-lg">Custom text</div>

// Mix with other Tailwind classes
<button className="font-custom font-bold text-blue-600">
  Click Me
</button>
```

### CSS Classes
```css
/* In your component CSS */
.custom-title {
  @apply font-custom text-3xl font-bold;
}
```

## 🎨 Multiple Font Weights/Styles

If you have multiple font files (Regular, Bold, Italic, etc.):

```css
/* custom-fonts.css */
@font-face {
  font-family: 'MyFont';
  src: url('./MyFont-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'MyFont';
  src: url('./MyFont-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: 'MyFont';
  src: url('./MyFont-Italic.ttf') format('truetype');
  font-weight: 400;
  font-style: italic;
}
```

## 🚀 Performance Tips

1. **Use font-display: swap** - Shows fallback font while custom font loads
2. **Preload critical fonts** - Add to `index.html`:
```html
<link rel="preload" href="/src/assets/fonts/MyFont.ttf" as="font" type="font/ttf" crossorigin>
```

3. **Convert to WOFF2** - Better compression:
```bash
# Use online converter or command line tools
# Then update your @font-face to include both formats:
src: url('./MyFont.woff2') format('woff2'),
     url('./MyFont.ttf') format('truetype');
```

## 🧪 Testing Your Font

1. **Check if font loads:**
   - Open DevTools → Network tab
   - Filter by "Font"
   - Refresh page
   - Should see your .ttf file loaded

2. **Verify font application:**
   - Inspect element with custom font
   - Check Computed styles → font-family
   - Should show your font name

3. **Test fallbacks:**
   - Temporarily rename font file
   - Page should still work with fallback fonts

## ⚠️ Common Issues

### Font Not Loading
- Check file path is correct
- Verify file name matches exactly (case-sensitive)
- Ensure font file is in correct directory

### Font Not Applying
- Clear browser cache
- Restart dev server
- Check for typos in font-family name
- Verify Tailwind config is saved

### Build Issues
- Font files are automatically included in build
- Vite handles font imports properly
- Check console for any import errors

## 📦 Production Build

When you build for production:
```bash
npm run build
```

Vite will:
- Copy font files to dist/assets
- Update paths automatically
- Optimize for production

## 🎯 Complete Example

Here's a complete working example for a font called "Montserrat":

**1. custom-fonts.css:**
```css
@font-face {
  font-family: 'Montserrat';
  src: url('./Montserrat-Regular.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Montserrat';
  src: url('./Montserrat-Bold.ttf') format('truetype');
  font-weight: 700;
  font-display: swap;
}
```

**2. tailwind.config.js:**
```javascript
fontFamily: {
  sans: ['Montserrat', 'Noto Sans', 'system-ui', 'sans-serif'],
  display: ['Montserrat', 'sans-serif'],
}
```

**3. Component usage:**
```jsx
<div className="font-sans">Regular Montserrat text</div>
<h1 className="font-display font-bold text-4xl">Bold Montserrat heading</h1>
```

---

That's it! Your custom font is now integrated into your PIM system. 🎉
