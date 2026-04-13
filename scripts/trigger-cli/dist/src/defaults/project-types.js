export const PROJECT_TYPES = [
    {
        type: "typescript",
        markers: ["tsconfig.json"],
        commands: [
            { name: "build", command: "npm run build", required: true },
            { name: "lint", command: "npm run lint", required: true },
            { name: "typecheck", command: "npm run typecheck", required: true },
            { name: "test", command: "npm run test", required: true },
            { name: "e2e", command: "npm run e2e", required: false },
        ],
    },
    {
        type: "node",
        markers: ["package.json"],
        commands: [
            { name: "build", command: "npm run build", required: true },
            { name: "lint", command: "npm run lint", required: true },
            { name: "test", command: "npm run test", required: true },
        ],
    },
    {
        type: "dotnet",
        markers: ["*.csproj", "*.sln"],
        commands: [
            { name: "build", command: "dotnet build", required: true },
            { name: "lint", command: "dotnet format --verify-no-changes", required: true },
            { name: "test", command: "dotnet test", required: true },
        ],
    },
    {
        type: "python",
        markers: ["requirements.txt", "pyproject.toml", "setup.py"],
        commands: [
            { name: "lint", command: "ruff check .", required: true },
            { name: "typecheck", command: "mypy .", required: false },
            { name: "test", command: "pytest", required: true },
        ],
    },
    {
        type: "golang",
        markers: ["go.mod"],
        commands: [
            { name: "build", command: "go build ./...", required: true },
            { name: "lint", command: "go vet ./...", required: true },
            { name: "test", command: "go test ./...", required: true },
        ],
    },
    {
        type: "rust",
        markers: ["Cargo.toml"],
        commands: [
            { name: "build", command: "cargo build", required: true },
            { name: "lint", command: "cargo clippy", required: true },
            { name: "test", command: "cargo test", required: true },
        ],
    },
    {
        type: "ruby",
        markers: ["Gemfile"],
        commands: [
            { name: "lint", command: "bundle exec rubocop", required: true },
            { name: "test", command: "bundle exec rspec", required: true },
        ],
    },
];
//# sourceMappingURL=project-types.js.map