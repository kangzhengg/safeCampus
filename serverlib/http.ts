export async function readJsonBody<T = any>(req: any): Promise<T> {
  if (req?.body && typeof req.body === "object") return req.body as T;

  if (req?.body && typeof req.body === "string") {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      return {} as T;
    }
  }

  // Fallback: read raw stream (works in many serverless runtimes)
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve) => {
    req.on?.("data", (c: Buffer) => chunks.push(c));
    req.on?.("end", () => resolve());
    // If req is not a stream, resolve immediately
    if (!req?.on) resolve();
  });

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}

export function jsonError(res: any, status: number, message: string) {
  return res.status(status).json({ error: message });
}

