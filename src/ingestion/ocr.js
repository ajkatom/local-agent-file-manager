import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { env } from "../config/env.js";

let worker;

async function getWorker() {
  if (!worker) worker = await createWorker(env.OCR_LANG);
  return worker;
}

export async function ocrImage(path) {
  const w = await getWorker();
  const buf = await sharp(path).grayscale().normalize().toBuffer();
  const { data } = await w.recognize(buf);
  return (data.text || "").slice(0, env.OCR_MAX_CHARS);
}
