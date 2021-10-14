import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "./middleware/auth.js"
import cors from "cors";

const app = express();
const PORT = 1620
app.use(express.json())
dotenv.config();
app.use(cors())





//creating connection 
async function createconnections() {
    const MONGO_URL = process.env.MONGO_URL
    const client = new MongoClient(MONGO_URL)
    await client.connect();
    console.log("connected")
    return client;
}

// authentication and authorization process

//route

app.get("/",auth,  async (request, response) => {
    const client = await createconnections();
    const user = await client.db("MainDataBase").collection("people").find({}).toArray();
    response.send(user)



});



//craete user

app.post("/users", async (request, response) => {

    const client = await createconnections();
    const addUser = request.body;
    const result = await client.db("googledrive").collection("people1").insertMany(addUser)
    console.log(addUser, result)
    response.send(result)

});



//signup

app.post("/managers/signup", async (request, response) => {
    const client = await createconnections()
    const { username, password } = request.body;
    console.log(username, password)
    const salt = await bcrypt.genSalt(10)
    const hashpass = await bcrypt.hash(password, salt)
    const result = await client.db("MainDataBase").collection("managers").insertOne({ username: username, password: hashpass })
    console.log(result)
    response.send(result)
});




//validating
//here all pass are stored in database
app.get("/managers", async (request, response) => {
    const { id } = request.params;
    const client = await createconnections();
    const user = await client.db("MainDataBase").collection("managers").find({}).toArray()
    console.log(user)
    response.send(user)
});




// loging process start
app.post("/login", async (request, response) => {
    const client = await createconnections()
    const { username, password } = request.body;
    const result = await client.db("MainDataBase").collection("managers").findOne({ username: username })
    console.log(result)
    const passwordsendbyuser = result.password;
    const ispasswordmatch = await bcrypt.compare(password, passwordsendbyuser)
    console.log(ispasswordmatch)
    if (ispasswordmatch) {
        const token = jwt.sign({ id: result._id }, process.env.SECRET_KEY)
        response.send({ messege: "valid", token: token })

    }
    else {
        response.send({ messege: "invalid" })

    }
});


app.listen(PORT, () => console.log("start server", PORT))