import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { user } from "./schema.ts";

// The monoes.me library (workflows, web automations, orgs) that MonoAgent
// installs from. Kept out of schema.ts so that file stays under the size
// limit; drizzle.config.ts lists both files. Gallery orgs in `org_upload`
// are exposed as public `kind=org` items by src/lib/library/store.ts rather
// than copied here.
export const libraryItem = sqliteTable(
  "library_item",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(), // "workflow" | "automation" | "org"
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    visibility: text("visibility").notNull().default("private"), // "private" | "public" | "official"
    tagsJson: text("tags_json").notNull().default("[]"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Denormalized from the current library_version row.
    currentVersionId: text("current_version_id").notNull(),
    version: text("version").notNull(),
    sha256: text("sha256").notNull(),
    size: integer("size").notNull(),
    metaJson: text("meta_json").notNull().default("{}"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("library_item_kind_slug_unique").on(table.kind, table.slug),
    index("library_item_owner_idx").on(table.ownerId),
    index("library_item_visibility_idx").on(table.visibility),
  ],
);

export const libraryVersion = sqliteTable(
  "library_version",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => libraryItem.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    sha256: text("sha256").notNull(),
    size: integer("size").notNull(),
    contentType: text("content_type").notNull(),
    filename: text("filename").notNull(),
    r2Key: text("r2_key").notNull(),
    metaJson: text("meta_json").notNull().default("{}"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("library_version_item_version_unique").on(table.itemId, table.version),
    index("library_version_created_by_idx").on(table.createdBy, table.createdAt),
  ],
);

// Community votes and comments on library items, the same shape as
// org_vote / org_comment (gallery orgs keep using those two tables).
export const libraryVote = sqliteTable(
  "library_vote",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => libraryItem.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [uniqueIndex("library_vote_item_user_unique").on(table.itemId, table.userId)],
);

export const libraryComment = sqliteTable(
  "library_comment",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => libraryItem.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("library_comment_item_idx").on(table.itemId)],
);
