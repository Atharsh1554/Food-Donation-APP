const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth');
const donationController = require('../controllers/donation');
const historyController = require('../controllers/history');
const { getPresignedUploadUrl, LOCAL_UPLOADS_DIR } = require('../config/s3');

// Multer storage setup for local file fallback uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOCAL_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// AUTHENTICATION
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

// DONATIONS
router.post('/donations', authMiddleware, donationController.createDonation);
router.get('/donations', authMiddleware, donationController.getDonations);
router.get('/donations/:id', authMiddleware, donationController.getDonationById);
router.put('/donations/:id', authMiddleware, donationController.updateDonation);
router.delete('/donations/:id', authMiddleware, donationController.deleteDonation);

// ACTIONS
router.post('/donations/:id/reserve', authMiddleware, donationController.reserveDonation);
router.post('/donations/:id/collect', authMiddleware, donationController.collectDonation);

// HISTORY
router.get('/restaurant/history', authMiddleware, historyController.getRestaurantHistory);
router.get('/ngo/history', authMiddleware, historyController.getNgoHistory);

// IMAGE STORAGE & UPLOAD UTILS
// Get S3 Presigned URL (or local mock upload url depending on configuration)
router.get('/s3-presigned-url', authMiddleware, async (req, res) => {
  try {
    const { fileName, fileType } = req.query;
    if (!fileName || !fileType) {
      return res.status(400).json({ message: 'fileName and fileType query params are required' });
    }
    const data = await getPresignedUploadUrl(fileName, fileType);
    res.json(data);
  } catch (error) {
    console.error('Presigned URL Router Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Local Upload Fallback Route (when USE_AWS=false)
router.post('/upload-local', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return relative URL that Express server can serve
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Local Upload Router Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
