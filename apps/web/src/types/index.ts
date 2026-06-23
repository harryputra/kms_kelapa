// Tipe domain COCONEXUS — selaras dengan skema OpenAPI (api_dokumen.md).
// Saat backend & packages/shared siap, tipe ini dipindah ke paket bersama.
export * from './blueprint'
export * from './community'

export type Role = 'guest' | 'user' | 'moderator' | 'admin'

export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'revision'
  | 'published'
  | 'rejected'
  | 'archived'

export type VoteType = 'like' | 'dislike'
export type CommentStatus = 'pending' | 'approved' | 'rejected'
export type ReportReason = 'spam' | 'inappropriate' | 'misinformation' | 'other'
export type UserStatus = 'active' | 'suspended' | 'deleted'

export interface UserProfile {
  id: number
  email: string
  display_name: string
  role: Role
  avatar_url: string | null
}

export interface Badge {
  id: number
  name: string
  description: string
  icon: string
  awarded_at?: string
  progress?: number // 0..100 untuk badge belum diraih
}

export interface UserProfileDetail extends UserProfile {
  bio: string
  job_title: string
  department: string
  division: string
  badges: Badge[]
  stats: {
    articles_published: number
    comments_count: number
    likes_given: number
    followers?: number
  }
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  articles_count: number
}

export interface ArticleStats {
  views: number
  likes: number
  dislikes: number
  comments: number
}

export interface ArticleSummary {
  id: number
  title: string
  slug: string
  author: UserProfile
  category: string
  tags: string[]
  excerpt: string
  thumbnail_url: string | null
  status: ArticleStatus
  published_at: string | null
  stats: ArticleStats
}

export interface ArticleFull extends ArticleSummary {
  content: string
  sources: string[]
  user_vote: VoteType | null
  is_bookmarked: boolean
  review_notes?: string | null
  is_truncated?: false
}

export interface ArticlePreview extends ArticleSummary {
  content_preview: string
  is_truncated: true
}

export type ArticleDetail = ArticleFull | ArticlePreview

export interface Comment {
  id: number
  content: string
  user: UserProfile
  created_at: string
  status: CommentStatus
  parent_id: number | null
  replies: Comment[]
}

export interface CommentModeration {
  id: number
  article_id: number
  article_title: string
  content: string
  user: UserProfile
  status: CommentStatus
  created_at: string
}

export interface ForumTopic {
  id: number
  title: string
  author: UserProfile
  category: string
  is_pinned: boolean
  is_locked: boolean
  replies_count: number
  created_at: string
  last_activity: string
}

export interface ForumReply {
  id: number
  content: string
  user: UserProfile
  created_at: string
}

export interface ForumTopicDetail extends ForumTopic {
  content: string
  replies: ForumReply[]
}

export interface ReportItem {
  id: number
  reporter: UserProfile
  reason: ReportReason
  description: string
  entity_type: 'article' | 'comment'
  entity_id: number
  entity_preview: string
  created_at: string
}

export type NotificationType =
  | 'reply'
  | 'article_approved'
  | 'article_revision'
  | 'article_rejected'
  | 'follow_publish'
  | 'badge_awarded'

export interface AppNotification {
  id: number
  type: NotificationType
  data: Record<string, unknown> & { message: string; link?: string }
  is_read: boolean
  created_at: string
}

export interface ContentTemplate {
  id: number
  name: string
  content: string
  created_at: string
}

export interface AdminUserItem {
  id: number
  email: string
  display_name: string
  role: Role
  status: UserStatus
  created_at: string
}

export interface AuditLog {
  id: number
  user: UserProfile | null
  action: string
  entity_type: string
  entity_id: number | null
  description: string
  ip_address: string
  created_at: string
}

export interface MenuItem {
  id: number
  label: string
  url: string
  icon: string
  parent_id: number | null
  sort_order: number
  is_visible: boolean
  target: '_self' | '_blank'
  children?: MenuItem[]
}

export interface RecycleBinItem {
  type: 'articles' | 'comments' | 'users'
  id: number
  title: string
  deleted_by: UserProfile
  deleted_at: string
}

export interface SystemSettings {
  site_name: string
  site_description: string
  site_logo: string
  favicon: string
  posts_per_page: number
  maintenance_mode: boolean
}

// ---- Konfigurasi Asisten AI (Tanya COCO) ----
export type AiProvider = 'openai' | 'anthropic'

export interface AiSettings {
  enabled: boolean
  provider: AiProvider
  base_url: string
  model: string
  api_key_set: boolean
  temperature: number
  max_tokens: number
  top_k: number
  system_prompt: string
}

export interface AiSettingsInput {
  enabled?: boolean
  provider?: AiProvider
  base_url?: string
  model?: string
  api_key?: string | null
  temperature?: number
  max_tokens?: number
  top_k?: number
  system_prompt?: string
}

export interface AiTestResult {
  ok: boolean
  message?: string
  latency_ms?: number
  model?: string
  sample?: string
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total_items: number
  total_pages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface AuthResult {
  access_token: string
  user: UserProfileDetail
}
