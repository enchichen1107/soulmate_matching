//INITIAL DATA////////////////////////////////////////////////////////////////////
const BASE_URL = `https://lighthouse-user-api.herokuapp.com`;
const INDEX_URL = `${BASE_URL}/api/v1/users`;
const USERS_PER_PAGE = 21;
const navBar = document.querySelector(".navbar-nav");
const loveNum = document.querySelector(".love-num");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const dataPanel = document.querySelector("#data-panel");
const modalTitle = document.querySelector("#user-modal-title");
const modalImage = document.querySelector("#user-modal-image");
const modalGender = document.querySelector("#user-modal-gender");
const modalRegion = document.querySelector("#user-modal-region");
const modalBirthday = document.querySelector("#user-modal-birthday");
const modalEmail = document.querySelector("#user-modal-email");
const paginator = document.querySelector("#paginator");
const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
const users = [];
let filteredUsers = [];

//FUNCTIONS////////////////////////////////////////////////////////////////////////
////RENDER LOVENUM///////////
function renderLoveNum () {
  loveNum.innerText = list.length;
}
////RENDER USER LIST///////////
function renderUserList (data) {
  let rawHTML = "";
  data.forEach(item => {
    const preHTML = `<div class="col-sm-4">
    <div class="mb-5">`;
    const midHTML = `<img src="${item.avatar}" class="card-img-top btn-show-user" alt="User Poster" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
        <div class="card-body">
          <h5 class="card-title">${item.name} ${item.surname}</h5>
        </div>
        <div class="btnbox">
          <i class="fas fa-info-circle btn-show-user" data-toggle="modal" data-target="#user-modal" data-id="${item.id}" style="font-size: 2em"></i>`;
    const lastHTML = `</i>
        </div>
      </div>
    </div>
  </div>`;
    if (list.length === 0 || list.some(user => user.id !== item.id)) {
      rawHTML += `
      ${preHTML}<div class="card">${midHTML}<i class="fab fa-gratipay btn-add-favorite" data-id="${item.id}" style="font-size: 2em">${lastHTML}
        `;
    } else {
      rawHTML += `
      ${preHTML}<div class="card" style="background-color:#fcdcdc;">${midHTML}<i class="fab fa-gratipay btn-add-favorite love-active" data-id="${item.id}" style="font-size: 2em">${lastHTML}
        `;
    }
  });
  dataPanel.innerHTML = rawHTML;
}

////SHOW USER MODAL///////////
function showUserModal (id) {
  axios.get(`${INDEX_URL}/${id}`).then(response => {
    const data = response.data;
    modalGender.innerHTML =
      data.gender === "male"
        ? `Gender: <b style="color:#2ba7b8;font-size:24px;">♂</b>`
        : `Gender: <b style="color:#e25656;font-size:24px;">♀</b>`;
    modalTitle.innerText = `${data.name} ${data.surname}`;
    modalRegion.innerText = `Region: ${data.region}`;
    modalBirthday.innerText = `Birthday: ${data.birthday}`;
    modalEmail.innerText = `Email: ${data.email}`;
    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-poster" class="img-fluid">`;
  });
}

////ADD TO FAVORITE////////////////
function addToFavorite (id, target) {
  const user = users.find(user => user.id === id);
  if (list.some(user => user.id === id)) {
    removeFromFavorite(id, target);
  } else {
    list.push(user);
    localStorage.setItem("favoriteUsers", JSON.stringify(list));
    target.parentElement.parentElement.style.background = "#fcdcdc";
    target.classList.add("love-active");
    renderLoveNum();
  }
}

////REMOVE FROM FAVORITE//////////////////
function removeFromFavorite (id, target) {
  if (!list) return;
  const favoriteUsersIndex = list.findIndex(user => user.id === id);
  if (favoriteUsersIndex === -1) return;
  list.splice(favoriteUsersIndex, 1);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
  target.parentElement.parentElement.style.background = "#f6f7fe";
  target.classList.remove("love-active");
  renderLoveNum();
}

////SLICE USER DATA BY PAGE////////////////
function getUsersByPage (page) {
  const data = filteredUsers.length ? filteredUsers : users;
  const startIndex = (page - 1) * USERS_PER_PAGE;
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

////RENDER PAGINATOR////////////////////////
function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

//APPLICATION AREA///////////////////////////////////////////////////////////////////////////
////RENDER INITIAL LOVENUM//////
renderLoveNum();
////REQUEST & RENDER USER DATA//////
axios
  .get(INDEX_URL)
  .then(response => {
    users.push(...response.data.results);
    renderUserList(getUsersByPage(1));
    renderPaginator(users.length);
  })
  .catch(err => console.log(err));

////SWITCH GENDER////////////////
navBar.addEventListener("click", function searchGender (event) {
  if (event.target.matches(".fa-female")) {
    filteredUsers = users.filter(user => user.gender === "female");
  } else {
    filteredUsers = users.filter(user => user.gender === "male");
  }
  renderPaginator(filteredUsers.length);
  renderUserList(getUsersByPage(1));
});

////SEARCH KEYWORDS////////////////
searchInput.addEventListener("keyup", function onSearchFormSubmitted (event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(keyword) ||
      user.surname.toLowerCase().includes(keyword)
  );
  if (filteredUsers.length === 0) {
    return alert(`Your keyword：${keyword} is not found`);
  }
  renderPaginator(filteredUsers.length);
  renderUserList(getUsersByPage(1));
});

////SUBMIT SEARCHFORM////////////////
searchForm.addEventListener("submit", function restoreSearchForm (event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword.length) {
    return alert(`This blank is required!`);
  }
});

////SHOW MODAL OR ADD FAVORITE///////////
dataPanel.addEventListener("click", function onPanelClicked (event) {
  const target = event.target;
  if (target.matches(".btn-show-user")) {
    showUserModal(target.dataset.id);
  } else if (target.matches(".btn-add-favorite")) {
    addToFavorite(Number(target.dataset.id), target);
  }
});

////SWITCH BY PAGE/////////////////////
paginator.addEventListener("click", function onPaginatorClicked (event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  renderUserList(getUsersByPage(page));
});
