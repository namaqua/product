# UI Design Guidelines for PIM Admin Portal

## Color Scheme

### Primary Colors
- **Primary Action Color**: `blue` (NOT indigo)
  - `bg-blue-600` `hover:bg-blue-700` for buttons
  - `text-blue-600` `hover:text-blue-700` for links
  - `border-blue-500` `focus:ring-blue-500` for inputs
  - `bg-blue-50` `text-blue-700` for selected states
  - `bg-blue-100` `text-blue-800` for badges/pills

### Secondary Colors
- **Success**: Green
  - `bg-green-600` `hover:bg-green-700`
  - `text-green-600` `hover:text-green-700`
  
- **Danger/Delete**: Red
  - `bg-red-600` `hover:bg-red-700`
  - `text-red-600` `hover:text-red-700`
  
- **Warning**: Orange/Yellow
  - `bg-orange-600` `hover:bg-orange-700`
  - `text-orange-600` `hover:text-orange-700`
  
- **Neutral**: Gray
  - `bg-gray-600` `hover:bg-gray-700`
  - `text-gray-600` `hover:text-gray-700`

## Important Notes

### ❌ DO NOT USE
- **Indigo**: Never use `indigo` color classes
- **Purple**: Avoid `purple` for primary actions (use `blue` instead)
  - Replace any `indigo` or `purple` primary buttons with `blue`
  
### ✅ ALWAYS USE
- **Blue** for primary actions and highlights
- Consistent hover states (darker shade on hover)
- Focus rings on interactive elements

## Component-Specific Guidelines

### Buttons
```jsx
// Primary Button
<button className="bg-blue-600 hover:bg-blue-700 text-white">

// Secondary Button  
<button className="border border-gray-300 hover:bg-gray-50 text-gray-700">

// Danger Button
<button className="bg-red-600 hover:bg-red-700 text-white">
```

### Form Inputs
```jsx
<input className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
```

### Links and Icons
```jsx
// Link text
<a className="text-blue-600 hover:text-blue-700">

// Icon buttons
<button className="text-gray-500 hover:text-blue-600">
```

### Selection States
```jsx
// Selected tab/item
<div className="bg-blue-50 text-blue-700">

// Hover state
<div className="hover:bg-gray-50">
```

### Badges and Pills
```jsx
// Info badge
<span className="bg-blue-100 text-blue-800">

// Success badge
<span className="bg-green-100 text-green-800">

// Warning badge
<span className="bg-yellow-100 text-yellow-800">
```

## Consistency Rules

1. **Always use `blue` instead of `indigo`**
2. **Maintain consistent hover states** (one shade darker)
3. **Use semantic colors** (green for success, red for danger)
4. **Keep focus states visible** with ring utilities
5. **Use consistent spacing** with Tailwind's spacing scale

## Examples to Avoid

```jsx
// ❌ WRONG - Using indigo
<button className="bg-indigo-600 hover:bg-indigo-700">
<span className="text-indigo-600">

// ❌ WRONG - Using purple for primary action
<button className="bg-purple-600 hover:bg-purple-700">

// ✅ CORRECT - Using blue
<button className="bg-blue-600 hover:bg-blue-700">
<span className="text-blue-600">
```

## AI Assistant Instructions

When generating code for this project:
1. **NEVER use `indigo` color classes**
2. **AVOID `purple` for primary actions** (use blue instead)
3. **ALWAYS use `blue` for primary action buttons**
4. **Follow the color scheme defined above**
5. **Maintain consistency with existing components**

---
*Last Updated: September 2025*
*Note: This guideline ensures visual consistency across the admin portal*