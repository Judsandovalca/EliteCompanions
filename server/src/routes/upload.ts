import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { encode } from "blurhash";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs/promises";
import { getUserIdFromRequest } from "../auth.js";

interface ProcessedImage {
  s3Key: string;
  thumbUrl: string;
  mediumUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  blurHash: string | null;
}

const UPLOAD_DIR = path.resolve("public/uploads/companions");
const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes JPEG, PNG o WebP"));
    }
  },
});

async function generateBlurHash(buffer: Buffer): Promise<string | null> {
  try {
    const { data, info } = await sharp(buffer)
      .resize(32, 32, { fit: "cover" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
  } catch {
    return null;
  }
}

const router = Router();

router.post("/upload", upload.array("images", MAX_FILES), async (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ error: "No se enviaron imágenes" });
    return;
  }

  const batchId = uuid();
  const batchDir = path.join(UPLOAD_DIR, batchId);
  await fs.mkdir(batchDir, { recursive: true });

  const results: ProcessedImage[] = [];

  for (const file of files) {
    const fileId = uuid();
    const metadata = await sharp(file.buffer).metadata();
    const origWidth = metadata.width ?? 800;
    const origHeight = metadata.height ?? 1200;

    const sizes = [
      { suffix: "thumb", width: 200, height: 267 },
      { suffix: "medium", width: 600, height: 800 },
      { suffix: "full", width: 1200, height: 1600 },
    ] as const;

    const urls: Record<string, string> = {};

    for (const size of sizes) {
      const filename = `${fileId}-${size.suffix}.webp`;
      const filePath = path.join(batchDir, filename);
      await sharp(file.buffer)
        .resize(size.width, size.height, { fit: "cover", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);
      urls[size.suffix] = `/uploads/companions/${batchId}/${filename}`;
    }

    const blurHash = await generateBlurHash(file.buffer);

    results.push({
      s3Key: `companions/${batchId}/${fileId}`,
      thumbUrl: urls.thumb,
      mediumUrl: urls.medium,
      fullUrl: urls.full,
      width: origWidth,
      height: origHeight,
      blurHash,
    });
  }

  res.json(results);
});

export { router as uploadRouter };
