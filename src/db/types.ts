/**
 * Typings of data stored in DB
 */

export type Author = {
  id: number;
  givenName: string;
  familyName: string;
  countryCode: string | null; // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
  pronouns: string | null; // Author's preferred pronouns (e.g., "she/her", "he/him", "they/them")
};
