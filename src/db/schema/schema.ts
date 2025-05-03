import { pgTable, serial, varchar, text, timestamp, boolean, pgEnum, integer } from 'drizzle-orm/pg-core'


export const issueStatus = pgEnum("issue_status", ["open", "in-progress", "resolved"])
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
email: text('email').notNull().unique(),
emailVerified: boolean('email_verified').notNull(),
image: text('image'),
createdAt: timestamp('created_at').notNull(),
updatedAt: timestamp('updated_at').notNull(),
role: text('role'),
banned: boolean('banned'),
banReason: text('ban_reason'),
banExpires: timestamp('ban_expires')
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  status: issueStatus("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  location: varchar("location", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  userUpvoted: text("user_upvoted").array().notNull(),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
providerId: text('provider_id').notNull(),
userId: text('user_id').notNull().references(()=> users.id, { onDelete: 'cascade' }),
accessToken: text('access_token'),
refreshToken: text('refresh_token'),
idToken: text('id_token'),
accessTokenExpiresAt: timestamp('access_token_expires_at'),
refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
scope: text('scope'),
password: text('password'),
createdAt: timestamp('created_at').notNull(),
updatedAt: timestamp('updated_at').notNull()
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
value: text('value').notNull(),
expiresAt: timestamp('expires_at').notNull(),
createdAt: timestamp('created_at'),
updatedAt: timestamp('updated_at')
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(()=> users.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by')
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  author: text("author").notNull(),
  authorId: text("author_id").notNull(),
  date: timestamp("date").notNull(),
  likes: integer("likes").notNull().default(0),
  likedBy: text("liked_by").array().notNull(),
  replyTo: text("reply_to")
})