/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bright Blue - Primary color palette (based on #0000FF)
        primary: {
          50: '#e6f0ff',   // Lightest blue
          100: '#ccddff',
          200: '#99bbff',
          300: '#6699ff',
          400: '#3377ff',
          500: '#0055ff',  // Mid bright blue
          600: '#0044dd',
          700: '#0033bb',  // Strong blue
          800: '#0000ff',  // Main bright blue (#0000FF)
          900: '#0000cc',  // Darker blue
          950: '#000099',  // Darkest blue
        },
        
        // Navy/Bright Blue - Using brighter blue tones
        navy: {
          50: '#e6f0ff',
          100: '#ccddff',
          200: '#99bbff',
          300: '#6699ff',
          400: '#3377ff',
          500: '#0055ff',
          600: '#0044dd',
          700: '#0033bb',
          800: '#0000ff',  // Core bright blue (#0000FF)
          900: '#0000cc',  // Deep blue
          950: '#000099',  // Midnight blue
        },
        
        // Orange - Accent/Pop color
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // Main orange
          600: '#ea580c',  // Vibrant orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        
        // Semantic colors for UI feedback
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Success green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',  // Warning yellow
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',  // Error red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Neutral grays (keeping for consistency)
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        }
      },
      
      // You can also add custom shadows that match your color scheme
      boxShadow: {
        'navy': '0 10px 15px -3px rgba(0, 0, 255, 0.1), 0 4px 6px -2px rgba(0, 0, 255, 0.05)',
        'orange': '0 10px 15px -3px rgba(249, 115, 22, 0.1), 0 4px 6px -2px rgba(249, 115, 22, 0.05)',
        'bright-blue': '0 0 20px rgba(0, 0, 255, 0.3), 0 0 40px rgba(0, 0, 255, 0.1)',
      },
      
      // Custom background patterns (optional)
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0000cc 0%, #0000ff 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-navy-orange': 'linear-gradient(135deg, #0000ff 0%, #f97316 100%)',
      }
    },
  },
  plugins: [],
}
