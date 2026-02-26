// src/ingestion/loader.js
import fs from "fs";
import path from "path";
import os from "os";

import mammoth from "mammoth";
import { simpleParser } from "mailparser";
import ExcelJS from "exceljs";
import { execa } from "execa";

import { env } from "../config/env.js";
import { ocrImage } from "./ocr.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfPkg = require("pdf-parse");
const pdf = pdfPkg.default || pdfPkg;
async function loadText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

async function loadPdf(filePath) {
  const data = fs.readFileSync(filePath);
  const out = await pdf(data);
  return out.text || "";
}

async function loadDocx(filePath) {
  const data = fs.readFileSync(filePath);
  const out = await mammoth.extractRawText({ buffer: data });
  return out.value || "";
}

async function loadEml(filePath) {
  const raw = fs.readFileSync(filePath);
  const msg = await simpleParser(raw);
  const subject = msg.subject || "";
  const from = msg.from?.text || "";
  const date = msg.date?.toISOString?.() || "";
  const body = (msg.text || "").toString();
  return `Subject: ${subject}\nFrom: ${from}\nDate: ${date}\n\n${body}`;
}

async function loadXlsx(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  let out = "";
  wb.eachSheet((ws) => {
    out += `\n\n--- SHEET: ${ws.name} ---\n`;
    ws.eachRow((row) => {
      const vals = row.values
        .slice(1) // 1-indexed
        .map((v) => (v ?? "").toString().replace(/\s+/g, " ").trim());
      out += vals.join(",") + "\n";
    });
  });

  return out;
}

// Safer .xls support: convert to CSV via LibreOffice headless (optional)
async function loadXls(filePath) {
  if (!env.LIBREOFFICE_PATH) {
    return `XLS_FILE_DETECTED: ${filePath}\nSet LIBREOFFICE_PATH in .env to enable .xls indexing.`;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-agent-xls-"));
  await execa(env.LIBREOFFICE_PATH, [
    "--headless",
    "--convert-to",
    "csv",
    "--outdir",
    tmpDir,
    filePath,
  ]);

  const csv = fs.readdirSync(tmpDir).find((f) => f.toLowerCase().endsWith(".csv"));
  if (!csv) return `XLS_FILE_DETECTED: ${filePath}\nLibreOffice ran but produced no CSV.`;
  return fs.readFileSync(path.join(tmpDir, csv), "utf8");
}

async function loadImage(filePath) {
  const text = await ocrImage(filePath);
  return `IMAGE_OCR:\n${text}\n`;
}

export async function loadFileToText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if ([".txt", ".md", ".json", ".csv", ".log"].includes(ext)) return loadText(filePath);
  if (ext === ".pdf") return loadPdf(filePath);
  if (ext === ".docx") return loadDocx(filePath);
  if (ext === ".eml") return loadEml(filePath);
  if (ext === ".xlsx") return loadXlsx(filePath);
  if (ext === ".xls") return loadXls(filePath);
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return loadImage(filePath);

  return "";
}
