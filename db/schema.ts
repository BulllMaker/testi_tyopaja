import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const approvalPackages = sqliteTable("approval_packages", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  month: text("month").notNull(),
  clientEmail: text("client_email").notNull(),
  videoCount: integer("video_count").notNull(),
  fileName: text("file_name").notNull(),
  fileKey: text("file_key").notNull(),
  fileType: text("file_type").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  approvedAt: text("approved_at"),
  approvedBy: text("approved_by"),
}, (table) => [index("idx_approval_packages_client_email").on(table.clientEmail)]);

