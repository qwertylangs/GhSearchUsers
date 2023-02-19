export class Cache {
  constructor(api) {
    this.api = api;
    this.cacheAside = new Map();
    this.cacheSearch = new Map();
  }

  async getUserData(login) {
    if (this.cacheAside.has(login)) {
      // console.log("from cache");
      return this.cacheAside.get(login);
    } else {
      const response = await this.api.loadUserData(login);
      if (!response) return false;

      this.cacheAside.set(login, response);
      console.log("cashed");
      return response;
    }
  }

  async getUsers(inputValue, currentPage) {
    const hash = (one, two) => one + "," + two;
    const key = hash(inputValue, currentPage);

    if (this.cacheSearch.has(key)) {
      // console.log("from cache");
      return this.cacheSearch.get(key);
    } else {
      const response = this.api.requestUsers(inputValue, currentPage);
      this.cacheSearch.set(key, response);
      // console.log("cashed");
      return response;
    }
  }
}
