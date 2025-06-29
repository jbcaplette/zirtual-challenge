/**
 * Graph definitions and corresponding resolvers
 */

import { gql } from "graphql-tag";
import { Context } from "../types";

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
    authors: (parent, args, context: Context) => {
      // 🐞 Bug fix needed!
      // We're not returning what's in DB 😱
      return [];
    },
  },
};
