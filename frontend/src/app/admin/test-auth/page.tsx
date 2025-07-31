'use client';

import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      console.log('Token:', token);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/test-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAuth} disabled={loading}>
            {loading ? 'Testing...' : 'Test Authentication'}
          </Button>
          
          {result && (
            <pre className="mt-4 p-4 bg-gray-100 rounded">
              {result}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 