export interface DetectionResult {
    type: string;
    commands: {
        name: string;
        command: string;
        required: boolean;
    }[];
    confidence: "high" | "medium" | "low";
    markers_found: string[];
}
export declare class ProjectDetector {
    detect(projectRoot: string): Promise<DetectionResult>;
    private findMarkers;
}
//# sourceMappingURL=detector.d.ts.map