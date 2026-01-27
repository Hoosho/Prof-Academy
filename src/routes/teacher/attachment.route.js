// /src/routes/teacher/lecture.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { uploadAttachment } from '../../middlewares/uploadAttachment.middleware.js';
// Import Controllers
import {
  createAttachment, getAllAttachments
} from '../../controllers/teacher/attachment.controller.js'

// Import Validations
import {
  createAttachmentValidation, getAttachmentsValidation
} from '../../validations/teacher/attachment.validation.js';

/**
 * @desc Create New Attachment
 * @route POST /api/teacher/attachment 
*/
router.post(
  '/api/teacher/attachment',
  authTeacher,
  contextMiddleware,
  uploadAttachment.single('file'),
  createAttachmentValidation,
  createAttachment
);

/**
 * @desc Get All Attachments 
 * @route GET /api/teacher/attachments
*/
router.get(
  '/api/teacher/attachments',
  authTeacher,
  contextMiddleware,
  getAttachmentsValidation,
  getAllAttachments
);

export default router;