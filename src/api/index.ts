/**
 * Graph definitions and corresponding resolvers
 */

import { gql } from "graphql-tag";
import { Context } from "../types";
import db from "../db";

export const typeDefs = gql`
  type Author {
    id: ID!
    givenName: String!
    familyName: String!
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
};
