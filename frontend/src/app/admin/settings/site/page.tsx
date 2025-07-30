'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe,
  Save,
  CheckCircle,
  AlertCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Youtube,
  Instagram
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { apiCall } from '@/lib/auth';

interface ApiResponse {
  success: boolean;
  settings?: {
    siteName?: string;
    siteDescription?: string;
    siteUrl?: string;
    siteLogo?: string;
    publisherName?: string;
    publisherUrl?: string;
    publisherLogo?: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      youtube?: string;
      instagram?: string;
    };
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    seoSettings?: {
      defaultTitle?: string;
      defaultDescription?: string;
      googleAnalyticsId?: string;
      googleSearchConsole?: string;
    };
  };
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  siteUrl: string;
  publisherName: string;
  publisherUrl: string;
  publisherLogo?: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    youtube: string;
    instagram: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  seoSettings: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId: string;
    googleSearchConsole: string;
  };
}

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'The Daily Herald',
    siteDescription: 'Your trusted source for the latest news and updates',
    siteUrl: '',
    publisherName: 'The Daily Herald',
    publisherUrl: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      youtube: '',
      instagram: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    seoSettings: {
      defaultTitle: 'The Daily Herald - Latest News',
      defaultDescription: 'Stay informed with the latest news, breaking stories, and in-depth coverage from The Daily Herald.',
      googleAnalyticsId: '',
      googleSearchConsole: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/settings') as ApiResponse;
      if (data?.success && data?.settings) {
        // Ensure all nested objects have default values
        const fetchedSettings = data.settings;
        setSettings({
          siteName: fetchedSettings.siteName || 'The Daily Herald',
          siteDescription: fetchedSettings.siteDescription || 'Your trusted source for the latest news and updates',
          siteUrl: fetchedSettings.siteUrl || '',
          publisherName: fetchedSettings.publisherName || 'The Daily Herald',
          publisherUrl: fetchedSettings.publisherUrl || '',
          publisherLogo: fetchedSettings.publisherLogo || '',
          siteLogo: fetchedSettings.siteLogo || '',
          socialMedia: {
            facebook: fetchedSettings.socialMedia?.facebook || '',
            twitter: fetchedSettings.socialMedia?.twitter || '',
            youtube: fetchedSettings.socialMedia?.youtube || '',
            instagram: fetchedSettings.socialMedia?.instagram || ''
          },
          contactInfo: {
            email: fetchedSettings.contactInfo?.email || '',
            phone: fetchedSettings.contactInfo?.phone || '',
            address: fetchedSettings.contactInfo?.address || ''
          },
          seoSettings: {
            defaultTitle: fetchedSettings.seoSettings?.defaultTitle || 'The Daily Herald - Latest News',
            defaultDescription: fetchedSettings.seoSettings?.defaultDescription || 'Stay informed with the latest news, breaking stories, and in-depth coverage from The Daily Herald.',
            googleAnalyticsId: fetchedSettings.seoSettings?.googleAnalyticsId || '',
            googleSearchConsole: fetchedSettings.seoSettings?.googleSearchConsole || ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...((typeof prev[section as keyof SiteSettings] === 'object' && prev[section as keyof SiteSettings] !== null)
          ? (prev[section as keyof SiteSettings] as Record<string, string>)
          : {}),
        [field]: value
      }
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.siteName.trim() || !settings.siteUrl.trim()) {
      setError('Site name and URL are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await apiCall('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });

      setSuccess('Site settings updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update site settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-1">Manage your website configuration and branding</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Site Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name *</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="The Daily Herald"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="Your trusted source for the latest news and updates"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="siteUrl">Site URL *</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  placeholder="https://yourdomain.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="siteLogo">Site Logo URL</Label>
                <Input
                  id="siteLogo"
                  value={settings.siteLogo || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteLogo: e.target.value }))}
                  placeholder="https://yourdomain.com/logo.png"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Publisher Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Publisher Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="publisherName">Publisher Name *</Label>
                <Input
                  id="publisherName"
                  value={settings.publisherName}
                  onChange={(e) => setSettings(prev => ({ ...prev, publisherName: e.target.value }))}
                  placeholder="The Daily Herald"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="publisherUrl">Publisher URL *</Label>
                <Input
                  id="publisherUrl"
                  value={settings.publisherUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, publisherUrl: e.target.value }))}
                  placeholder="https://yourdomain.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="publisherLogo">Publisher Logo URL</Label>
                <Input
                  id="publisherLogo"
                  value={settings.publisherLogo || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, publisherLogo: e.target.value }))}
                  placeholder="https://yourdomain.com/publisher-logo.png"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Facebook className="h-5 w-5 mr-2" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div>
                 <Label htmlFor="facebook">Facebook URL</Label>
                 <Input
                   id="facebook"
                   value={settings.socialMedia.facebook}
                   onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                   placeholder="https://facebook.com/yourpage"
                   className="mt-1"
                 />
               </div>

               <div>
                 <Label htmlFor="twitter">Twitter URL</Label>
                 <Input
                   id="twitter"
                   value={settings.socialMedia.twitter}
                   onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                   placeholder="https://twitter.com/yourhandle"
                   className="mt-1"
                 />
               </div>

               <div>
                 <Label htmlFor="youtube">YouTube URL</Label>
                 <Input
                   id="youtube"
                   value={settings.socialMedia.youtube}
                   onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                   placeholder="https://youtube.com/yourchannel"
                   className="mt-1"
                 />
               </div>

               <div>
                 <Label htmlFor="instagram">Instagram URL</Label>
                 <Input
                   id="instagram"
                   value={settings.socialMedia.instagram}
                   onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                   placeholder="https://instagram.com/yourhandle"
                   className="mt-1"
                 />
               </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div>
                 <Label htmlFor="contactEmail">Email</Label>
                 <Input
                   id="contactEmail"
                   type="email"
                   value={settings.contactInfo.email}
                   onChange={(e) => handleContactInfoChange('email', e.target.value)}
                   placeholder="contact@yourdomain.com"
                   className="mt-1"
                 />
               </div>

               <div>
                 <Label htmlFor="contactPhone">Phone</Label>
                 <Input
                   id="contactPhone"
                   value={settings.contactInfo.phone}
                   onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                   placeholder="+1 (555) 123-4567"
                   className="mt-1"
                 />
               </div>

               <div>
                 <Label htmlFor="contactAddress">Address</Label>
                 <Textarea
                   id="contactAddress"
                   value={settings.contactInfo.address}
                   onChange={(e) => handleContactInfoChange('address', e.target.value)}
                   placeholder="123 Main Street, City, State 12345"
                   className="mt-1"
                   rows={3}
                 />
               </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultTitle">Default Page Title</Label>
                  <Input
                    id="defaultTitle"
                    value={settings.seoSettings.defaultTitle}
                    onChange={(e) => handleInputChange('seoSettings', 'defaultTitle', e.target.value)}
                    placeholder="The Daily Herald - Latest News"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="defaultDescription">Default Meta Description</Label>
                  <Input
                    id="defaultDescription"
                    value={settings.seoSettings.defaultDescription}
                    onChange={(e) => handleInputChange('seoSettings', 'defaultDescription', e.target.value)}
                    placeholder="Stay informed with the latest news..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                 <div>
                   <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                   <Input
                     id="googleAnalytics"
                     value={settings.seoSettings.googleAnalyticsId}
                     onChange={(e) => handleInputChange('seoSettings', 'googleAnalyticsId', e.target.value)}
                     placeholder="G-XXXXXXXXXX"
                     className="mt-1"
                   />
                 </div>

                 <div>
                   <Label htmlFor="googleSearchConsole">Google Search Console</Label>
                   <Input
                     id="googleSearchConsole"
                     value={settings.seoSettings.googleSearchConsole}
                     onChange={(e) => handleInputChange('seoSettings', 'googleSearchConsole', e.target.value)}
                     placeholder="Meta tag content"
                     className="mt-1"
                   />
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
} 