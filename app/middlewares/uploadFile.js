import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'upload');
const BASE_URL = 'http://54.71.30.36:4040';

await fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(uploadDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true }).catch(cb);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, __, cb) => cb(null, true)
}).fields([{ name: 'file_type' }, { name: 'file' }]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(err);

    const file = req.files?.file?.[0];
    if (!file) return next();

    const type = req.body.file_type || 'general';
    const destDir = path.join(uploadDir, type);
    const finalPath = path.join(destDir, file.filename);

    try {
      await fs.mkdir(destDir, { recursive: true });
      await fs.rename(file.path, finalPath);
      file.path = finalPath;
      req._publicFileUrl = `${BASE_URL}/upload/${type}/${file.filename}`;
      next();
    } catch (e) {
      if (file?.path?.includes(path.join(uploadDir, 'temp'))) {
        await fs.unlink(file.path).catch(console.error);
      }
      next(e);
    }
  });
};

export default uploadMiddleware;
