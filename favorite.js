//INITIAL DATA////////////////////////////////////////////////////////////////////
const BASE_URL = `https://lighthouse-user-api.herokuapp.com`;
const INDEX_URL = `${BASE_URL}/api/v1/users`;
const loveNum = document.querySelector(".love-num");
const dataPanel = document.querySelector("#data-panel");
const modalTitle = document.querySelector("#user-modal-title");
const modalImage = document.querySelector("#user-modal-image");
const modalGender = document.querySelector("#user-modal-gender");
const modalRegion = document.querySelector("#user-modal-region");
const modalBirthday = document.querySelector("#user-modal-birthday");
const modalEmail = document.querySelector("#user-modal-email");
const users = JSON.parse(localStorage.getItem("favoriteUsers"));

//FUNCTIONS////////////////////////////////////////////////////////////////////////
////RENDER LOVENUM///////////
function renderLoveNum () {
  loveNum.innerText = users.length;
}
////RENDER FAVORITE LIST///////////
function renderFavoriteList (data) {
  if (!data) return;
  let rawHTML = "";
  data.forEach(item => {
    rawHTML += `<div class="col-sm-4">
    <div class="mb-5">
      <div class="card" style="background-color:#fcdcdc;">
        <img src="${item.avatar}" class="card-img-top btn-show-user" alt="User Poster" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
        <div class="card-body">
          <h5 class="card-title">${item.name} ${item.surname}</h5>
        </div>
        <div class="btnbox">
          <i class="fas fa-info-circle btn-show-user" data-toggle="modal" data-target="#user-modal" data-id="${item.id}" style="font-size: 2em"></i>
          <i class="fas fa-times-circle btn-delete-user" data-id="${item.id}" style="font-size: 2em"></i>
        </div>
      </div>
    </div>
  </div>`;
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

////REMOVE FROM FAVORITE///////////
function removeFromFavorite (id) {
  if (!users) return;
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return;
  users.splice(userIndex, 1);
  localStorage.setItem("favoriteUsers", JSON.stringify(users));
  renderFavoriteList(users);
  renderLoveNum();
}

//APPLICATION AREA////////////////////////////////////////////////////////////////////////
////RENDER INITIAL DATA////////////////
renderFavoriteList(users);
renderLoveNum();
////SHOW MODAL OR REMOVE FAVORITE////////////////
dataPanel.addEventListener("click", event => {
  const target = event.target;
  if (target.matches(".btn-show-user")) {
    showUserModal(target.dataset.id);
  } else if (target.matches(".btn-delete-user")) {
    removeFromFavorite(Number(target.dataset.id));
  }
});
