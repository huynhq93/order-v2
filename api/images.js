import { v2 as cloudinary } from 'cloudinary';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'POST') {
    try {
      const { file } = req.body;
      
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // file should be base64 string from frontend
      const result = await cloudinary.uploader.upload(file, {
        folder: 'orders',
        resource_type: 'auto'
      });

      res.status(200).json({
        url: result.secure_url
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
