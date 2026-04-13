import type { z } from "zod";
export declare class FileManager {
    writeJson(filePath: string, data: unknown): Promise<void>;
    readJson<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T>;
    writeMarkdown(filePath: string, content: string): Promise<void>;
    readMarkdown(filePath: string): Promise<string>;
    exists(filePath: string): Promise<boolean>;
    ensureDir(dirPath: string): Promise<void>;
}
//# sourceMappingURL=file-manager.d.ts.map