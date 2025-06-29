/**
 * A client for a public API providing information about countries.
 * Documentation available here: https://restcountries.com/
 */

/**
 * Axios is used as HTTP client
 * https://www.npmjs.com/package/axios
 */
import axios from "axios";

/**
 * Typing for data returned by endpoints of https://restcountries.com/
 * This is a partial, work in progress, implementation of said typing.
 */
interface Country {
  cca2: string; // 2-letter code https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
  name: {
    common: string;
    official: string;
  };
}

export default class Countries {
  private restApi = axios.create({
    baseURL: "https://restcountries.com/v3.1",
  });

  /**
   * Example of how to query the rest API.
   * @param name Country name to search for
   * @returns List of countries matching searched term
   */
  public async searchByName(name: string) {
    const { data } = await this.restApi.get<Country[]>(
      `/name/${encodeURIComponent(name)}`
    );

    return data;
  }

  // 🗺 Add your method(s) here
  
  /**
   * Get country information by 2-letter country code
   * @param countryCode 2-letter ISO country code (e.g., "US", "JP", "NG")
   * @returns Country name, or the original country code if not found
   */
  public async getCountryName(countryCode: string | null): Promise<string | null> {
    // Return null if no country code provided
    if (!countryCode || countryCode.trim() === '') {
      return null;
    }

    try {
      const { data } = await this.restApi.get<Country[]>(
        `/alpha/${encodeURIComponent(countryCode.toUpperCase())}`
      );
      
      // The API returns an array, but for a specific country code, it should be just one result
      if (data.length > 0 && data[0].name?.common) {
        return data[0].name.common;
      }
      
      // Fallback to country code if no name found
      return countryCode.toUpperCase();
    } catch (error) {
      // Handle cases where country code is not found or API is unreachable
      // Return the original country code as fallback
      console.error(`Failed to fetch country for code ${countryCode}:`, error);
      return countryCode.toUpperCase();
    }
  }
}
