let currentPage = 1;
const limit = 9;
let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers(currentPage, limit);

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchUsers(currentPage, limit);
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    fetchUsers(currentPage, limit);
  });

  document.getElementById('search-input').addEventListener('input', () => {
    fetchUsers(currentPage, limit);
  });

  document.getElementById('sort-select').addEventListener('change', () => {
    fetchUsers(currentPage, limit);
  });

  document.getElementById('sort-type').addEventListener('change', () => {
    fetchUsers(currentPage, limit);
  });
});

async function fetchUsers(page, limit) {
  const query = document.getElementById('search-input').value;
  const sortBy = document.getElementById('sort-select').value;
  const sortType = document.getElementById('sort-type').value;  

  try {
    let response = await fetch(`http://localhost:8000/api/v1/users/?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}&sortType=${sortType}`, {
      method: 'GET',
      credentials: 'include', // Include credentials (cookies) with the request
      headers:{
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (response.status === 401) {
      // Attempt to refresh the access token
      const refreshResponse = await fetch('http://localhost:8000/api/v1/users/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        accessToken = data.data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry the original request with the new access token
        response = await fetch(`http://localhost:8000/api/v1/users/?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}&sortType=${sortType}`, {
          method: 'GET',
          credentials: 'include', // Include credentials (cookies) with the request
          headers:{
            'Authorization': `Bearer ${accessToken}`
          }
        });
      } else {
        // If the refresh token is invalid, clear tokens and redirect to login
        
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        localStorage.clear();
        window.location.href = '../html/login.html';
        throw new Error('Unable to refresh token');
      }
    }
    const data = await response.json();
    renderUsers(data.data.users);
    updatePagination(data.data.currentPage, data.data.totalPages);
    // console.log(data);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

function renderUsers(users) {
  const userList = document.getElementById('user-list');
  userList.innerHTML = ''; // Clear existing content

  users.forEach(user => {

    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    const userDiv = document.createElement('div');
    userDiv.classList.add("user-div");
    const imgDiv = document.createElement('div');
    imgDiv.classList.add("img-div");

    // Cover image render
    const userAvatar = document.createElement('img');
    userAvatar.src = user.avatar;
    userAvatar.classList.add('user-avatar');
    imgDiv.appendChild(userAvatar);
    userItem.appendChild(imgDiv);
    imgDiv.addEventListener("click",()=>{
      localStorage.setItem("clickedUsername",user.username)
      window.location.href = `../html/user.html`;
      fetchUsers(currentPage,limit);
    })

    // Author details render
    const userFullname = document.createElement('h2');
    userFullname.textContent = user.fullname;
    userFullname.classList.add("userFullname");
    userDiv.appendChild(userFullname);

    const userUsername = document.createElement('p');
    userUsername.innerHTML = `<strong>@</strong>${user.username}`;
    userUsername.classList.add("userUsername");
    userDiv.appendChild(userUsername);

    userItem.appendChild(userDiv);

    userList.appendChild(userItem);
  });
}

function updatePagination(currentPage, totalPages) {
  document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prev-btn').disabled = currentPage === 1;
  document.getElementById('next-btn').disabled = currentPage === totalPages;
}
