let currentPage = 1;
const limit = 9;
let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks(currentPage, limit);

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchBooks(currentPage, limit);
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    currentPage++;
    fetchBooks(currentPage, limit);
  });

  document.getElementById('search-input').addEventListener('input', () => {
    fetchBooks(currentPage, limit);
  });

  document.getElementById('sort-select').addEventListener('change', () => {
    fetchBooks(currentPage, limit);
  });

  document.getElementById('genre-select').addEventListener('change', () => {
    fetchBooks(currentPage, limit);
  });
  document.getElementById('sort-type').addEventListener('change', () => {
    fetchBooks(currentPage, limit);
  });
});

async function fetchBooks(page, limit) {
  const query = document.getElementById('search-input').value;
  const sortBy = document.getElementById('sort-select').value;
  const genre = document.getElementById('genre-select').value;
  const sortType = document.getElementById('sort-type').value;  

  try {
    let response = await fetch(`http://localhost:8000/api/v1/books/?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}&sortType=${sortType}&genre=${genre}`, {
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
        response = await fetch(`http://localhost:8000/api/v1/books/?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}&sortType=${sortType}&genre=${genre}`, {
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
    renderBooks(data.data.books);
    updatePagination(data.data.currentPage, data.data.totalPages);
    // console.log(data);
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

function renderBooks(books) {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = ''; // Clear existing content

  books.forEach(book => {
    if (!book.isAvailable) {
      return;
    }

    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    const authorDiv = document.createElement('div');
    authorDiv.classList.add("Author-div");
    const imgDiv = document.createElement('div');
    imgDiv.classList.add("img-div");

    // Cover image render
    const coverImg = document.createElement('img');
    coverImg.src = book.coverImage;
    coverImg.classList.add('cover-img');
    imgDiv.appendChild(coverImg);
    bookItem.appendChild(imgDiv);
    imgDiv.addEventListener("click",()=>{
      localStorage.setItem("clickedBookId",book._id)
      window.location.href = `../html/book.html`;
      fetchBooks(currentPage,limit);
    })

    // Author details render
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('Avatar-div');
    const bookDetails = document.createElement('div');
    bookDetails.classList.add('Book-details');

    avatarDiv.classList.add("avatar-div");
    const authorAvatar = document.createElement('img');
    authorAvatar.classList.add('authorAvatar');
    authorAvatar.src = book.author.avatar;
    authorAvatar.addEventListener('click',()=>{
      localStorage.setItem("clickedUsername",book.author.username)
      window.location.href = `../html/user.html`;
      fetchUsers(currentPage,limit);
    })
    avatarDiv.appendChild(authorAvatar);

    authorDiv.appendChild(avatarDiv);

    const bookTitle = document.createElement('h2');
    bookTitle.textContent = book.title;
    bookTitle.classList.add("bookTitle");
    bookDetails.appendChild(bookTitle);

    const bookAuthor = document.createElement('p');
    bookAuthor.innerHTML = `<strong>Author</strong>:${book.author.fullname}`;
    bookAuthor.classList.add("bookAuthor");
    bookDetails.appendChild(bookAuthor);

    const bookGenre = document.createElement('p');
    bookGenre.innerHTML = `<strong>Genre</strong>:${book.genre}`;
    bookGenre.classList.add("bookGenre");
    bookDetails.appendChild(bookGenre);

    const bookPrice = document.createElement('p');
    bookPrice.innerHTML = `<strong>Price</strong>:${book.price}`;
    bookPrice.classList.add("bookGenre");
    bookDetails.appendChild(bookPrice);

    const bookReviews = document.createElement('div');
    bookReviews.classList.add('bookReviews');

    const commentDiv = document.createElement('div');
    commentDiv.classList.add('commentDiv');
    const commentImg = document.createElement('img');
    commentImg.classList.add('commentImg');
    commentImg.src = "../public/icons/review.png";
    commentDiv.appendChild(commentImg);
    const totalComments = document.createElement('p');
    totalComments.classList.add('totalComments');
    totalComments.textContent = `${book.totalReviews}`;
    commentDiv.appendChild(totalComments);

    bookReviews.appendChild(commentDiv);

    const ratingDiv = document.createElement('div');
    ratingDiv.classList.add('ratingDiv');
    const ratingImg = document.createElement('img');
    ratingImg.classList.add('ratingImg');
    ratingImg.src = "../public/icons/rating.png";
    ratingDiv.appendChild(ratingImg);
    const avgRating = document.createElement('p');
    avgRating.classList.add('avgRating');
    avgRating.textContent = book.averageRating;

    ratingDiv.appendChild(avgRating);

    bookReviews.appendChild(ratingDiv);

    bookDetails.appendChild(bookReviews);

    authorDiv.appendChild(bookDetails);

    bookItem.appendChild(authorDiv);

    bookList.appendChild(bookItem);
  });
}

function updatePagination(currentPage, totalPages) {
  document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prev-btn').disabled = currentPage === 1;
  document.getElementById('next-btn').disabled = currentPage === totalPages;
}
