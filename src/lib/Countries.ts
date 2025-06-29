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
}
