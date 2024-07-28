const clickedUsername = localStorage.getItem("myusername");
let accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

const profile = document.querySelector('.profile')
profile.addEventListener('click',()=>{
    localStorage.setItem("clickedUsername",clickedUsername)
    
})

const logout = document.querySelector('.logout')
logout.addEventListener('click',async()=>{
    try {
        let response = await fetch(`http://localhost:8000/api/v1/users/logout`,{
            method : 'POST',
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
              response = await fetch(`http://localhost:8000/api/v1/users/logout`,{
                method : 'POST',
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
            localStorage.clear();
            window.location.href = '../html/login.html';
        }
        
    } catch (error) {
        console.error('Error loging out:', error)
    }
})