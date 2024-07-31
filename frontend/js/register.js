
const form = document.getElementById("registrationForm");

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('confirm_password').value;
    const avatar = document.getElementById('profile_image').files[0];

    if (password !== passwordConfirmation) {
      alert('Passwords do not match');
      return;
    }

    // handle the form submission
    const formData = new FormData();
    formData.append('fullname', fullname);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('avatar', avatar);


    // server side request

    fetch('http://localhost:8000/api/v1/users/register', {
      method: 'POST',
      body: formData,
    }).then(response => {
      if(response.status === 409){
        alert("user already exist")
      }
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      alert("Successfully Registerd")
      form.reset();
    }).catch(error => {
      console.error('Error:', error);
      form.reset();
    });
    
  });



