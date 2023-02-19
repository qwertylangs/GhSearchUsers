export class View {
  constructor(api, cache) {
    this.api = api;
    this.prevLogin;

    this.cache = cache;
    this.history = [];

    this.container = document.querySelector(".container");
    this.input = document.querySelector("input");

    this.searchCounter = this.createElement("p", [
      "user-select-none",
      "counter",
    ]);

    this.side = this.createElement("aside", ["aside", "hide"]);
    this.main = this.createElement("div", ["main"]);
    this.usersWrapper = this.createElement("div", ["wrapper"]);
    this.users = this.createElement("div", ["cards"]);
    this.row = this.createElement("div", [
      "row",
      "row-cols-1",
      "row-cols-md-3",
      "g-4",
    ]);
    this.loadMore = this.createElement("button", [
      "btn",
      "btn-info",
      "btn-lg",
      "align-center",
    ]);
    this.loadMore.textContent = "Загрузить еще!";
    this.loadMore.style.display = "none";

    this.container.append(this.searchCounter);
    this.container.append(this.main);
    this.main.append(this.usersWrapper);
    this.main.append(this.side);
    this.usersWrapper.append(this.users);
    this.usersWrapper.append(this.loadMore);
    this.users.append(this.row);
  }

  createElement(elemTag, elemClasses = []) {
    const element = document.createElement(elemTag);
    elemClasses.forEach((className) => {
      element.classList.add(className);
    });
    return element;
  }

  createUser(userData) {
    const col = this.createElement("div", ["col"]);
    const card = this.createElement("div", ["card", "h-100"]);
    card.onclick = (e) => {
      this.history.length = 0;
      this.showUserData(userData.login, userData.avatar_url);
    };
    card.innerHTML = `
    <img src="${userData.avatar_url}" class="card-img-top" alt="${userData.login}" />
      <div class="card-body">
      <h5 class="card-title">${userData.login}</h5>
    </div>`;

    this.row.append(col);
    col.append(card);
  }

  showUserData = this.debounce(async function showUserData(login, avatarUrl) {
    if (this.prevLogin === login) {
      console.log("repeat");
      return;
    }
    this.prevLogin = login;

    const response = await this.cache.getUserData(login);
    if (!response) this.api.showApiError();
    console.log(response);

    this.side.classList.remove("hide");
    this.side.innerHTML = "";

    const [following, followers, repos] = response;

    this.createFigure(login, avatarUrl);
    this.createList(following, "Following", "login");
    this.createList(followers, "Followers", "login");
    this.createList(repos, "Repositories", "name");

    if (this.history.length === 0) {
      this.history.push(login);
      console.log(this.history);
    }

    this.createPagination(login);
  }, 400);

  createList(list, title, selector) {
    const listWrapper = this.createElement("div", ["list-wrapper"]);
    const ul = this.createElement("ul", ["list"]);
    const titleEl = this.createElement("div", ["list-title"]);
    titleEl.textContent = title;

    list.forEach((user) => {
      const li = this.createElement("li", ["list-item"]);
      const link = this.createElement("a", ["link"]);
      link.textContent = user[selector];
      // клик на подписчика / подписку
      link.addEventListener("click", (e) => {
        if (title === "Repositories") {
          console.log(e.target);
          const login = e.target
            .closest(".aside")
            .firstElementChild.lastElementChild.textContent.split(" ")[0];
          console.log(login);
          e.target.href = `https://github.com/${login}/${e.target.textContent}`;
          e.target.target = "_blank";
          return;
        }
        e.preventDefault;
        const login = e.target.textContent;

        // проверка являеться ли последний элементом истрории текущим юзером(если нет то нужно отрисовать из истории)
        if (!this.history.includes(login)) {
          this.history.push(user.login);
        }
        console.log(this.history);
        this.linkHandler.call(this, login);
      });

      li.append(link);
      ul.append(li);
    });
    listWrapper.append(titleEl);
    listWrapper.append(ul);
    this.side.append(listWrapper);
  }

  createFigure(login, avatarUrl) {
    const figure = this.createElement("figure", ["figure"]);
    const linkGH = this.createElement("a", ["btn", "btn-info"]);
    linkGH.href = `https://github.com/${login}`;
    linkGH.target = "_blank";
    linkGH.textContent = "Open profine in GitHub";

    const closeBtn = this.createElement("button", ["btn-close"]);
    closeBtn.addEventListener("click", (e) => {
      this.prevLogin = "";
      this.side.innerHTML = "";
      this.side.classList.add("hide");
    });

    figure.innerHTML = `
      <img src="${avatarUrl}" class="figure-img img-fluid rounded" alt="${login}">
      <figcaption class="figure-caption">${login} ${linkGH.outerHTML} </figcaption>
    `;

    figure.prepend(closeBtn);

    this.side.append(figure);
  }

  createPagination(activeLogin) {
    const pagination = this.createElement("ul", [
      "pagination",
      "pagination-lg",
    ]);

    this.history.forEach((login, i) => {
      const li = this.createElement("li", ["page-item"]);
      if (login === activeLogin) li.classList.add("active");

      const link = this.createElement("a", ["page-link"]);
      link.textContent = i + 1;

      link.addEventListener("click", (e) => {
        const pageNum = e.target.textContent - 1;
        const pageLogin = this.history[pageNum];
        this.linkHandler(pageLogin);
      });

      li.append(link);
      pagination.append(li);
    });
    this.side.append(pagination);
  }

  async linkHandler(login) {
    const users = await this.cache.getUsers(login, 1);
    const user = users.items[0];
    this.showUserData(user.login, user.avatar_url);
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
