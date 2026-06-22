Berikut adalah **dokumen OpenAPI (Swagger) super ultra lengkap** untuk KMS COCONEXUS v2.0, mencakup seluruh endpoint, skema, keamanan, dan contoh. Dokumen ini siap digunakan oleh tim pengembang untuk menghasilkan kode klien/server, dokumentasi interaktif, dan pengujian kontrak API.

```yaml
openapi: 3.0.3
info:
  title: COCONEXUS KMS API v2.0
  description: >
    API untuk Knowledge Management System COCONEXUS.
    Mengelola artikel, komentar, forum, notifikasi, dan administrasi.
    Dirancang untuk mendukung kolaborasi UMKM dalam pengelolaan limbah kelapa.

    **Autentikasi**: JSON Web Token (JWT). Dapatkan token melalui `/auth/login`.
    Gunakan header `Authorization: Bearer <token>`.
  version: 2.0.0
  contact:
    name: Tim COCONEXUS
    email: dev@coconexus.com

servers:
  - url: https://api.coconexus.com/api/v1
    description: Server produksi
  - url: https://staging.coconexus.com/api/v1
    description: Server staging
  - url: http://localhost:3000/api/v1
    description: Pengembangan lokal

security:
  - BearerAuth: []

tags:
  - name: Auth
    description: Registrasi, login, logout, refresh token
  - name: Articles
    description: Manajemen artikel (publik dan kontribusi)
  - name: Categories
    description: Kategori artikel
  - name: Templates
    description: Template konten artikel (moderator/admin)
  - name: Comments
    description: Komentar bersarang dan moderasi
  - name: Forum
    description: Forum diskusi komunitas
  - name: Votes
    description: Voting artikel (like/dislike)
  - name: Bookmarks
    description: Simpan artikel ke daftar bacaan
  - name: Notifications
    description: Pusat notifikasi pengguna
  - name: User
    description: Profil dan aktivitas pengguna
  - name: Moderator
    description: Panel moderator (review queue, moderasi)
  - name: Admin
    description: Panel admin (pengaturan, recycle bin, backup, audit)

paths:
  # ==============================
  # AUTH
  # ==============================
  /auth/register:
    post:
      tags: [Auth]
      summary: Registrasi pengguna baru
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, display_name]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                display_name:
                  type: string
      responses:
        201:
          description: Akun berhasil dibuat, verifikasi email diperlukan
          content:
            application/json:
              schema:
                type: object
                properties:
                  message: { type: string }
                  user_id: { type: integer }
        400:
          $ref: '#/components/responses/BadRequest'
        409:
          description: Email sudah terdaftar

  /auth/login:
    post:
      tags: [Auth]
      summary: Login dan dapatkan token JWT
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string, format: email }
                password: { type: string }
      responses:
        200:
          description: Login berhasil
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token: { type: string }
                  refresh_token: { type: string }
                  expires_in: { type: integer }
                  user: { $ref: '#/components/schemas/UserProfile' }
        401:
          $ref: '#/components/responses/Unauthorized'

  /auth/logout:
    post:
      tags: [Auth]
      summary: Logout (invalidate refresh token)
      security: [BearerAuth: []]
      responses:
        200:
          description: Logout berhasil

  /auth/refresh:
    post:
      tags: [Auth]
      summary: Perpanjang token access dengan refresh token
      security: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [refresh_token]
              properties:
                refresh_token: { type: string }
      responses:
        200:
          description: Token baru
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token: { type: string }
                  expires_in: { type: integer }

  # ==============================
  # ARTICLES
  # ==============================
  /articles/published:
    get:
      tags: [Articles]
      summary: Daftar artikel yang sudah dipublikasikan
      security: []
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20 }
        - name: search
          in: query
          schema: { type: string }
        - name: category
          in: query
          schema: { type: string }
        - name: tag
          in: query
          schema: { type: string }
        - name: sort
          in: query
          schema:
            type: string
            enum: [newest, popular, oldest]
            default: newest
      responses:
        200:
          description: Daftar artikel
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/ArticleSummary' }
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'

  /articles/{id}:
    get:
      tags: [Articles]
      summary: Detail artikel (full jika login, 50% jika guest)
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        200:
          description: Artikel ditemukan
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/ArticleFull'
                  - $ref: '#/components/schemas/ArticlePreview'
        404:
          $ref: '#/components/responses/NotFound'
    put:
      tags: [Articles]
      summary: Update artikel (penulis atau moderator/admin)
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/ArticleId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ArticleUpdate'
      responses:
        200: { description: Artikel diperbarui }
        403: { $ref: '#/components/responses/Forbidden' }
        404: { $ref: '#/components/responses/NotFound' }
    delete:
      tags: [Articles]
      summary: Soft delete artikel (admin) atau hapus draft sendiri
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/ArticleId'
      responses:
        200: { description: Artikel dihapus (soft delete) }
        403: { $ref: '#/components/responses/Forbidden' }

  /articles/submit:
    post:
      tags: [Articles]
      summary: Kirim artikel baru (user submission)
      description: >
        Hanya pengguna dengan role 'user' ke atas. Artikel masuk antrean review.
      security: [BearerAuth: []]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ArticleCreate'
      responses:
        201: { description: Artikel berhasil dikirim, status "submitted" }
        400: { $ref: '#/components/responses/BadRequest' }

  /articles/{id}/vote:
    post:
      tags: [Votes]
      summary: Memberi like/dislike artikel
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/ArticleId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [vote_type]
              properties:
                vote_type:
                  type: string
                  enum: [like, dislike]
      responses:
        200: { description: Suara berhasil dicatat }
        400: { $ref: '#/components/responses/BadRequest' }

  /articles/{id}/bookmark:
    post:
      tags: [Bookmarks]
      summary: Simpan artikel ke bookmark
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/ArticleId'
      responses:
        200: { description: Bookmark ditambahkan }
        409: { description: Sudah dibookmark }
    delete:
      tags: [Bookmarks]
      summary: Hapus bookmark
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/ArticleId'
      responses:
        200: { description: Bookmark dihapus }

  /articles/{id}/report:
    post:
      tags: [Articles]
      summary: Laporkan artikel
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/ArticleId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  enum: [spam, inappropriate, misinformation, other]
                description:
                  type: string
      responses:
        200: { description: Laporan terkirim }

  # ==============================
  # CATEGORIES
  # ==============================
  /categories:
    get:
      tags: [Categories]
      summary: Daftar semua kategori
      security: []
      responses:
        200:
          description: Daftar kategori
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/Category' }
    post:
      tags: [Categories]
      summary: Buat kategori baru (moderator/admin)
      security: [BearerAuth: []]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CategoryCreate'
      responses:
        201: { description: Kategori dibuat }

  /categories/{id}:
    put:
      tags: [Categories]
      summary: Update kategori
      security: [BearerAuth: []]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CategoryCreate'
      responses:
        200: { description: Kategori diperbarui }
    delete:
      tags: [Categories]
      summary: Hapus kategori (jika tidak ada artikel)
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/CategoryId'
      responses:
        200: { description: Kategori dihapus }
        409: { description: Kategori masih digunakan artikel }

  # ==============================
  # TEMPLATES
  # ==============================
  /templates:
    get:
      tags: [Templates]
      summary: Daftar template (moderator/admin)
      security: [BearerAuth: []]
      responses:
        200:
          description: Daftar template
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/ContentTemplate' }
    post:
      tags: [Templates]
      summary: Buat template baru
      security: [BearerAuth: []]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ContentTemplateCreate'
      responses:
        201: { description: Template dibuat }

  /templates/{id}:
    put:
      tags: [Templates]
      summary: Update template
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/TemplateId'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ContentTemplateCreate'
      responses:
        200: { description: Template diperbarui }
    delete:
      tags: [Templates]
      summary: Hapus template
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/TemplateId'
      responses:
        200: { description: Template dihapus }

  # ==============================
  # COMMENTS
  # ==============================
  /articles/{articleId}/comments:
    get:
      tags: [Comments]
      summary: Komentar untuk artikel tertentu (hanya yang disetujui untuk publik)
      parameters:
        - name: articleId
          in: path
          required: true
          schema: { type: integer }
      responses:
        200:
          description: Daftar komentar (bersarang)
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/Comment' }
    post:
      tags: [Comments]
      summary: Tambah komentar (harus login)
      security: [BearerAuth: []]
      parameters:
        - name: articleId
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content: { type: string }
                parent_id:
                  type: integer
                  description: ID komentar yang dibalas (untuk nested)
      responses:
        201: { description: Komentar terkirim (status pending) }

  /comments/{id}:
    put:
      tags: [Comments]
      summary: Edit komentar sendiri (sebelum disetujui)
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/CommentId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                content: { type: string }
      responses:
        200: { description: Komentar diperbarui }
    delete:
      tags: [Comments]
      summary: Hapus komentar sendiri atau oleh admin/moderator
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/CommentId'
      responses:
        200: { description: Komentar dihapus (soft delete) }

  /comments/{id}/report:
    post:
      tags: [Comments]
      summary: Laporkan komentar
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/CommentId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ReportRequest'
      responses:
        200: { description: Laporan terkirim }

  # ==============================
  # FORUM
  # ==============================
  /forum/topics:
    get:
      tags: [Forum]
      summary: Daftar topik forum
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: search
          in: query
          schema: { type: string }
        - name: sort
          in: query
          schema:
            type: string
            enum: [newest, popular]
      responses:
        200:
          description: Daftar topik
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/ForumTopic' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }
    post:
      tags: [Forum]
      summary: Buat topik baru
      security: [BearerAuth: []]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ForumTopicCreate'
      responses:
        201: { description: Topik dibuat }

  /forum/topics/{id}:
    get:
      tags: [Forum]
      summary: Detail topik beserta balasannya
      parameters:
        - $ref: '#/components/parameters/TopicId'
      responses:
        200:
          description: Topik dan balasan
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ForumTopicDetail'
    delete:
      tags: [Forum]
      summary: Hapus topik (moderator/admin)
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/TopicId'
      responses:
        200: { description: Topik dihapus }

  /forum/topics/{id}/pin:
    put:
      tags: [Forum]
      summary: Pin/unpin topik (moderator/admin)
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/TopicId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                pinned: { type: boolean }
      responses:
        200: { description: Status pin diperbarui }

  /forum/topics/{id}/lock:
    put:
      tags: [Forum]
      summary: Lock/unlock topik (moderator/admin)
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/TopicId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                locked: { type: boolean }
      responses:
        200: { description: Status kunci diperbarui }

  /forum/topics/{id}/replies:
    post:
      tags: [Forum]
      summary: Balas topik
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/TopicId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content: { type: string }
      responses:
        201: { description: Balasan ditambahkan }

  # ==============================
  # NOTIFICATIONS
  # ==============================
  /notifications:
    get:
      tags: [Notifications]
      summary: Daftar notifikasi pengguna saat ini
      security: [BearerAuth: []]
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: unread_only
          in: query
          schema: { type: boolean }
      responses:
        200:
          description: Daftar notifikasi
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/Notification' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

  /notifications/{id}/read:
    put:
      tags: [Notifications]
      summary: Tandai notifikasi sudah dibaca
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/NotificationId'
      responses:
        200: { description: Notifikasi ditandai }

  /notifications/read-all:
    put:
      tags: [Notifications]
      summary: Tandai semua notifikasi sudah dibaca
      security: [BearerAuth: []]
      responses:
        200: { description: Semua notifikasi sudah dibaca }

  # ==============================
  # USER PROFILE
  # ==============================
  /user/profile:
    get:
      tags: [User]
      summary: Profil pengguna sendiri
      security: [BearerAuth: []]
      responses:
        200:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfileDetail'
    put:
      tags: [User]
      summary: Update profil sendiri
      security: [BearerAuth: []]
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProfileUpdate'
      responses:
        200: { description: Profil diperbarui }

  /user/bookmarks:
    get:
      tags: [Bookmarks]
      summary: Daftar artikel yang dibookmark
      security: [BearerAuth: []]
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        200:
          description: Daftar artikel tersimpan
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/ArticleSummary' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

  /user/follow/{userId}:
    post:
      tags: [User]
      summary: Ikuti pengguna lain
      security: [BearerAuth: []]
      parameters:
        - name: userId
          in: path
          required: true
          schema: { type: integer }
      responses:
        200: { description: Berhasil mengikuti }
    delete:
      tags: [User]
      summary: Berhenti mengikuti
      security: [BearerAuth: []]
      parameters:
        - name: userId
          in: path
          required: true
          schema: { type: integer }
      responses:
        200: { description: Berhenti mengikuti }

  # ==============================
  # MODERATOR
  # ==============================
  /moderator/review-queue:
    get:
      tags: [Moderator]
      summary: Antrean artikel yang menunggu review
      security: [BearerAuth: []]
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: status
          in: query
          schema:
            type: string
            enum: [submitted, review]
      responses:
        200:
          description: Daftar artikel dalam antrean
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/ArticleInQueue' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

  /moderator/articles/{id}/review:
    put:
      tags: [Moderator]
      summary: Melakukan review artikel (approve, reject, request revision)
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/ArticleId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [action]
              properties:
                action:
                  type: string
                  enum: [approve, reject, revision]
                review_notes:
                  type: string
                  description: Wajib jika action reject atau revision
      responses:
        200: { description: Review berhasil diproses }
        400: { $ref: '#/components/responses/BadRequest' }

  /moderator/reports:
    get:
      tags: [Moderator]
      summary: Daftar laporan konten
      security: [BearerAuth: []]
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        200:
          description: Daftar laporan
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/ReportItem' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

  /moderator/reports/{id}/resolve:
    put:
      tags: [Moderator]
      summary: Selesaikan laporan (abaikan atau hapus konten)
      security: [BearerAuth: []]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                resolution:
                  type: string
                  enum: [ignore, delete]
      responses:
        200: { description: Laporan diselesaikan }

  /moderator/comments:
    get:
      tags: [Moderator]
      summary: Semua komentar untuk moderasi
      security: [BearerAuth: []]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, approved, rejected]
        - name: page
          in: query
          schema: { type: integer }
      responses:
        200:
          description: Daftar komentar
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/CommentModeration' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

  /moderator/comments/{id}/moderate:
    put:
      tags: [Moderator]
      summary: Setujui/tolak komentar
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/CommentId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [approved, rejected]
      responses:
        200: { description: Status komentar diperbarui }

  # ==============================
  # ADMIN
  # ==============================
  /admin/recycle-bin:
    get:
      tags: [Admin]
      summary: Lihat data yang terhapus (soft delete)
      security: [BearerAuth: []]
      parameters:
        - name: type
          in: query
          schema: { type: string, enum: [articles, comments, users] }
        - name: page
          in: query
          schema: { type: integer }
      responses:
        200:
          description: Daftar item di recycle bin
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/RecycleBinItem' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

  /admin/recycle-bin/{type}/{id}/restore:
    put:
      tags: [Admin]
      summary: Pulihkan item yang dihapus
      security: [BearerAuth: []]
      parameters:
        - name: type
          in: path
          required: true
          schema: { type: string, enum: [articles, comments, users] }
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        200: { description: Item berhasil dipulihkan }

  /admin/settings:
    get:
      tags: [Admin]
      summary: Lihat pengaturan sistem
      security: [BearerAuth: []]
      responses:
        200:
          description: Key-value pengaturan
          content:
            application/json:
              schema:
                type: object
                additionalProperties: true
    put:
      tags: [Admin]
      summary: Perbarui pengaturan sistem
      security: [BearerAuth: []]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                site_name: { type: string }
                site_description: { type: string }
                site_logo: { type: string, format: uri }
                favicon: { type: string, format: uri }
                posts_per_page: { type: integer }
                maintenance_mode: { type: boolean }
      responses:
        200: { description: Pengaturan diperbarui }

  /admin/menu:
    get:
      tags: [Admin]
      summary: Lihat struktur menu
      security: [BearerAuth: []]
      responses:
        200:
          description: Array item menu (bisa bersarang)
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/MenuItem' }
    post:
      tags: [Admin]
      summary: Tambah item menu
      security: [BearerAuth: []]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MenuItemCreate'
      responses:
        201: { description: Item menu ditambahkan }

  /admin/menu/{id}:
    put:
      tags: [Admin]
      summary: Update item menu
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/MenuItemId'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MenuItemCreate'
      responses:
        200: { description: Item menu diperbarui }
    delete:
      tags: [Admin]
      summary: Hapus item menu
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/MenuItemId'
      responses:
        200: { description: Item menu dihapus }

  /admin/backup:
    get:
      tags: [Admin]
      summary: Riwayat backup (daftar file)
      security: [BearerAuth: []]
      responses:
        200:
          description: Daftar backup
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    filename: { type: string }
                    created_at: { type: string, format: date-time }
                    size: { type: string }
    post:
      tags: [Admin]
      summary: Buat backup database baru
      security: [BearerAuth: []]
      responses:
        201: { description: Backup berhasil dibuat }

  /admin/backup/{filename}:
    get:
      tags: [Admin]
      summary: Unduh file backup
      security: [BearerAuth: []]
      parameters:
        - name: filename
          in: path
          required: true
          schema: { type: string }
      responses:
        200:
          description: File SQL
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary

  /admin/users:
    get:
      tags: [Admin]
      summary: Manajemen pengguna (daftar semua)
      security: [BearerAuth: []]
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: role
          in: query
          schema: { type: string }
        - name: status
          in: query
          schema: { type: string, enum: [active, suspended, deleted] }
      responses:
        200:
          description: Daftar pengguna
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/AdminUserItem' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

  /admin/users/{id}/role:
    put:
      tags: [Admin]
      summary: Ubah peran pengguna
      security: [BearerAuth: []]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [role]
              properties:
                role: { type: string }
      responses:
        200: { description: Peran diperbarui }

  /admin/users/{id}/suspend:
    put:
      tags: [Admin]
      summary: Nonaktifkan akun
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/UserId'
      responses:
        200: { description: Akun dinonaktifkan }

  /admin/users/{id}:
    delete:
      tags: [Admin]
      summary: Soft delete pengguna
      security: [BearerAuth: []]
      parameters:
        - $ref: '#/components/parameters/UserId'
      responses:
        200: { description: Pengguna dihapus (soft delete) }

  /admin/audit-logs:
    get:
      tags: [Admin]
      summary: Lihat audit log
      security: [BearerAuth: []]
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: user_id
          in: query
          schema: { type: integer }
        - name: action
          in: query
          schema: { type: string }
        - name: from
          in: query
          schema: { type: string, format: date-time }
        - name: to
          in: query
          schema: { type: string, format: date-time }
      responses:
        200:
          description: Daftar log
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/AuditLog' }
                  meta: { $ref: '#/components/schemas/PaginationMeta' }

# ==============================
# COMPONENTS
# ==============================
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Token JWT dari /auth/login

  parameters:
    ArticleId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID artikel
    CommentId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID komentar
    TopicId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID topik forum
    CategoryId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID kategori
    TemplateId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID template
    UserId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID pengguna
    NotificationId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID notifikasi
    MenuItemId:
      name: id
      in: path
      required: true
      schema: { type: integer }
      description: ID item menu

  schemas:
    # ---------------------
    # Auth & User
    # ---------------------
    UserProfile:
      type: object
      properties:
        id: { type: integer }
        email: { type: string, format: email }
        display_name: { type: string }
        role: { type: string }
        avatar_url: { type: string, nullable: true }

    UserProfileDetail:
      allOf:
        - $ref: '#/components/schemas/UserProfile'
        - type: object
          properties:
            bio: { type: string }
            job_title: { type: string }
            department: { type: string }
            division: { type: string }
            badges:
              type: array
              items: { $ref: '#/components/schemas/Badge' }
            stats:
              type: object
              properties:
                articles_published: { type: integer }
                comments_count: { type: integer }
                likes_given: { type: integer }

    ProfileUpdate:
      type: object
      properties:
        display_name: { type: string }
        bio: { type: string }
        job_title: { type: string }
        department: { type: string }
        division: { type: string }

    AdminUserItem:
      type: object
      properties:
        id: { type: integer }
        email: { type: string }
        display_name: { type: string }
        role: { type: string }
        status: { type: string }
        created_at: { type: string, format: date-time }

    Badge:
      type: object
      properties:
        id: { type: integer }
        name: { type: string }
        description: { type: string }
        icon: { type: string }
        awarded_at: { type: string, format: date-time }

    # ---------------------
    # Articles
    # ---------------------
    ArticleSummary:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }
        slug: { type: string }
        author: { $ref: '#/components/schemas/UserProfile' }
        category: { type: string }
        tags: { type: array, items: { type: string } }
        excerpt: { type: string }
        thumbnail_url: { type: string }
        published_at: { type: string, format: date-time }
        stats:
          type: object
          properties:
            views: { type: integer }
            likes: { type: integer }
            dislikes: { type: integer }
            comments: { type: integer }

    ArticleFull:
      allOf:
        - $ref: '#/components/schemas/ArticleSummary'
        - type: object
          properties:
            content: { type: string }
            media:
              type: array
              items: { $ref: '#/components/schemas/MediaItem' }
            sources:
              type: array
              items: { type: string }
            user_vote:
              type: string
              nullable: true
              enum: [like, dislike, null]
            is_bookmarked: { type: boolean }

    ArticlePreview:
      allOf:
        - $ref: '#/components/schemas/ArticleSummary'
        - type: object
          properties:
            content_preview: { type: string }
            is_truncated: { type: boolean, default: true }

    ArticleCreate:
      type: object
      required: [title, content, category_id]
      properties:
        title: { type: string, minLength: 5 }
        content: { type: string }
        category_id: { type: integer }
        tags: { type: array, items: { type: string } }
        template_id: { type: integer }

    ArticleUpdate:
      type: object
      properties:
        title: { type: string }
        content: { type: string }
        category_id: { type: integer }
        tags: { type: array, items: { type: string } }

    ArticleInQueue:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }
        author: { $ref: '#/components/schemas/UserProfile' }
        submitted_at: { type: string, format: date-time }
        status: { type: string }

    MediaItem:
      type: object
      properties:
        id: { type: integer }
        file_url: { type: string }
        file_type: { type: string }
        caption: { type: string }

    # ---------------------
    # Categories
    # ---------------------
    Category:
      type: object
      properties:
        id: { type: integer }
        name: { type: string }
        slug: { type: string }
        description: { type: string }
        articles_count: { type: integer }

    CategoryCreate:
      type: object
      required: [name]
      properties:
        name: { type: string }
        description: { type: string }

    # ---------------------
    # Templates
    # ---------------------
    ContentTemplate:
      type: object
      properties:
        id: { type: integer }
        name: { type: string }
        content: { type: string }
        created_at: { type: string, format: date-time }

    ContentTemplateCreate:
      type: object
      required: [name, content]
      properties:
        name: { type: string }
        content: { type: string }

    # ---------------------
    # Comments
    # ---------------------
    Comment:
      type: object
      properties:
        id: { type: integer }
        content: { type: string }
        user: { $ref: '#/components/schemas/UserProfile' }
        created_at: { type: string, format: date-time }
        replies:
          type: array
          items: { $ref: '#/components/schemas/Comment' }

    CommentModeration:
      type: object
      properties:
        id: { type: integer }
        article_id: { type: integer }
        article_title: { type: string }
        content: { type: string }
        user: { $ref: '#/components/schemas/UserProfile' }
        status: { type: string }
        created_at: { type: string, format: date-time }

    # ---------------------
    # Forum
    # ---------------------
    ForumTopic:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }
        author: { $ref: '#/components/schemas/UserProfile' }
        is_pinned: { type: boolean }
        is_locked: { type: boolean }
        replies_count: { type: integer }
        created_at: { type: string, format: date-time }
        last_activity: { type: string, format: date-time }

    ForumTopicDetail:
      allOf:
        - $ref: '#/components/schemas/ForumTopic'
        - type: object
          properties:
            content: { type: string }
            replies:
              type: array
              items: { $ref: '#/components/schemas/ForumReply' }

    ForumReply:
      type: object
      properties:
        id: { type: integer }
        content: { type: string }
        user: { $ref: '#/components/schemas/UserProfile' }
        created_at: { type: string, format: date-time }

    ForumTopicCreate:
      type: object
      required: [title, content]
      properties:
        title: { type: string }
        content: { type: string }

    # ---------------------
    # Reports
    # ---------------------
    ReportRequest:
      type: object
      required: [reason]
      properties:
        reason: { type: string, enum: [spam, inappropriate, misinformation, other] }
        description: { type: string }

    ReportItem:
      type: object
      properties:
        id: { type: integer }
        reporter: { $ref: '#/components/schemas/UserProfile' }
        reason: { type: string }
        description: { type: string }
        entity_type: { type: string }
        entity_id: { type: integer }
        entity_preview: { type: string }
        created_at: { type: string, format: date-time }

    # ---------------------
    # Notifications
    # ---------------------
    Notification:
      type: object
      properties:
        id: { type: integer }
        type: { type: string }
        data: { type: object }
        is_read: { type: boolean }
        created_at: { type: string, format: date-time }

    # ---------------------
    # Admin / System
    # ---------------------
    RecycleBinItem:
      type: object
      properties:
        type: { type: string }
        id: { type: integer }
        title: { type: string }
        deleted_by: { $ref: '#/components/schemas/UserProfile' }
        deleted_at: { type: string, format: date-time }

    MenuItem:
      type: object
      properties:
        id: { type: integer }
        label: { type: string }
        url: { type: string }
        icon: { type: string }
        parent_id: { type: integer, nullable: true }
        sort_order: { type: integer }
        is_visible: { type: boolean }
        target: { type: string }
        children:
          type: array
          items: { $ref: '#/components/schemas/MenuItem' }

    MenuItemCreate:
      type: object
      required: [label, url]
      properties:
        label: { type: string }
        url: { type: string }
        icon: { type: string }
        parent_id: { type: integer }
        sort_order: { type: integer }
        target: { type: string }

    AuditLog:
      type: object
      properties:
        id: { type: integer }
        user: { $ref: '#/components/schemas/UserProfile' }
        action: { type: string }
        entity_type: { type: string }
        entity_id: { type: integer }
        description: { type: string }
        ip_address: { type: string }
        created_at: { type: string, format: date-time }

    # ---------------------
    # General
    # ---------------------
    PaginationMeta:
      type: object
      properties:
        current_page: { type: integer }
        per_page: { type: integer }
        total_items: { type: integer }
        total_pages: { type: integer }

  responses:
    BadRequest:
      description: Permintaan tidak valid
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string }
              details: { type: array, items: { type: string } }
    Unauthorized:
      description: Tidak terautentikasi
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string, example: "Token tidak valid atau kedaluwarsa" }
    Forbidden:
      description: Tidak memiliki izin
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string, example: "Anda tidak memiliki akses" }
    NotFound:
      description: Sumber daya tidak ditemukan
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string, example: "Tidak ditemukan" }
```

**Catatan Penting**:
- Dokumen ini telah mencakup seluruh endpoint yang disebutkan dalam PRD, lengkap dengan skema request/response, parameter, autentikasi, dan dokumentasi.
- Skema diatur menggunakan komponen untuk menghindari duplikasi.
- Semua jalur menggunakan prefix `/api/v1`.
- Untuk lingkungan pengembangan, file ini dapat diimpor ke Swagger UI atau editor OpenAPI untuk menghasilkan dokumentasi interaktif, client SDK, atau pengujian kontrak dengan Postman/Newman.
- Silakan disesuaikan dengan implementasi nyata (misalnya, response yang lebih spesifik, enum, atau validasi tambahan).