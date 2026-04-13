import fs from "node:fs/promises";
import path from "node:path";
import { PROJECT_TYPES } from "../defaults/project-types.js";
import type { ProjectTypeDefinition } from "../defaults/project-types.js";

export interface DetectionResult {
  type: string;
  commands: { name: string; command: string; required: boolean }[];
  confidence: "high" | "medium" | "low";
  markers_found: string[];
}

export class ProjectDetector {
  async detect(projectRoot: string): Promise<DetectionResult> {
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

  private findMarkers(markers: string[], entries: string[]): string[] {
    const matched: string[] = [];

    for (const marker of markers) {
      if (marker.startsWith("*")) {
        const suffix = marker.slice(1);
        for (const entry of entries) {
          if (entry.endsWith(suffix)) {
            matched.push(entry);
          }
        }
      } else if (entries.includes(marker)) {
        matched.push(marker);
      }
    }

    return matched;
  }
}
