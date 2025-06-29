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
  }

  type Query {
    authors: [Author!]!
  }
`;

export const resolvers = {
  Query: {
    authors: async (parent, args, context: Context) => {
      // 🐞 Bug fix: Now fetching authors from the database!
      return await db.listAuthors();
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
