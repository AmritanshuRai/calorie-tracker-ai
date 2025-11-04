import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Button from './Button';
import { pictureService } from '../services/pictureService';
import { compressImageMobile } from '../utils/imageCompression';

const PictureUploadTab = ({ selectedDate, onUploadSuccess }) => {
  const [quota, setQuota] = useState(null);
  const [existingPicture, setExistingPicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const loadQuota = async () => {
    try {
      const data = await pictureService.getPictureQuota();
      setQuota(data);
    } catch (err) {
      console.error('Failed to load quota:', err);
    }
  };

  const loadExistingPicture = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const picture = await pictureService.getPicture(dateStr);
      setExistingPicture(picture);
    } catch {
      // No picture for this date
      setExistingPicture(null);
    }
  };

  useEffect(() => {
    loadQuota();
    loadExistingPicture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Check quota
    if (!quota?.unlimited && quota?.remaining <= 0) {
      setError('You have reached your free tier limit (7 pictures)');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Compress image
      const compressedFile = await compressImageMobile(selectedFile);

      // Upload
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await pictureService.uploadPicture(
        dateStr,
        compressedFile,
        setUploadProgress
      );

      // Clear selection and reload
      setSelectedFile(null);
      setPreviewUrl(null);
      await loadQuota();
      await loadExistingPicture();

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload picture');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this picture?')) {
      return;
    }

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await pictureService.deletePicture(dateStr);
      setExistingPicture(null);
      await loadQuota();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.error || 'Failed to delete picture');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError('');
  };

  return (
    <div className='space-y-4'>
      {/* Quota Banner */}
      {quota && !quota.unlimited && (
        <div className='p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-purple-900'>
                📸 {quota.used} / {quota.limit} pictures used
              </p>
              {quota.remaining <= 2 && quota.remaining > 0 && (
                <p className='text-xs text-purple-700 mt-1'>
                  Only {quota.remaining} upload
                  {quota.remaining !== 1 ? 's' : ''} remaining!
                </p>
              )}
            </div>
            {quota.remaining <= 2 && (
              <a
                href='/upgrade'
                className='px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
                Upgrade to Pro
              </a>
            )}
          </div>
        </div>
      )}

      {/* Existing Picture */}
      {existingPicture && !selectedFile && (
        <div className='p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl'>
          <div className='flex items-center gap-2 mb-3'>
            <ImageIcon className='w-5 h-5 text-blue-600' />
            <h3 className='text-sm font-semibold text-blue-900'>
              Today's Picture
            </h3>
          </div>
          <div className='relative'>
            <img
              src={existingPicture.thumbnailUrl}
              alt='Daily progress'
              className='w-full rounded-lg'
            />
            <button
              onClick={handleDelete}
              className='absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </div>
          <button
            onClick={() => window.open(existingPicture.originalUrl, '_blank')}
            className='mt-3 w-full px-4 py-2 text-sm font-medium bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors'>
            View Full Size
          </button>
        </div>
      )}

      {/* Upload Section */}
      {!existingPicture && (
        <div className='space-y-4'>
          {/* Preview */}
          {previewUrl ? (
            <div className='relative'>
              <img
                src={previewUrl}
                alt='Preview'
                className='w-full rounded-xl border-2 border-slate-200'
              />
              <button
                onClick={clearSelection}
                className='absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'>
                <X className='w-4 h-4' />
              </button>
            </div>
          ) : (
            /* File Selection */
            <div className='space-y-3'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                capture='environment'
                onChange={handleFileSelect}
                className='hidden'
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className='w-full p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors'>
                <div className='flex flex-col items-center gap-3'>
                  <Camera className='w-12 h-12 text-slate-400' />
                  <div>
                    <p className='text-sm font-semibold text-slate-700'>
                      Take Photo or Upload
                    </p>
                    <p className='text-xs text-slate-500 mt-1'>
                      JPEG, PNG, WebP, or HEIC (max 10MB)
                    </p>
                  </div>
                </div>
              </button>

              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={() => {
                    fileInputRef.current.capture = 'environment';
                    fileInputRef.current?.click();
                  }}
                  className='flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-colors'>
                  <Camera className='w-5 h-5' />
                  <span className='text-sm font-medium'>Take Photo</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current.capture = '';
                    fileInputRef.current?.click();
                  }}
                  className='flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors'>
                  <Upload className='w-5 h-5' />
                  <span className='text-sm font-medium'>Upload</span>
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <div className='space-y-3'>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className='w-full bg-slate-200 rounded-full h-2'>
                  <div
                    className='bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed'>
                {isUploading ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin mr-2' />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  'Upload Picture'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-xl'>
          <p className='text-sm text-red-800'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default PictureUploadTab;
