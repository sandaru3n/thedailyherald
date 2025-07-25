'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Bell,
  TrendingUp,
  Users
} from 'lucide-react';

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  showStats?: boolean;
}

export default function NewsletterSignup({
  title = "Stay Updated",
  description = "Get the latest news delivered to your inbox.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  showStats = true
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      setStatus('error');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically make an API call to subscribe the user
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      setStatus('success');
      setEmail('');
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
      
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Successfully Subscribed!</h4>
            <p className="text-gray-600 text-sm">You'll receive our latest updates soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pr-10 ${
                  status === 'error' ? 'border-red-300 focus:border-red-500' : ''
                }`}
                disabled={status === 'loading'}
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Subscribing...
                </div>
              ) : (
                buttonText
              )}
            </Button>
          </form>
        )}

        {showStats && (
          <div className="mt-6 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs text-gray-600">10K+</p>
                <p className="text-xs text-gray-500">Subscribers</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xs text-gray-600">Daily</p>
                <p className="text-xs text-gray-500">Updates</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Bell className="w-4 h-4" />
                </div>
                <p className="text-xs text-gray-600">Instant</p>
                <p className="text-xs text-gray-500">Alerts</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-xs">
            No spam, unsubscribe anytime
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 