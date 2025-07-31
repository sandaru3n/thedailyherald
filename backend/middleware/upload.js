const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for favicon uploads
const faviconFilter = (req, file, cb) => {
  console.log('File filter check:', file.originalname, file.mimetype);
  
  // Check file type
  const allowedTypes = ['image/x-icon', 'image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    console.log('File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.log('File type rejected:', file.mimetype);
    cb(new Error('Invalid file type. Only .ico, .png, .svg, .jpg, .jpeg files are allowed.'), false);
  }
};

// Create multer instance for favicon uploads
const uploadFavicon = multer({
  storage: storage,
  fileFilter: faviconFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
}).single('favicon');

module.exports = {
  uploadFavicon,
  uploadsDir
}; 