'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { apiCall, getAuthToken } from '@/lib/auth';

interface FileUploadProps {
  label: string;
  accept: string;
  maxSize?: number; // in MB
  uploadType: 'favicon' | 'site-logo' | 'publisher-logo';
  onUploadSuccess: (fileUrl: string) => void;
  onUploadError: (error: string) => void;
  currentFileUrl?: string;
  className?: string;
}

export default function FileUpload({
  label,
  accept,
  maxSize = 2,
  uploadType,
  onUploadSuccess,
  onUploadError,
  currentFileUrl,
  className = ''
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Check authentication first
    const token = getAuthToken();
    if (!token) {
      onUploadError('You are not logged in. Please log in to upload files.');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type - more flexible validation
    const allowedTypes = accept.split(',').map(type => type.trim());
    const isValidType = allowedTypes.some(type => {
      // Handle MIME types
      if (type.startsWith('image/')) {
        return file.type === type;
      }
      // Handle file extensions
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return false;
    });
    
    if (!isValidType) {
      onUploadError(`Invalid file type. Allowed types: ${accept}`);
      return;
    }

    setIsUploading(true);
    try {
      
      const formData = new FormData();
      formData.append(uploadType === 'favicon' ? 'favicon' : uploadType === 'site-logo' ? 'siteLogo' : 'publisherLogo', file);

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type, 'Upload type:', uploadType);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/${uploadType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);

      if (data.success) {
        onUploadSuccess(data.fileUrl);
      } else {
        onUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onUploadError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    onUploadSuccess('');
  };

  const getUploadTypeLabel = () => {
    switch (uploadType) {
      case 'favicon':
        return 'favicon';
      case 'site-logo':
        return 'site logo';
      case 'publisher-logo':
        return 'publisher logo';
      default:
        return 'file';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {currentFileUrl ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <img
                src={currentFileUrl}
                alt={`Current ${getUploadTypeLabel()}`}
                className="w-8 h-8 object-contain"
              />
            </div>
            <p className="text-sm text-gray-600">Current {getUploadTypeLabel()}</p>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Change'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Image className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop your {getUploadTypeLabel()} here, or{' '}
                <button
                  type="button"
                  onClick={handleClick}
                  className="text-blue-600 hover:text-blue-500 underline"
                  disabled={isUploading}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports .ico, .png, .svg, .jpg, .jpeg, .webp (max {maxSize}MB)
              </p>
            </div>
            {isUploading && (
              <div className="text-sm text-blue-600">
                Uploading...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 