/**
 * Graph definitions and corresponding resolvers
 */

import { gql } from "graphql-tag";
import { Context } from "../types";
import db from "../db";
import Countries from "../lib/Countries";

// Countries that use family-name-first naming convention
const FAMILY_NAME_FIRST_COUNTRIES = ['JP']; // Japan - can add more countries like 'KR', 'CN', 'VN', etc.

export const typeDefs = gql`
  type Author {
    id: ID!
    givenName: String!
    familyName: String!
    displayName: String!
    countryName: String
    pronouns: String
  }

  input CreateAuthorInput {
    givenName: String!
    familyName: String!
    countryCode: String
    pronouns: String
  }

  input UpdateAuthorInput {
    givenName: String
    familyName: String
    countryCode: String
    pronouns: String
  }

  type Query {
    authors: [Author!]!
    author(id: ID!): Author
  }

  type Mutation {
    createAuthor(input: CreateAuthorInput!): Author!
    updateAuthor(id: ID!, input: UpdateAuthorInput!): Author
  }
`;

export const resolvers = {
  Query: {
    authors: async (parent, args, context: Context) => {
      // 🐞 Bug fix: Now fetching authors from the database!
      return await db.listAuthors();
    },
    author: async (parent, args, context: Context) => {
      // Input validation
      if (!args.id) {
        throw new Error('Author ID is required');
      }
      
      // Sanitize and validate ID format (assuming numeric IDs)
      const id = String(args.id).trim();
      if (!/^\d+$/.test(id)) {
        throw new Error('Invalid author ID format');
      }
      
      try {
        const author = await db.getAuthor(id);
        return author || null; // Return null if not found (GraphQL standard)
      } catch (error) {
        console.error('Error fetching author:', error);
        throw new Error('Failed to fetch author');
      }
    },
  },
  Mutation: {
    createAuthor: async (parent, args, context: Context) => {
      const { input } = args;
      
      // Input validation
      if (!input.givenName?.trim()) {
        throw new Error('Given name is required');
      }
      if (!input.familyName?.trim()) {
        throw new Error('Family name is required');
      }
      
      // Validate country code format if provided (2-letter ISO code)
      if (input.countryCode && !/^[A-Z]{2}$/.test(input.countryCode)) {
        throw new Error('Country code must be a 2-letter ISO code (e.g., "US", "JP")');
      }
      
      try {
        const authorData = {
          givenName: input.givenName.trim(),
          familyName: input.familyName.trim(),
          countryCode: input.countryCode?.toUpperCase() || null,
          pronouns: input.pronouns?.trim() || null,
        };
        
        return await db.createAuthor(authorData);
      } catch (error) {
        console.error('Error creating author:', error);
        throw new Error('Failed to create author');
      }
    },
    updateAuthor: async (parent, args, context: Context) => {
      const { id, input } = args;
      
      // Input validation
      if (!id) {
        throw new Error('Author ID is required');
      }
      
      // Sanitize and validate ID format
      const authorId = String(id).trim();
      if (!/^\d+$/.test(authorId)) {
        throw new Error('Invalid author ID format');
      }
      
      // Validate country code format if provided
      if (input.countryCode && !/^[A-Z]{2}$/.test(input.countryCode)) {
        throw new Error('Country code must be a 2-letter ISO code (e.g., "US", "JP")');
      }
      
      // Check if author exists
      const existingAuthor = await db.getAuthor(authorId);
      if (!existingAuthor) {
        throw new Error('Author not found');
      }
      
      try {
        // Build update data object with only provided fields
        const updateData: any = {};
        
        if (input.givenName !== undefined) {
          if (!input.givenName?.trim()) {
            throw new Error('Given name cannot be empty');
          }
          updateData.givenName = input.givenName.trim();
        }
        
        if (input.familyName !== undefined) {
          if (!input.familyName?.trim()) {
            throw new Error('Family name cannot be empty');
          }
          updateData.familyName = input.familyName.trim();
        }
        
        if (input.countryCode !== undefined) {
          updateData.countryCode = input.countryCode?.toUpperCase() || null;
        }
        
        if (input.pronouns !== undefined) {
          updateData.pronouns = input.pronouns?.trim() || null;
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
          return existingAuthor; // No changes to apply
        }
        
        return await db.updateAuthor(authorId, updateData);
      } catch (error) {
        console.error('Error updating author:', error);
        throw new Error('Failed to update author');
      }
    },
  },
  Author: {
    displayName: (parent) => {
      const givenName = parent.givenName?.trim() || '';
      const familyName = parent.familyName?.trim() || '';
      
      // Handle case where one or both names might be empty
      if (!givenName && !familyName) {
        return 'Unknown Author';
      }
      if (!givenName) {
        return familyName;
      }
      if (!familyName) {
        return givenName;
      }
      
      // Japanese naming convention: Family name comes first
      if (parent.countryCode && FAMILY_NAME_FIRST_COUNTRIES.includes(parent.countryCode)) {
        return `${familyName} ${givenName}`;
      }
      
      // Default naming convention: Given name first
      return `${givenName} ${familyName}`;
    },
    countryName: async (parent) => {
      const countries = new Countries();
      return await countries.getCountryName(parent.countryCode);
    },
  },
};
