const testUser = {
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

fetch('http://localhost:3000/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testUser),
})
.then(response => response.json())
.then(data => console.log('Registration result:', data))
.catch(error => console.error('Error:', error));