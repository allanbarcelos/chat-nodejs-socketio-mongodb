# Simple NODEJs Chat

## Introduction
This application is a simple real-time chat that uses Node.js, Socket.io, and MongoDB. It allows users to connect and chat in dynamically created chat rooms. This documentation will guide you through the steps to set up and use the application.

## Prerequisites
Before you get started, make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

## Installation
Follow the steps below to install the application:

1. Clone the repository to your local system:
   ```bash
   git clone https://github.com/allanbarcelos/simple-nodejs-socketio-mongodb-chat.git
   ```

2. Navigate to the project directory:
   ```bash
   cd simple-nodejs-socketio-mongodb-chat
   ```

3. Install the dependencies using npm or yarn:
   ```bash
   npm install
   ```

## Configuration
Before starting the application, you need to configure the MongoDB database and other parameters. You can do this by editing the `config.js` file in the project's root directory. Here are some important configurations:

- `dbURL`: The MongoDB database connection URL.
- `sessionSecret`: The secret key for the application's session.

Ensure that MongoDB is running before starting the application.

## Running the Application
To start the application, run the following command in the project directory:

```bash
npm start
```

The application will be available at `http://localhost:3000` by default.

## Usage
The application provides the following functionalities:

- **User Registration**: Users can register by providing a username and password.
- **User Login**: Registered users can log in with their credentials.
- **Real-Time Chat**: Connected users can join chat rooms and send real-time messages to other participants in the room.
- **Create/Join Chat Rooms**: Users can create new chat rooms or join existing ones.
- **Logout**: Users can log out of their accounts.

## Contributing
If you wish to contribute to the project, feel free to create pull requests or report issues on the GitHub repository.

## License
This project is licensed under the MIT License. Refer to the [LICENSE](https://github.com/allanbarcelos/simple-nodejs-socketio-mongodb-chat/blob/master/LICENSE) file for more details.

## Author
This project was created by [Allan Barcelos](https://github.com/allanbarcelos).

## Contact
For any questions or support, you can get in touch with the author or open an issue on the GitHub repository.