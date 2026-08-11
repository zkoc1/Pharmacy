export declare class User {
    id: number;
    email: string;
    passwordHash: string;
    role: 'admin' | 'super_admin';
    createdAt: Date;
}
