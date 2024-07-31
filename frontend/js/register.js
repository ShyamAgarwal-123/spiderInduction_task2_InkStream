
const form = document.getElementById("registrationForm");


let fullname = document.getElementById('fullname').value;
let username = document.getElementById('username').value;
let email = document.getElementById('email').value;
let password = document.getElementById('password').value;
let passwordConfirmation = document.getElementById('confirm_password').value;
let avatar = document.getElementById('profile_image').files[0];

form.addEventListener('submit', (event) => {
    event.preventDefault();

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
    }).catch(error => {
      console.error('Error:', error);
    });
  });



