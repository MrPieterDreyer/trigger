export interface ProjectTypeDefinition {
    type: string;
    markers: string[];
    commands: {
        name: string;
        command: string;
        required: boolean;
    }[];
}
export declare const PROJECT_TYPES: ProjectTypeDefinition[];
//# sourceMappingURL=project-types.d.ts.map