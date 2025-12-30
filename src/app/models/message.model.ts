export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
  isRead: boolean;
}
