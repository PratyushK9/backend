import multer from "multer";

// Multer storage configuration for saving files to disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files in 'public/temp' directory
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    // Use original file name; consider adding timestamp or unique ID to avoid name collisions
    cb(null, file.originalname);
  }
});

// Export multer middleware configured with the storage settings
export const upload = multer({ storage });
