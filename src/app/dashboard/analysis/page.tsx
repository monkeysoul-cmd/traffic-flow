
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function Upload() {
  const [video, setVideo] = useState<File | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!video) return alert('Please select a video!');

    try {
      // Step 1️⃣: Get fresh signature from backend
      const sigRes = await fetch('https://bitfusion-backend.onrender.com/get-upload-signature');
      if (!sigRes.ok) throw new Error('Failed to get upload signature');

      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      // Step 2️⃣: Prepare FormData for Cloudinary
      const formData = new FormData();
      formData.append('file', video);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      // Step 3️⃣: Upload directly to Cloudinary with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        const data = JSON.parse(xhr.responseText);

        if (!data.secure_url) {
          console.error('Cloudinary upload failed:', data);
          return alert('Cloudinary upload failed. Check console for details.');
        }

        setCloudinaryUrl(data.secure_url);
        setUploadProgress(0);

        // Step 4️⃣: Save metadata to backend
        await fetch('https://bitfusion-backend.onrender.com/save-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: video.name,
            url: data.secure_url,
            public_id: data.public_id,
          }),
        });

        alert('Video uploaded successfully!');
      };

      xhr.onerror = () => {
        alert('Upload failed. Check console.');
      };

      xhr.send(formData);
    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Traffic Video</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: 8 }}>Upload</button>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div>Uploading: {uploadProgress}%</div>
      )}

      {cloudinaryUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Uploaded Video Preview:</h3>
          <video src={cloudinaryUrl} controls width="400" />
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Analysis</CardTitle>
        <CardDescription>Analyze vehicle count and traffic level from a video file.</CardDescription>
      </CardHeader>
      <CardContent>
        <Upload />
      </CardContent>
    </Card>
  );
}
