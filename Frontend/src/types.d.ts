interface Project { // CHECK!
    id: string;
    name: string;
    ownerId: string;
    timestamp: string;
}

interface ProjectMember {
    userId: string,
    email: string,
    name: string,
    role: string
}