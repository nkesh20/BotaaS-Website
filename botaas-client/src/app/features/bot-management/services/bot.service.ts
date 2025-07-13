import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Bot {
  id: number;
  user_id: number;
  bot_id: string;
  username: string;
  first_name: string;
  token: string;
  description?: string;
  short_description?: string;
  is_active: boolean;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotCreate {
  token: string;
}

export interface BotUpdate {
  description?: string;
  short_description?: string;
  is_active?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface BotListResponse {
  bots: Bot[];
  total: number;
  skip: number;
  limit: number;
}

export interface Flow {
  id: number;
  bot_id: number;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  nodes: any[];
  edges: any[];
  triggers?: any[];
  variables?: any;
  created_at: string;
  updated_at: string;
}

export interface FlowCreate {
  name: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
  nodes: any[];
  edges: any[];
  triggers?: any[];
  variables?: any;
}

export interface FlowUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
  nodes?: any[];
  edges?: any[];
  triggers?: any[];
  variables?: any;
}

@Injectable({
  providedIn: 'root'
})
export class BotService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {
    console.log('BotService initialized with API URL:', this.apiUrl);
  }

  // Bot management methods
  getBots(skip: number = 0, limit: number = 100): Observable<BotListResponse> {
    const url = `${this.apiUrl}/telegram-bots?skip=${skip}&limit=${limit}`;
    console.log('Getting bots from:', url);
    return this.http.get<BotListResponse>(url);
  }

  getBot(id: number): Observable<Bot> {
    const url = `${this.apiUrl}/telegram-bots/${id}`;
    console.log('Getting bot from:', url);
    return this.http.get<Bot>(url);
  }


  updateBot(id: number, bot: BotUpdate): Observable<Bot> {
    const url = `${this.apiUrl}/telegram-bots/${id}`;
    console.log('Updating bot at:', url, bot);
    return this.http.put<Bot>(url, bot);
  }

  deleteBot(id: number): Observable<void> {
    const url = `${this.apiUrl}/telegram-bots/${id}`;
    console.log('Deleting bot at:', url);
    return this.http.delete<void>(url);
  }

  refreshBotInfo(id: number): Observable<Bot> {
    const url = `${this.apiUrl}/telegram-bots/${id}/refresh`;
    console.log('Refreshing bot info at:', url);
    return this.http.post<Bot>(url, {});
  }

  toggleBotActive(id: number): Observable<Bot> {
    const url = `${this.apiUrl}/telegram-bots/${id}/toggle`;
    console.log('Toggling bot active at:', url);
    return this.http.post<Bot>(url, {});
  }

  // Flow management methods - Updated to match backend endpoints
  getBotFlows(botId: number): Observable<Flow[]> {
    const url = `${this.apiUrl}/flows/${botId}`;
    console.log('Getting flows from:', url);
    return this.http.get<Flow[]>(url);
  }

  getFlow(botId: number, flowId: number): Observable<Flow> {
    const url = `${this.apiUrl}/flows/${botId}/${flowId}`;
    console.log('Getting flow from:', url);
    return this.http.get<Flow>(url);
  }

  createFlow(botId: number, flow: FlowCreate): Observable<Flow> {
    const url = `${this.apiUrl}/flows/${botId}`;
    console.log('Creating flow at:', url, flow);
    return this.http.post<Flow>(url, flow);
  }

  updateFlow(botId: number, flowId: number, flow: FlowUpdate): Observable<Flow> {
    const url = `${this.apiUrl}/flows/${botId}/${flowId}`;
    console.log('Updating flow at:', url, flow);
    return this.http.put<Flow>(url, flow);
  }

  deleteFlow(botId: number, flowId: number): Observable<void> {
    const url = `${this.apiUrl}/flows/${botId}/${flowId}`;
    console.log('Deleting flow at:', url);
    return this.http.delete<void>(url);
  }

  // Additional flow methods
  activateFlow(botId: number, flowId: number): Observable<any> {
    const url = `${this.apiUrl}/flows/${botId}/${flowId}/activate`;
    console.log('Activating flow at:', url);
    return this.http.post<any>(url, {});
  }

  deactivateFlow(botId: number, flowId: number): Observable<any> {
    const url = `${this.apiUrl}/flows/${botId}/${flowId}/deactivate`;
    console.log('Deactivating flow at:', url);
    return this.http.post<any>(url, {});
  }

  setFlowAsDefault(botId: number, flowId: number): Observable<any> {
    const url = `${this.apiUrl}/flows/${botId}/${flowId}/set-default`;
    console.log('Setting flow as default at:', url);
    return this.http.post<any>(url, {});
  }

  executeFlow(botId: number, flowId: number, message: string, userId: string, sessionId?: string): Observable<any> {
    const url = `${this.apiUrl}/flows/${botId}/${flowId}/execute`;
    const payload = {
      message,
      user_id: userId,
      session_id: sessionId
    };
    console.log('Executing flow at:', url, payload);
    return this.http.post<any>(url, payload);
  }

  setupBotWebhook(botId: number, webhookBaseUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/telegram-bots/${botId}/setup-webhook`, {
      webhook_base_url: webhookBaseUrl
    });
  }

  getBotWebhookInfo(botId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/telegram-bots/${botId}/webhook-info`);
  }


  getBotStatus(botId: number): Observable<any> {
    const url = `${this.apiUrl}/telegram-bots/${botId}/status`;
    return this.http.get(url);
  }

  // Automatic webhook fix
  fixBotWebhook(botId: number): Observable<any> {
    const url = `${this.apiUrl}/telegram-bots/${botId}/fix-webhook`;
    return this.http.post(url, {});
  }

  // Test bot flow
  testBotFlow(botId: number, message: string): Observable<any> {
    const url = `${this.apiUrl}/telegram-bots/${botId}/test-flow`;
    return this.http.post(url, { test_message: message });
  }

  // Enhanced bot creation (webhooks are setup automatically)
  createBot(botData: any): Observable<any> {
    const url = `${this.apiUrl}/telegram-bots`;
    console.log('Creating bot with automatic webhook setup:', botData);
    return this.http.post(url, botData);
  }
}