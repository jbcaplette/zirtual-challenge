/**
 * Graph definitions and corresponding resolvers
 */

import { gql } from "graphql-tag";
import { Context } from "../types";
import db from "../db";
import Countries from "../lib/Countries";

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
      
      return `${givenName} ${familyName}`;
    },
    countryName: async (parent) => {
      const countries = new Countries();
      return await countries.getCountryName(parent.countryCode);
    },
  },
};
