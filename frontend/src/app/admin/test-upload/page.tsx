'use client';

import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestUploadPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const testUpload = async () => {
    if (!selectedFile) {
      setResult('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      console.log('Token:', token);
      console.log('File:', selectedFile.name, selectedFile.size, selectedFile.type);

      const formData = new FormData();
      formData.append('favicon', selectedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/favicon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setResult(`Error: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Success response:', data);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Upload error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              accept=".ico,.png,.svg,.jpg,.jpeg,image/x-icon,image/png,image/svg+xml,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>
          
          {selectedFile && (
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({selectedFile.size} bytes, {selectedFile.type})
            </div>
          )}
          
          <Button onClick={testUpload} disabled={loading || !selectedFile}>
            {loading ? 'Uploading...' : 'Test Upload'}
          </Button>
          
          {result && (
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {result}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 