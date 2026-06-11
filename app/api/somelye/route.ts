import { NextResponse } from "next/server";
import { runSommelier } from "@/lib/sommelier";
import { TIER_ORDER } from "@/lib/types";
import type { SommelierInput, Tier } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MEDIA = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function parseDataUrl(dataUrl: unknown): { mediaType: string; data: string } | undefined {
  if (typeof dataUrl !== "string") return undefined;
  const m = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!m) return undefined;
  const mediaType = m[1].toLowerCase();
  const data = m[2];
  if (!ALLOWED_MEDIA.has(mediaType)) return undefined;
  if ((data.length * 3) / 4 > MAX_IMAGE_BYTES) return undefined;
  return { mediaType, data };
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Невалідний запит" }, { status: 400 });
  }

  const dish = typeof body.dish === "string" ? body.dish.slice(0, 400) : "";
  const occasion = typeof body.occasion === "string" ? body.occasion.slice(0, 200) : undefined;
  const budget: "any" | Tier =
    typeof body.budget === "string" && TIER_ORDER.includes(body.budget as Tier)
      ? (body.budget as Tier)
      : "any";
  const image = parseDataUrl(body.image);

  if (!dish.trim() && !image) {
    return NextResponse.json({ error: "Опишіть страву або завантажте фото." }, { status: 400 });
  }

  const input: SommelierInput = { dish, occasion, budget, image };

  try {
    const result = await runSommelier(input);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/somelye] fatal:", err);
    return NextResponse.json(
      { error: "Сомельє на хвилинку відійшов. Спробуйте ще раз." },
      { status: 500 },
    );
  }
}
