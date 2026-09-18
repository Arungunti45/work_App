import { z } from 'zod';

export const ConversationTypeSchema = z.enum(['JOB_APPLICATION', 'PROJECT', 'TEAM', 'DIRECT_RELATIONSHIP']);
export type ConversationType = z.infer<typeof ConversationTypeSchema>;

export const ConversationSchema = z.object({
  id: z.string().optional(),
  type: ConversationTypeSchema,
  
  // Context mapping
  jobId: z.string().optional(),
  applicationId: z.string().optional(),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  
  createdBy: z.string(),
  participantIds: z.array(z.string()),
  
  // Denormalized state
  lastMessage: z.string().optional().nullable(),
  lastMessageAt: z.any().optional(), // Firestore timestamp
  
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE')
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const ConversationParticipantSchema = z.object({
  uid: z.string(),
  role: z.string(),
  joinedAt: z.any(),
  lastReadAt: z.any().optional(),
  isMuted: z.boolean().default(false),
  
  // Optional denormalized data
  displayName: z.string().optional(),
  photoURL: z.string().optional()
});
export type ConversationParticipant = z.infer<typeof ConversationParticipantSchema>;

export const MessageTypeSchema = z.enum(['TEXT', 'IMAGE', 'DOCUMENT', 'SYSTEM']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const MessageStatusSchema = z.enum(['SENT', 'DELIVERED', 'READ', 'DELETED']);
export type MessageStatus = z.infer<typeof MessageStatusSchema>;

export const MessageSchema = z.object({
  id: z.string().optional(),
  senderId: z.string(),
  type: MessageTypeSchema,
  text: z.string().nullable().optional(),
  
  attachmentIds: z.array(z.string()).default([]),
  replyToMessageId: z.string().optional(),
  
  createdAt: z.any(),
  updatedAt: z.any().optional(),
  status: MessageStatusSchema.default('SENT')
});
export type Message = z.infer<typeof MessageSchema>;

export const MessageAttachmentSchema = z.object({
  id: z.string().optional(),
  messageId: z.string(),
  uploadedBy: z.string(),
  fileName: z.string(),
  contentType: z.string(),
  size: z.number(),
  storagePath: z.string(),
  createdAt: z.any()
});
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
