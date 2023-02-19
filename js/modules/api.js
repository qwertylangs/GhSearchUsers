const URL = "https://api.github.com/";
const USER_PER_PAGE = 21;

export class Api {
  async requestUsers(inputValue, currentPage) {
    return await fetch(
      `${URL}search/users?q=${inputValue}&per_page=${USER_PER_PAGE}&page=${currentPage}`
    )
      .then((response) => response.json())
      .catch((error) => {
        console.log("Error", error.message);
      });
  }

  async loadUserData(login) {
    const urls = [
      `${URL}users/${login}/following`,
      `${URL}users/${login}/followers`,
      `${URL}users/${login}/repos`,
    ];
    const responses = await Promise.all(urls.map((url) => fetch(url)));

    for (let response of responses) {
      if (!response.ok) return false;
    }

    return await Promise.all(responses.map((resp) => resp.json()));
  }

  showApiError() {
    console.log("error");
    const container = document.querySelector(".container");
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Error 403</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Не удалось выполнить запрос на api.github.com, попробуйте позже или зайдите с другого IP-адреса(VPN)</p>
        </div>
      </div>
    </div>
    `;

    document.body.style.overflow = "hidden";

    const closeBtn = modal.querySelector(".btn-close");
    closeBtn.onclick = function () {
      document.body.style.overflow = "auto";
      modal.remove();
    };
    document.body.append(modal);
  }
}
