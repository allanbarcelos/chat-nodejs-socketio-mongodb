- check if Docker and docker-compose is installed in your system , if not go to https://www.docker.com
- create a file .env (see the .env.example)
- to run the project open the terminal and type <code>docker-compose up -d</code>
- the API will started in http://localhost:3000
- the APP will start in http://localhost
- to stop  type in terminal <code>docker-compose down</code> or 
- to stop and exclude the created volumes <code>docker-compose down -v/</code>

### Attention
I this this POC (Proof Of Concept) were created a docker-compose for run in one server and the services
runing together, in real world you will run this in multiples servers or in a cloud server with balance.


[Online DEMO](https://chat.barcelos.dev)
