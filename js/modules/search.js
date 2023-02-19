const USER_PER_PAGE = 21;

export class Search {
  constructor(view, cache) {
    this.view = view;
    this.cache = cache;
    this.view.input.addEventListener("input", this.searchUsers.bind(this));
    this.view.input.addEventListener("paste", this.searchUsers.bind(this));
    this.view.loadMore.addEventListener("click", this.loadMoreUsers.bind(this));
    this.currentPage = 1;
  }

  loadMoreUsers() {
    this.currentPage++;
    this.getResponse();
  }

  async searchUsers() {
    this.clearUsers();
    this.currentPage = 1;
    this.getResponse();
  }

  getResponse = this.debounce(async function getResponse() {
    const inputValue = this.view.input.value;

    if (inputValue) {
      const users = await this.cache.getUsers(inputValue, this.currentPage);

      const totalCount = users.total_count;
      this.setCounterMessage(totalCount);
      this.toggleLoadmoreBtn(totalCount > USER_PER_PAGE * this.currentPage);
      users.items.forEach((user) => {
        this.view.createUser(user);
      });
    } else {
      this.toggleLoadmoreBtn(this.view.input.value);
      this.setCounterMessage("");
      this.clearUsers();
    }
  }, 400);

  clearUsers() {
    this.view.row.innerHTML = "";
  }

  toggleLoadmoreBtn(bool) {
    this.view.loadMore.style.display = bool ? "block" : "none";
  }

  setCounterMessage(totalCount) {
    if (totalCount === "") {
      this.view.searchCounter.textContent = "";
      return;
    }
    this.view.searchCounter.textContent = totalCount
      ? `Найдено ${totalCount} пользователей`
      : "Пользователи не найдены";
  }

  debounce(cb, ms) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        cb.apply(this, arguments);
      }, ms);
    };
  }
}
