let profile = null;
let books  = null;
let isFollower = null;
let clickedUserId = null;
const username = localStorage.getItem("clickedUsername");
//localStorage.removeItem('clickedUsername');
const userId = localStorage.getItem('userId');
let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');


document.addEventListener("DOMContentLoaded", function() {
    fetchUser(username);
    
    async function fetchUser(username) {
        try {
            let response = await fetch(`http://localhost:8000/api/v1/users/c/${username}`, {
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
                  response = await fetch(`http://localhost:8000/api/v1/users/c/${username}`, {
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
            if (response.status === 402) {
                console.log("profile does not exist")
            }
            if (response.ok) {
                const data = await response.json();
                //console.log(data)
                profile = data.data.profile;
                books = data.data?.books;
                clickedUserId = profile?._id;
                //console.log(profile);
                isFollower = profile.isFollower;
                document.querySelector('.title').textContent = profile?.fullname;
                renderAvatar(profile.avatar);
                renderprofileDetails(profile?.fullname,profile?.username,profile?.followerCount,profile?.followedToCount);
                renderBooks();  
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
    }
    // Function to render the profile cover image
    function renderAvatar(avatar_url) {
        const avatarDiv = document.getElementById("avatar");
        avatarDiv.innerHTML = "";
        const avatar = document.createElement('img');
        avatar.classList.add("user-avatar");
        avatar.src = avatar_url;
        avatarDiv.appendChild(avatar);
    }

    // Function to render profile details
    function renderprofileDetails(fullname,username,followerCount,followedToCount) {
        const profileDetailsDiv = document.getElementById("profileDetails");

        profileDetailsDiv.innerHTML = "";

        const profileFullname = document.createElement('h2');
        profileFullname.textContent = fullname;
        profileFullname.classList.add("profileFullname");
        profileDetailsDiv.appendChild(profileFullname);

        const profileUsername = document.createElement('p');
        profileUsername.innerHTML = `<strong>@</strong>${username}`;
        profileUsername.classList.add("profileUsername");
        profileDetailsDiv.appendChild(profileUsername);

        const profileStatus = document.createElement('div');
        profileStatus.classList.add("profileStatus")

        const profileFollowers = document.createElement('p');
        profileFollowers.innerHTML = `<strong>Followers</strong>: ${followerCount}`;
        profileFollowers.classList.add('profileFollowers');
        profileStatus.appendChild(profileFollowers);


        const profileFollowing = document.createElement('p');
        profileFollowing.innerHTML = `<strong>Following</strong>: ${followedToCount}`;
        profileFollowing.classList.add('profileFollowing');
        profileStatus.appendChild(profileFollowing);

        profileDetailsDiv.appendChild(profileStatus);

        const profileButtons = document.createElement('div');
        profileButtons.classList.add('profileButtons');


        const followButton = document.createElement('button');
        followButton.classList.add('followButton');
        if (isFollower) {
            followButton.textContent = "UnFollow";
            followButton.addEventListener('click', async ()=>{
                let response  = await fetch(`http://localhost:8000/api/v1/subscriptions/userSub/${clickedUserId}`,{
                    method : 'PUT',
                    headers:{
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials:"include"
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
                      response  = await fetch(`http://localhost:8000/api/v1/subscriptions/userSub/${clickedUserId}`,{
                        method : 'PUT',
                        headers:{
                            'Authorization': `Bearer ${accessToken}`
                        },
                        credentials:"include"
                      });
                    } else {
                      // If the refresh token is invalid, clear tokens and redirect to login
                    //   localStorage.removeItem('accessToken');
                    //   localStorage.removeItem('refreshToken');
                      localStorage.clear();
                      window.location.href = '../html/login.html';
                      throw new Error('Unable to refresh token');
                    }
                }
                if (response.ok) {
                    followButton.textContent = "Follow"; 
                }
                fetchUser(username)
            })
        }else {
            followButton.textContent = "Follow";
            followButton.addEventListener('click', async ()=>{
                let response  = await fetch(`http://localhost:8000/api/v1/subscriptions/userSub/${clickedUserId}`,{
                    method : 'PUT',
                    headers:{
                        'Authorization': `Bearer ${accessToken}`
                    },
                    //credentials: 'include'
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
                      response  = await fetch(`http://localhost:8000/api/v1/subscriptions/userSub/${clickedUserId}`,{
                        method : 'PUT',
                        headers:{
                            'Authorization': `Bearer ${accessToken}`
                        },
                        //credentials: 'include'
                      });
                    } else {
                      // If the refresh token is invalid, clear tokens and redirect to login
                    //   localStorage.removeItem('accessToken');
                    //   localStorage.removeItem('refreshToken');
                      localStorage.clear();
                      window.location.href = '../html/login.html';
                      throw new Error('Unable to refresh token');
                    }
                }
                if (response.ok) {
                    followButton.textContent = "UnFollow";
                }
                fetchUser(username)
            })
        }
        if (userId !== clickedUserId) {
            profileButtons.appendChild(followButton);
        }
        profileDetailsDiv.appendChild(profileButtons);
    }


    // Function to render Books
    function renderBooks() {
        const bookList = document.querySelector(".books");
        bookList.innerHTML = "";
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
});