let book = null;
let isBought = null;
let isfav = null;
const bookId = localStorage.getItem("clickedBookId");
//localStorage.removeItem('clickedBookId');
const userId = localStorage.getItem('userId');
let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');


document.addEventListener("DOMContentLoaded", function() {
    fetchBook(bookId);
    
    async function fetchBook(bookId) {
        try {
            let response = await fetch(`http://localhost:8000/api/v1/books/${bookId}`, {
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
                  response = await fetch(`http://localhost:8000/api/v1/books/${bookId}`, {
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
                console.log("book does not exist")
            }
            if (response.ok) {
                const data = await response.json();
                book = data.data.foundedBook[0];
                //console.log(book);
                isBought = data.data.isBought;
                isfav = data.data.isFav;
                document.querySelector('.title').textContent = book.title;
                renderCoverImage(book.coverImage);
                renderBookDetails(book.title,book.genre,book.price,book.totalReviews,book.averageRating);
                renderBookContent(book.content);
                renderReviews();
                renderAuthorDetails();   
            }
          } catch (error) {
            console.error('Error fetching book:', error);
          }
    }
    // Function to render the book cover image
    function renderCoverImage(coverImage_url) {
        const coverImageDiv = document.getElementById("coverImage");
        coverImageDiv.innerHTML = "";
        const coverImage = document.createElement('img');
        coverImage.classList.add("cover-Image");
        coverImage.src = coverImage_url;
        coverImageDiv.appendChild(coverImage);
    }

    // Function to render book details
    function renderBookDetails(title,genre,price,totalReviews,averageRating) {
        const bookDetailsDiv = document.getElementById("bookDetails");

        bookDetailsDiv.innerHTML = "";

        const bookTitle = document.createElement('h2');
        bookTitle.textContent = title;
        bookTitle.classList.add("bookTitle");
        bookDetailsDiv.appendChild(bookTitle);

        const bookGenre = document.createElement('p');
        bookGenre.innerHTML = `<strong>Genre</strong>: ${genre}`;
        bookGenre.classList.add("bookGenre");
        bookDetailsDiv.appendChild(bookGenre);

        const bookPrice = document.createElement('p');
        bookPrice.innerHTML = `<strong>Price</strong>: ${price}`;
        bookPrice.classList.add('bookPrice');
        bookDetailsDiv.appendChild(bookPrice);

        //const buyButton = document.createElement('button'); //for future buying option
        

        const bookReviews = document.createElement('div');
        bookReviews.classList.add('reviewsStatus');
    
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('commentDiv');
        const commentImg = document.createElement('img');
        commentImg.classList.add('commentImg');
        commentImg.src = "../public/icons/review.png";
        commentDiv.appendChild(commentImg);
        const totalComments = document.createElement('p');
        totalComments.classList.add('totalComments');
        totalComments.textContent = `${totalReviews}`;
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
        avgRating.textContent = averageRating;

        ratingDiv.appendChild(avgRating);
    
        bookReviews.appendChild(ratingDiv);

        bookDetailsDiv.appendChild(bookReviews);

        const bookButtons = document.createElement('div');
        bookButtons.classList.add('bookButtons');

        const favButton = document.createElement('button');
        favButton.classList.add('favButton');
        if (isfav) {
            favButton.textContent = "UnFavorite";
            favButton.addEventListener('click', async ()=>{
                let response  = await fetch(`http://localhost:8000/api/v1/books/removeFavBook/${bookId}`,{
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
                      response  = await fetch(`http://localhost:8000/api/v1/books/removeFavBook/${bookId}`,{
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
                    favButton.textContent = "Favorite"; 
                }
                fetchBook(bookId)
            })
        }else {
            favButton.textContent = "Favorite";
            favButton.addEventListener('click', async ()=>{
                let response  = await fetch(`http://localhost:8000/api/v1/books/saveFavBook/${bookId}`,{
                    method : 'PUT',
                    headers:{
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include'
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
                      response  = await fetch(`http://localhost:8000/api/v1/books/saveFavBook/${bookId}`,{
                        method : 'PUT',
                        headers:{
                            'Authorization': `Bearer ${accessToken}`
                        },
                        credentials: 'include'
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
                    favButton.textContent = "UnFavorite";
                }
                fetchBook(bookId)
            })
        }
        bookButtons.appendChild(favButton);

        const buyButton = document.createElement('button');
        buyButton.classList.add('buyButton');

        if (!isBought) {
          buyButton.textContent = "Buy";
          buyButton.addEventListener('click', async ()=>{
              let response  = await fetch(`http://localhost:8000/api/v1/book-subscriptions/subBook/${bookId}`,{
                  method : 'PUT',
                  headers:{
                      'Authorization': `Bearer ${accessToken}`
                  },
                  credentials: 'include'
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
                    response  = await fetch(`http://localhost:8000/api/v1/book-subscriptions/subBook/${bookId}`,{
                      method : 'PUT',
                      headers:{
                          'Authorization': `Bearer ${accessToken}`
                      },
                      credentials: 'include'
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
                  buyButton.textContent = "Bought";
                  
              }
              fetchBook(bookId)
          })
        }else {
          buyButton.disabled = true
          buyButton.textContent = "Bought";
        }
        bookButtons.appendChild(buyButton);
        bookDetailsDiv.appendChild(bookButtons)



    }

    // Function to render book content
    function renderBookContent(content) {
        const contentDiv = document.querySelector(".content");
        contentDiv.innerHTML = "";
        contentDiv.innerHTML = `<h4 class="content-text">CONTENT</h4>
        <p class="content-text">${content}</p>`
    }
    // Function to render reviews
    function renderReviews() {
        const reviewsDiv = document.querySelector(".reviews");
        reviewsDiv.innerHTML = "";
        reviewsDiv.innerHTML = `<h4 class="Reviews">REVIEWS</h4>`
        book.reviews.forEach(review => {
            const reviewElement = document.createElement("div");
            reviewElement.classList.add('reviewElement')

            const ownerDiv = document.createElement('div');
            ownerDiv.classList.add('owner-div');
            const ownerAvatar = document.createElement('img');
            ownerAvatar.addEventListener('click',()=>{
              localStorage.setItem("clickedUsername",review.owner.username)
              window.location.href = `../html/user.html`;
              fetchBook(bookId);
            })
            const ownerfullname = document.createElement('p');
            ownerAvatar.classList.add('owner-avatar');
            ownerfullname.classList.add('owner-fullname');
            ownerAvatar.src = review.owner.avatar;
            ownerfullname.textContent = review.owner.fullname;
            ownerDiv.appendChild(ownerAvatar);
            ownerDiv.appendChild(ownerfullname);

            const reviewDetails = document.createElement('div');
            reviewDetails.classList.add('review-details');

            reviewDetails.innerHTML = `
                <p><strong>Comment</strong>: ${review.comment}</p>
                <p><strong>Rating</strong>: ${review.rating}/5</p>
            `;

            const buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add("buttons-div");
            const likeButton = document.createElement('button');
            likeButton.classList.add('likeButton')
            likeButton.textContent = "Like";
            const likeCounter = document.createElement('p');
            likeCounter.classList.add('likeCounter')
            likeCounter.textContent = review.totalLikes; 
            const dislikeButton = document.createElement('button');
            dislikeButton.classList.add('dislikeButton')
            dislikeButton.textContent = "Dislike"; 
            const dislikeCounter = document.createElement('p');
            dislikeCounter.classList.add('dislikeCounter')
            dislikeCounter.textContent = review.totalDislikes;
            
            likeButton.addEventListener('click',async ()=>{
                try {
                    let response = await fetch(`http://localhost:8000/api/v1/likes/${review._id}`,{
                        method : 'PUT',
                        headers:{
                            'Authorization': `Bearer ${accessToken}`
                        },
                        credentials:'include'
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
                          response = await fetch(`http://localhost:8000/api/v1/likes/${review._id}`,{
                            method : 'PUT',
                            headers:{
                                'Authorization': `Bearer ${accessToken}`
                            },
                            credentials: 'include'
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
                        console.log(await response.json())// remove in future
                        fetchBook(bookId)
                    }
                    
                } catch (error) {
                    console.error('Error updaing likeStatus:', error)
                }
                
            });

            dislikeButton.addEventListener('click',async ()=>{
                try {
                    let response = await fetch(`http://localhost:8000/api/v1/dislikes/${review._id}`,{
                        method : 'PUT',
                        headers:{
                            'Authorization': `Bearer ${accessToken}`
                        },
                        credentials: 'include'
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
                          response = await fetch(`http://localhost:8000/api/v1/dislikes/${review._id}`,{
                            method : 'PUT',
                            headers:{
                                'Authorization': `Bearer ${accessToken}`
                            },
                            credentials:'include'
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
                        console.log(await response.json()) // remove in future
                        fetchBook(bookId)
                    }
                    
                } catch (error) {
                    console.error('Error updaing dislikeStatus:', error)
                }
                
            });

            if (review.isLiked) {
                likeButton.style.backgroundColor = "#EB7263";
                likeButton.style.color = "white";
            }else{
                likeButton.style.backgroundColor = "white"
                likeButton.style.color = "black";
            }

            if (review.isDisliked) {
                dislikeButton.style.backgroundColor = "#EB7263"
                dislikeButton.style.color = "white"
            }else{
                dislikeButton.style.backgroundColor = "white"
                dislikeButton.style.color = "black"
            }

            const like = document.createElement('div');
            like.classList.add("like");
            like.appendChild(likeCounter);
            like.appendChild(likeButton);
            buttonsDiv.appendChild(like)
            const dislike = document.createElement('div');
            dislike.classList.add("dislike")
            dislike.appendChild(dislikeCounter);
            dislike.appendChild(dislikeButton);
            buttonsDiv.appendChild(dislike);

            reviewElement.appendChild(ownerDiv);
            reviewElement.appendChild(reviewDetails);
            reviewElement.appendChild(buttonsDiv);


            if (review.owner._id === userId) {
                const deleteReview = document.createElement('div');

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('deleteButton');
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener('click',async ()=>{
                    let response  = await fetch(`http://localhost:8000/api/v1/reviews/${review._id}`,{
                        method: "DELETE",
                        headers:{
                            'Authorization': `Bearer ${accessToken}`
                        },
                        credentials: 'include'
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
                          response  = await fetch(`http://localhost:8000/api/v1/reviews/${review._id}`,{
                            method: "DELETE",
                            headers:{
                                'Authorization': `Bearer ${accessToken}`
                            },
                            credentials:'include'
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
                    if (response.status === 404) {
                        alert("Review Does not Exist")
                    }
                    if (response.ok) {
                        fetchBook(bookId);
                    }
                })

                deleteReview.appendChild(deleteButton);
                reviewElement.appendChild(deleteReview);

            }

            reviewsDiv.appendChild(reviewElement);
 
        });
    }

    // Function to render author information
    function renderAuthorDetails() {
        const authorAvatarDiv = document.querySelector(".authorAvatar");
        const authorDetailsDiv = document.querySelector(".authorDetails");
        authorAvatarDiv.innerHTML = '';
        authorDetailsDiv.innerHTML = '';

        const authorAvatar = document.createElement('img');
        authorAvatar.classList.add('author-img');
        authorAvatar.src = book.author[0].avatar;
        authorAvatar.addEventListener('click',()=>{
          localStorage.setItem("clickedUsername",book.author[0].username)
          window.location.href = `../html/user.html`;
          fetchBook(bookId);
        })
        authorAvatarDiv.appendChild(authorAvatar);     
        authorDetailsDiv.innerHTML = `
        <h3 class="author-fullname">${book.author[0].fullname}</h3>
        <p class="author-username">@${book.author[0].username}</p>
        `;
    }

    // Submit review form
    document.getElementById("reviewForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const comment = document.getElementById("comment").value;
        const rating = document.getElementById("rating").value;
        

        try {
           let response = await fetch(`http://localhost:8000/api/v1/reviews/${bookId}`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body:JSON.stringify({
                    comment,
                    rating
                }),
                credentials: 'include', // Include credentials (cookies) with the request
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
                  response = await fetch(`http://localhost:8000/api/v1/reviews/${bookId}`, {
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body:JSON.stringify({
                        comment,
                        rating
                    }),
                    credentials: 'include', // Include credentials (cookies) with the request
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
              if (response.status === 404) {
                console.log("Book Does not Exist");
              }
              if (response.status === 402) {
                console.log("All feilds are Required");
              }
              if (response.status === 400) {
                console.log("Book is not Available");
              }
              if (response.ok) {
                fetchBook(bookId);
              }

        } catch (error) {
            console.error('Error submiting review:', error);
        }

        // Reset the form
        document.getElementById("reviewForm").reset();
    });

});