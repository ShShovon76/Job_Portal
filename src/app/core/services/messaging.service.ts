import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Conversation } from 'src/app/models/conversation.model';
import { Message } from 'src/app/models/message.model';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  constructor(private api: ApiService) {}

  // Corrected URLs to match backend
  getUserConversations(userId: number, query: { page?: number; size?: number } = {}): Observable<Pagination<Conversation>> {
    const params = this.api.buildParams({ userId, ...query });
    return this.api.get<Pagination<Conversation>>('/api/messages/conversations', params);
  }

  getConversation(conversationId: number, userId: number): Observable<Conversation> {
    const params = this.api.buildParams({ userId });
    return this.api.get<Conversation>(`/api/messages/conversations/${conversationId}`, params);
  }

  getConversationBetweenUsers(user1Id: number, user2Id: number): Observable<Conversation> {
    const params = this.api.buildParams({ user1Id, user2Id });
    return this.api.get<Conversation>('/api/messages/conversations/between', params);
  }

  sendMessage(request: { conversationId?: number; receiverId: number; content: string }, senderId: number): Observable<Message> {
    const params = this.api.buildParams({ senderId });
    return this.api.post<Message>('/api/messages/send', request, params);
  }

  getConversationMessages(conversationId: number, userId: number, query: { page?: number; size?: number } = {}): Observable<Pagination<Message>> {
    const params = this.api.buildParams({ userId, ...query });
    return this.api.get<Pagination<Message>>(`/api/messages/conversations/${conversationId}/messages`, params);
  }

 markMessageAsRead(messageId: number, userId: number) {
  return this.api.put<Message>(
    `/api/messages/${messageId}/read`,
    null,
    this.api.buildParams({ userId })
  );
}


  markAllMessagesAsRead(conversationId: number, userId: number): Observable<number> {
    const params = this.api.buildParams({ userId });
    return this.api.put<number>(`/api/messages/conversations/${conversationId}/read-all`, null, params);
  }

  deleteMessage(messageId: number, userId: number) {
  return this.api.delete<void>(
    `/api/messages/${messageId}`,
    this.api.buildParams({ userId })
  );
}


  getUnreadMessageCount(userId: number): Observable<number> {
    const params = this.api.buildParams({ userId });
    return this.api.get<number>('/api/messages/unread-count', params);
  }
}
