import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Award, Globe, Target } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - The Daily Herald',
  description: 'Learn about The Daily Herald, your trusted source for comprehensive news coverage. Discover our mission, values, and commitment to delivering accurate and timely journalism.',
  keywords: 'about us, daily herald, journalism, news, mission, values, trusted news source',
  alternates: {
    canonical: '/about',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'About Us - The Daily Herald',
    description: 'Learn about The Daily Herald, your trusted source for comprehensive news coverage. Discover our mission, values, and commitment to delivering accurate and timely journalism.',
    type: 'website',
    url: '/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - The Daily Herald',
    description: 'Learn about The Daily Herald, your trusted source for comprehensive news coverage.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About The Daily Herald</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted source for comprehensive news coverage, delivering accurate and timely information 
            to keep you informed about the world around you.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-6 w-6 mr-2" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed">
              At The Daily Herald, we are committed to delivering high-quality journalism that informs, 
              educates, and empowers our readers. Our mission is to provide accurate, unbiased news 
              coverage while maintaining the highest standards of journalistic integrity.
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>50+ Journalists</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Experienced reporters and editors dedicated to bringing you the latest news
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <CardTitle>25+ Years</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Decades of trusted journalism and community service
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <CardTitle>Global Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Comprehensive coverage of local, national, and international news
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
            <CardDescription>
              The principles that guide our journalism and shape our relationship with readers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Accuracy</h3>
                <p className="text-gray-600">
                  We prioritize factual accuracy and thorough fact-checking in all our reporting.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Integrity</h3>
                <p className="text-gray-600">
                  We maintain the highest ethical standards and journalistic integrity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Independence</h3>
                <p className="text-gray-600">
                  We remain independent and free from external influence in our reporting.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <p className="text-gray-600">
                  We serve our community by providing relevant and impactful local news coverage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
              <p className="text-gray-600 mb-6">
                Join thousands of readers who trust The Daily Herald for their daily news.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/">
                    Read Latest News
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 