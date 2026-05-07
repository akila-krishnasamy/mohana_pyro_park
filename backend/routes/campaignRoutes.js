import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { protect, isManagerOrOwner } from '../middleware/auth.js';
import {
  getCampaignRecipientsSummary,
  getCampaignRecipientsList,
  sendCampaignToCustomers
} from '../controllers/campaignController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'campaigns');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `campaign-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/recipients', protect, isManagerOrOwner, getCampaignRecipientsSummary);
router.get('/recipients/list', protect, isManagerOrOwner, getCampaignRecipientsList);
router.post('/send', protect, isManagerOrOwner, upload.single('image'), sendCampaignToCustomers);

export default router;
