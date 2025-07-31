# Contact Information Fix

This document explains the fix for the "Contact information not available" issue.

## Problem

The contact information was showing as "not available" in both the footer and contact page because:

1. **Backend Issue**: The public settings API route was not including `contactInfo` in the response
2. **Frontend Issue**: The contact page was using hardcoded contact information instead of site settings

## Root Cause

### Backend Issue
**File**: `backend/routes/settings.js`

The `/api/settings/public` route was missing `contactInfo` in the response:

```javascript
// Before (missing contactInfo)
const publicSettings = {
  siteName: settings.siteName,
  siteDescription: settings.siteDescription,
  siteUrl: settings.siteUrl,
  siteLogo: settings.siteLogo,
  siteFavicon: faviconUrl,
  publisherName: settings.publisherName,
  publisherUrl: settings.publisherUrl,
  publisherLogo: settings.publisherLogo,
  socialMedia: settings.socialMedia
  // ❌ Missing: contactInfo: settings.contactInfo
};
```

### Frontend Issue
**File**: `frontend/src/app/contact/page.tsx`

The contact page was using hardcoded contact information instead of site settings:

```javascript
// Before (hardcoded values)
<p className="text-gray-600">info@thedailyherald.com</p>
<p className="text-gray-600">+1 (555) 123-4567</p>
<p className="text-gray-600">
  123 News Street<br />
  Media City, MC 12345<br />
  United States
</p>
```

## Solution

### 1. Fixed Backend API Response

**File**: `backend/routes/settings.js`

Added `contactInfo` to the public settings response:

```javascript
// After (includes contactInfo)
const publicSettings = {
  siteName: settings.siteName,
  siteDescription: settings.siteDescription,
  siteUrl: settings.siteUrl,
  siteLogo: settings.siteLogo,
  siteFavicon: faviconUrl,
  publisherName: settings.publisherName,
  publisherUrl: settings.publisherUrl,
  publisherLogo: settings.publisherLogo,
  socialMedia: settings.socialMedia,
  contactInfo: settings.contactInfo  // ✅ Added this line
};
```

### 2. Fixed Contact Page

**File**: `frontend/src/app/contact/page.tsx`

Updated to use contact information from site settings:

```javascript
// Added contactInfo from settings
const contactInfo = settings?.contactInfo || {};

// Updated contact information display
{contactInfo.email && (
  <div className="flex items-center space-x-3">
    <Mail className="h-5 w-5 text-blue-600" />
    <div>
      <p className="font-medium">Email</p>
      <a 
        href={`mailto:${contactInfo.email}`}
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        {contactInfo.email}
      </a>
    </div>
  </div>
)}

{contactInfo.phone && (
  <div className="flex items-center space-x-3">
    <Phone className="h-5 w-5 text-green-600" />
    <div>
      <p className="font-medium">Phone</p>
      <a 
        href={`tel:${contactInfo.phone}`}
        className="text-gray-600 hover:text-green-600 transition-colors"
      >
        {contactInfo.phone}
      </a>
    </div>
  </div>
)}

{contactInfo.address && (
  <div className="flex items-center space-x-3">
    <MapPin className="h-5 w-5 text-red-600" />
    <div>
      <p className="font-medium">Address</p>
      <p className="text-gray-600 whitespace-pre-line">
        {contactInfo.address}
      </p>
    </div>
  </div>
)}

{!contactInfo.email && !contactInfo.phone && !contactInfo.address && (
  <div className="text-center py-4">
    <p className="text-gray-500 text-sm">Contact information not available</p>
    <p className="text-gray-400 text-xs mt-1">Please use the contact form below</p>
  </div>
)}
```

## Benefits

### 1. **Dynamic Contact Information**
- Contact information is now managed through site settings
- Admins can update contact details without code changes
- Consistent contact information across the site

### 2. **Better User Experience**
- Clickable email and phone links
- Proper fallback when contact info is not set
- Responsive design with hover effects

### 3. **Centralized Management**
- All contact information managed in one place (Admin → Settings → Site)
- Changes reflect immediately across footer and contact page
- No need to update multiple files

## How to Use

### For Administrators

1. **Navigate to Settings**: Admin → Settings → Site
2. **Fill Contact Information**:
   - **Email**: Enter contact email address
   - **Phone**: Enter contact phone number
   - **Address**: Enter business address (supports line breaks)
3. **Save Settings**: Click "Save Settings" button
4. **Verify**: Check footer and contact page for updated information

### For Developers

The contact information is available through the `useSiteSettings` hook:

```javascript
const { settings } = useSiteSettings();
const contactInfo = settings?.contactInfo || {};

// Access individual fields
const email = contactInfo.email;
const phone = contactInfo.phone;
const address = contactInfo.address;
```

## Data Structure

The contact information follows this structure:

```typescript
interface ContactInfo {
  email?: string;    // Contact email address
  phone?: string;    // Contact phone number
  address?: string;  // Business address (supports line breaks)
}
```

## Testing

To test the fix:

1. **Add Contact Information**: Go to Admin → Settings → Site and add contact details
2. **Check Footer**: Verify contact information appears in the footer
3. **Check Contact Page**: Verify contact information appears on the contact page
4. **Test Links**: Click email and phone links to ensure they work
5. **Test Empty State**: Remove all contact information and verify fallback message

## Future Enhancements

1. **Contact Form Integration**: Connect contact form to email settings
2. **Business Hours**: Add business hours to contact information
3. **Multiple Contacts**: Support multiple contact methods (general, sales, support)
4. **Contact Map**: Add Google Maps integration for address
5. **Social Media Integration**: Link contact information with social media profiles 