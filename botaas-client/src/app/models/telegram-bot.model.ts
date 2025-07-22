export interface TelegramBot {
    id: number;
    user_id: number;
    bot_id: string;
    username: string;
    first_name: string;
    description?: string;
    short_description?: string;
    bot_picture_url?: string;
    description_picture_url?: string;
    is_active: boolean;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
    created_at: string;
    updated_at: string;
}

export interface TelegramBotCreate {
    token: string;
}

export interface TelegramBotUpdate {
    first_name?: string;
    description?: string;
    short_description?: string;
    bot_picture_url?: string;
    description_picture_url?: string;
    is_active?: boolean;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
}

export interface TelegramBotListResponse {
    bots: TelegramBot[];
    total: number;
    skip: number;
    limit: number;
}