import express from 'express';
import multer from 'multer';
import { analyzeResume, optimizeResume, generateQuestions, generateInterviewPrep, downloadResumePDF, downloadInterviewPDF, downloadCertificate } from '../controllers/analysisController.js';
import { getQuestions, submitResult, getResults } from '../controllers/certificationController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/analyze', upload.single('resume'), analyzeResume);
router.post('/optimize', optimizeResume);
router.post('/interview-questions', generateQuestions);
router.post('/interview-prep', generateInterviewPrep);
router.post('/download/resume', downloadResumePDF);
router.post('/download/interview', downloadInterviewPDF);
router.post('/download/certificate', downloadCertificate);

// Certification Routes
router.get('/questions/:type', getQuestions);
router.post('/submit-test', submitResult);
router.get('/results', getResults);

export default router;
