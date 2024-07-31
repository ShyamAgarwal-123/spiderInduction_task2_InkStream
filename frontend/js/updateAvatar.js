document.addEventListener('DOMContentLoaded', async() => {
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const profileImageForm = document.getElementById('registrationForm');

  profileImageForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const avatar = document.getElementById('profile_image').files[0];

      const formData = new FormData();
      formData.append('avatar', avatar);

      try {
          let response = await fetch(`http://localhost:8000/api/v1/users/update-avatar`, {
              method: 'PATCH',
              headers: {
                  'Authorization': `Bearer ${accessToken}`
              },
              credentials: 'include',
              body: formData,
          });


          if (response.ok) {
              alert("Profile Image Successfully updated");
          } else if (response.status === 401) {
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
                  response = await fetch(`http://localhost:8000/api/v1/users/update-avatar`, {
                      method: 'PATCH',
                      headers: {
                          'Authorization': `Bearer ${accessToken}`
                      },
                      credentials: 'include',
                      body: formData,
                  });

                  if (response.ok) {
                      alert("Profile Image Successfully updated");
                  } else {
                      console.error('Retry failed:', await response.text());
                      throw new Error('Retrying the request failed');
                  }
              } else {
                  console.error('Token refresh failed:', await refreshResponse.text());
                  localStorage.clear();
                  window.location.href = '../html/login.html';
                  throw new Error('Unable to refresh token');
              }
          } else if (response.status === 400) {
              alert("Profile Image Field is Empty");
          } else if (response.status === 402) {
              alert("Something Went wrong. Please Try Again");
          } else {
              alert('Unable to update Profile Image');
          }
      } catch (error) {
          console.error('Error Updating Profile Image:', error);
      }

      profileImageForm.reset();
  });
});
