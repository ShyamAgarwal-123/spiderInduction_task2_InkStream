let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

const email_form = document.getElementById('registrationForm')
//const fullname_form = document.querySelector('emailButton');


email_form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;

    try {
        let response = await fetch(`http://localhost:8000/api/v1/users/update-account`,{
            method : 'PATCH',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            credentials:'include',
            body: JSON.stringify({
                email
            }),
        });
        if (response.ok) {
            alert("Email is Successfully updated")
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
              response = await fetch(`http://localhost:8000/api/v1/users/update-account`,{
                method : 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    email
                }),

              });
              if (response.ok) {
                alert("Email is Successfully updated")
                localStorage.clear();
                window.location.href = '../html/login.html';
              }
              else if(response.status === 400){
                alert("Email Field is Empty")
              }
              else if(response.status === 409){
                alert("Email already exists")
              }
              else if(response.status === 402){
                alert("Something Went wrong Please Try Again")
              }
              else if (!response.ok) {
               alert('Unable to update Email');
              }
            } else {
              localStorage.clear();
              window.location.href = '../html/login.html';
              throw new Error('Unable to refresh token');
            }
        }
        else if(response.status === 400){
            alert("Email Field is Empty")
        }
        else if(response.status === 409){
            alert("Email already exists")
        }
        else if(response.status === 402){
            alert("Something Went wrong Please Try Again")
        }
        else if (!response.ok) {
           alert('Unable to update Email');
        }
        
    } catch (error) {
        console.error('Error loging out:', error)
    }

    email_form.reset();
})



