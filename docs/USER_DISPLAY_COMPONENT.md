# User Display Component

## Location

Bottom right corner of the admin panel (fixed position)

## Visual Design

```
┌─────────────────────────────────┐
│  ●  Jane Smith                  │
│     jane.smith@company.com      │
└─────────────────────────────────┘
```

- **Background**: Dark slate (matches admin theme)
- **Border**: Subtle slate gray
- **Indicator**: Green pulsing dot (shows active status)
- **Text**: White name, gray email
- **Shadow**: Elevated shadow for depth
- **Z-index**: 50 (always visible)

## Responsive Behavior

- Stays fixed in bottom right corner while scrolling
- Does not interfere with content
- Automatically hidden when user is not logged in
- Compact design that doesn't obstruct forms or tables

## User Information Displayed

1. **Display Name** (if available) or **Email** (fallback)
2. **Email Address** (shown below name if display name exists)
3. **Active Status Indicator** (animated green dot)

## Implementation Details

```tsx
{
  user && (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-700 z-50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <div className="text-xs">
          <p className="font-semibold">
            {user.displayName || user.primaryEmail || "User"}
          </p>
          {user.displayName && user.primaryEmail && (
            <p className="text-slate-400 text-[10px]">{user.primaryEmail}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Future Enhancements

Possible additions:

- Click to expand and show session info
- Logout button on hover
- Recent activity summary
- User avatar/profile picture
- Role badge (admin, operator, etc.)
