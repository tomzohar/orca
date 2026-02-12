export class ProjectIdentifier {
    constructor(public readonly id: number) { }
}

export class Project {
    constructor(
        public readonly id: number,
        public name: string,
        public slug: string,
        public rootPath: string,
        public description: string | null,
        public includes: string[],
        public excludes: string[],
        public readonly ownerId: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) { }

    static create(name: string, slug: string, rootPath: string, ownerId: number, description?: string): Project {
        const includes = ['**/*'];
        const excludes = ['**/node_modules/**', '**/.git/**'];
        // ID is assigned by persistence
        return new Project(0, name, slug, rootPath, description || null, includes, excludes, ownerId, new Date(), new Date());
    }
}
