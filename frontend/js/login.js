const form = document.getElementById("registrationForm");

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('confirm_password').value;

    if (password !== passwordConfirmation) {
      alert('Passwords do not match');
      return;
    }

    fetch('http://localhost:8000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
      credentials: "include",
    }).then(response => {
      if(response.status === 400){
        alert("All Fields are Required")
      }
      else if(response.status === 404){
        alert("User not found")
      }
      else if(response.status === 404){
        alert("User not found")
      }
      else if(response.status === 401){
        alert("Password is incorrect")
      }
      else if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      else{
        return response.json();
      }
    }).then(data => {
      // store userid
      localStorage.setItem("userId",data.data.user._id)
      localStorage.setItem("myusername",data.data.user.username)
      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      //console.log('Success:', data);
      window.location.href = '../html/index.html'; // Redirect to home page after successful login
    }).catch(error => {
      console.error('Error:', error);
    });
    form.reset();
    

})
