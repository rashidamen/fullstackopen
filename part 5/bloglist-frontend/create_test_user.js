import axios from 'axios'

const baseUrl = 'http://localhost:3003/api/users'

const createUser = async () => {
    try {
        const response = await axios.post(baseUrl, {
            username: 'samir',
            name: 'Super User',
            password: 'qwerty'
        })
        console.log('User created:', response.data)
    } catch (error) {
        console.error('Error creating user:', error.response ? error.response.data : error.message)
    }
}

createUser()
