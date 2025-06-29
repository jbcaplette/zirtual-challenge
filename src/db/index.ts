/**
 * Database client
 * It's essentially a wrapper around Knex https://knexjs.org/
 */

import initKnex, { Knex } from "knex";

import config from "./config";
import type { Author, PaginationOptions, PaginatedResult } from "./types";

export * from "./types";

export class Db {
  private knex: Knex;

  constructor() {
    this.knex = initKnex(config.development);
  }

  public async listAuthors(options: PaginationOptions = {}): Promise<PaginatedResult<Author>> {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const [{ count }] = await this.knex.table<Author>("authors")
      .count("id as count");
    
    const totalCount = parseInt(count as string, 10);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated data
    const data = await this.knex.table<Author>("authors")
      .select("*")
      .limit(limit)
      .offset(offset)
      .orderBy("id"); // Add consistent ordering for pagination

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  public getAuthor(id: string) {
    return this.knex.table<Author>("authors").where("id", id).first();
  }

  public async createAuthor(authorData: Omit<Author, 'id'>): Promise<Author> {
    const [createdAuthor] = await this.knex.table<Author>("authors")
      .insert(authorData)
      .returning("*");
    return createdAuthor;
  }

  public async updateAuthor(id: string, authorData: Partial<Omit<Author, 'id'>>): Promise<Author | null> {
    const [updatedAuthor] = await this.knex.table<Author>("authors")
      .where("id", id)
      .update(authorData)
      .returning("*");
    return updatedAuthor || null;
  }
}

export default new Db();
