import fs from "node:fs/promises";
import { PROJECT_TYPES } from "../defaults/project-types.js";
export class ProjectDetector {
    async detect(projectRoot) {
        const entries = await fs.readdir(projectRoot);
        for (const definition of PROJECT_TYPES) {
            const found = this.findMarkers(definition.markers, entries);
            if (found.length > 0) {
                return {
                    type: definition.type,
                    commands: [...definition.commands],
                    confidence: found.length >= 2 ? "high" : "medium",
                    markers_found: found,
                };
            }
        }
        return { type: "unknown", commands: [], confidence: "low", markers_found: [] };
    }
    findMarkers(markers, entries) {
        const matched = [];
        for (const marker of markers) {
            if (marker.startsWith("*")) {
                const suffix = marker.slice(1);
                for (const entry of entries) {
                    if (entry.endsWith(suffix)) {
                        matched.push(entry);
                    }
                }
            }
            else if (entries.includes(marker)) {
                matched.push(marker);
            }
        }
        return matched;
    }
}
//# sourceMappingURL=detector.js.map