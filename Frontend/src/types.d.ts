// @ts-check

interface Project { // CHECK!
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
}

interface Column {
    id: string;
    title: string;
    orderIndex: number;
    tasks: Task[];
}

interface Task {
    id: string;
    title: string;
    description: string;
    icon: string;
    priority: string;
    urgency: string;
    dueDate: string;
}