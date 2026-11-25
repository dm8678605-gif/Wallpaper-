import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isReadOnlyStorage, UPLOAD_DIR, ensureDataDir, safeJoin } from "@/lib/data/store";
import { createItem } from "@/lib/data/repos";
import { writeFile, mkdir } from "node:fs/promises";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg",
};

/** Magic-byte sniffing so renamed executables can't slip through. */
function sniffOk(buf: Buffer, mime: string): boolean {
  if (mime === "image/svg+xml") {
    const head = buf.subarray(0, 512).toString("utf8").toLowerCase();
    return head.includes("<svg");
  }
  if (mime === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === "image/png") return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (mime === "image/gif") return buf.subarray(0, 3).toString("latin1") === "GIF";
  if (mime === "image/webp")
    return buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP";
  if (mime === "image/avif") return buf.subarray(4, 8).toString("latin1") === "ftyp";
  return false;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isReadOnlyStorage()) {
    return NextResponse.json({ error: "Uploads are disabled in read-only demo mode." }, { status: 503 });
  }
  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "general").replace(/[^a-z0-9-_]/gi, "-").slice(0, 40) || "general";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 8MB limit" }, { status: 413 });
  }
  const mime = file.type;
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json({ error: "Unsupported file type. Images only." }, { status: 415 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniffOk(buf, mime)) {
    return NextResponse.json({ error: "File content does not match an allowed image format" }, { status: 415 });
  }

  await ensureDataDir();
  const dir = safeJoin(UPLOAD_DIR, folder);
  if (!dir) return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  await mkdir(dir, { recursive: true });

  const ext = EXT_BY_MIME[mime] ?? "bin";
  const target = safeJoin(dir, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`);
  if (!target) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  await writeFile(target, buf);

  const url = `/uploads/${folder}/${target.split("/").pop()}`;
  await createItem("media", [], {
    filename: file.name || target.split("/").pop()!,
    url,
    mimeType: mime,
    size: file.size,
    folder,
    alt: String(form.get("alt") ?? ""),
  } as never);

  return NextResponse.json({ ok: true, url });
}
