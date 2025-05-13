export interface User {
    id: number;
    username: string;
    email: string | null;
    telegram_id: string;
    telegram_username: string;
    first_name: string;
    last_name: string | null;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}