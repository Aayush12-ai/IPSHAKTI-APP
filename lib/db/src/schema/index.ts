import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const researchUsers = pgTable("research_users", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const researchProjects = pgTable("research_projects", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => researchUsers.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const researchSessions = pgTable("research_sessions", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => researchProjects.id),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const researchHistory = pgTable("research_history", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => researchProjects.id),
  sessionId: text("session_id")
    .notNull()
    .references(() => researchSessions.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const researchMemories = pgTable("research_memories", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => researchProjects.id),
  memoryType: text("memory_type").notNull().default("finding"),
  title: text("title").notNull(),
  finding: text("finding").notNull(),
  entities: jsonb("entities").$type<string[]>().notNull().default([]),
  sources: jsonb("sources").$type<Array<Record<string, string>>>().notNull().default([]),
  sourceCount: integer("source_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});