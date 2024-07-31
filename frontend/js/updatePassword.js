let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

const form = document.getElementById("profile_imageButton");



form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        let response = await fetch(`http://localhost:8000/api/v1/users/update-password`,{
            method : 'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            credentials:'include',
            body: JSON.stringify({
                oldPassword,
                newPassword,
            }),
        });
        if (response.ok) {
            alert("Password is Successfully updated")
            localStorage.clear();
            window.location.href = '../html/login.html';
        }
        else if (response.status === 401) {
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
              response = await fetch(`http://localhost:8000/api/v1/users/update-password`,{
                method : 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
                

              });
              if (response.ok) {
                alert("Password is Successfully updated")
                localStorage.clear();
                window.location.href = '../html/login.html';
              }
              else if(response.status === 400){
                alert("All Fields are Required")
              }
              else if(response.status === 402){
                alert("New Password is Required")
              }
              else if(response.status === 404){
                alert("User not found")
              }
              else if(response.status === 403){
                alert("Password is incorrect")
              }
              else if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              
            } else {
              localStorage.clear();
              window.location.href = '../html/login.html';
              throw new Error('Unable to refresh token');
            }
          }
        else if(response.status === 400){
            alert("All Fields are Required")
        }
        else if(response.status === 402){
            alert("New Password is Required")
        }
        else if(response.status === 404){
            alert("User not found")
        }
        else if(response.status === 403){
            alert("Password is incorrect")
        }
        else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
    } catch (error) {
        console.error('Error loging out:', error)
    }

    form.reset();
})
