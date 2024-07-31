
const userId = localStorage.getItem('userId');
let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

const form = document.getElementById("bookForm");

let title = document.getElementById('title').value;
let content = document.getElementById('content').value;
let genre = document.getElementById('genre').value;
let price = document.getElementById('price').value;
let coverImage = document.getElementById('coverImage').files[0];


form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // handle the form submission
    const formData = new FormData();
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('price', price);
    formData.append('coverImage', coverImage);
    formData.append('content', content);


    // server side request

    try {
      let response = await fetch('http://localhost:8000/api/v1/books/publish', {
        method: 'POST',
        body: formData,
        headers:{
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
      });
      if (response.ok) {
        alert("Book is Successfully Uploaded")
      }
      else if(response.status === 401) {
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
            response = await fetch('http://localhost:8000/api/v1/books/publish', {
              method: 'POST',
              body: formData,
              headers:{
                'Authorization': `Bearer ${accessToken}`
              },
              credentials: 'include',
            });
            if (response.ok) {
              alert("Book is Successfully Uploaded")
            }
            else if(response.status === 400){
              alert("All Fields are Required")
            }
            else if(!response.ok) {
              alert('Unable To Upload Book');
            }
          } else {
            // If the refresh token is invalid, clear tokens and redirect to login
          //   localStorage.removeItem('accessToken');
          //   localStorage.removeItem('refreshToken');
            localStorage.clear();
            window.location.href = '../html/login.html';
            throw new Error('Unable to refresh token');
          }
        }

      else if(response.status === 400){
        alert("All Fields are Required")
      }
      else if(!response.ok) {
        alert('Unable To Upload Book');
      }
      
    } catch (error) {
      console.error('Error Uploading the Book:', error)
    }
    form.reset();
  });



