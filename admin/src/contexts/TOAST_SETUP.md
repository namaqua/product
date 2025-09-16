# Toast Notification Setup

To use the toast notification system, you need to wrap your App with the ToastProvider.

## Step 1: Update App.tsx or main.tsx

Add the ToastProvider around your app:

```tsx
import { ToastProvider } from './contexts/ToastContext';

// In your App component or main.tsx:
<ToastProvider>
  {/* Your existing app content */}
</ToastProvider>
```

## Step 2: Use in components

```tsx
import { useToast } from '../contexts/ToastContext';

const MyComponent = () => {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };
  
  const handleError = () => {
    toast.error('Something went wrong!');
  };
  
  // etc...
};
```

## Alternative: Use without context

If you prefer not to use context, you can import the simple toast object:

```tsx
import { toast } from '../contexts/ToastContext';

// Use directly (will log to console)
toast.success('Success message');
toast.error('Error message');
```

Note: The context version provides visual notifications, while the simple version logs to console.
