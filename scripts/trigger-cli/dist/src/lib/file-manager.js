import fs from "node:fs/promises";
import path from "node:path";
export class FileManager {
    async writeJson(filePath, data) {
        await this.ensureDir(path.dirname(filePath));
        const content = JSON.stringify(data, null, 2) + "\n";
        await fs.writeFile(filePath, content, "utf-8");
    }
    async readJson(filePath, schema) {
        const raw = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        return schema.parse(parsed);
    }
    async writeMarkdown(filePath, content) {
        await this.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content, "utf-8");
    }
    async readMarkdown(filePath) {
        return fs.readFile(filePath, "utf-8");
    }
    async exists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async ensureDir(dirPath) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}
//# sourceMappingURL=file-manager.js.map