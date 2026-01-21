# Manual Testing Checklist

## Authentication Tests

### Sign In
- [ ] Email/password sign in works
- [ ] Google Sign In button visible
- [ ] Apple Sign In button visible
- [ ] Google Sign In works on iOS
- [ ] Apple Sign In works on iOS
- [ ] Navigation to sign up works

### Sign Up
- [ ] Email/password sign up works
- [ ] Google Sign Up works on iOS
- [ ] Apple Sign Up works on iOS

## Lists Tests

### Main Lists Page
- [ ] Lists page loads successfully
- [ ] Create list button visible and works
- [ ] Search input filters lists correctly
- [ ] Tapping a list navigates to detail page

### List Management
- [ ] Can create a new list
- [ ] Can add items to list
- [ ] Can mark items as completed
- [ ] Can delete items
- [ ] Can share a list

## How to Test

1. **Build the app:**
   ```bash
   pnpm build && pnpm copy-ios
   ```

2. **Open in Xcode:**
   ```bash
   pnpm open-xcode
   ```

3. **Run on simulator or device**

4. **Go through checklist** and mark items as you test them
