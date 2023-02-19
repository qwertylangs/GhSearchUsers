import { Search } from "./modules/search.js";
import { View } from "./modules/view.js";
import { Api } from "./modules/api.js";
import { Cache } from "./modules/cache.js";

const api = new Api();
const cache = new Cache(api);

const view = new View(api, cache);

const search = new Search(view, cache);
