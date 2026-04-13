import fs from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";

export class FileManager {
  async writeJson(filePath: string, data: unknown): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    const content = JSON.stringify(data, null, 2) + "\n";
    await fs.writeFile(filePath, content, "utf-8");
  }

  async readJson<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return schema.parse(parsed);
  }

  async writeMarkdown(filePath: string, content: string): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf-8");
  }

  async readMarkdown(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf-8");
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }
}
