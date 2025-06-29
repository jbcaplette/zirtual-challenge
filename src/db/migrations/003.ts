/**
 * Migration file to add pronouns column to the `authors` table
 */

import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.table("authors", (table) => {
    // Pronouns field to store author's preferred pronouns
    // Examples: "she/her", "he/him", "they/them", etc.
    table.string("pronouns").nullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.table("authors", (table) => {
    table.dropColumn("pronouns");
  });
}
