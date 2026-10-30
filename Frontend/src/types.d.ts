// @ts-check

interface Project {
    id: string;
    name: string;
    ownerId: string;
    timestamp: string;
    role: string; // "Owner" | "Member" | "Guest"
}

interface ProjectMember {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    projects: Project[];
}

interface Column {
    id: string;
    title: string;
    orderIndex: number;
    projectId?: string;
    tasks: Task[];
}

interface Task {
    id: string;
    columnId: string;
    orderIndex: number;
    title: string;
    description?: string;
    icon?: string;
    priority?: string;
    urgency?: string;
    dueDate?: string | null;
    plannedStartAt?: string;
    tags?: string[];
}