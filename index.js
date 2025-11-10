
// assignment-B12A10
// EmCSTbirhFUjKOXP
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// mongoDB URI and Client 
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.tachgq7.mongodb.net/?appName=Cluster0`;
// const uri = "mongodb+srv://assignment-B12A10:EmCSTbirhFUjKOXP@cluster0.tachgq7.mongodb.net/?appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.get('/', (req, res)=>{
  res.send("Server is running");
})





async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // All collection and Database
    const db = client.db("assignment-B12A10");
    const usersCollention = db.collection("users");
    const challengesCollection = db.collection("challenges");
    const ecoTipsCollection = db.collection("eco_tips");


    

    // ALl Methords 
    app.post('/users', async (req, res)=>{
      const newUser = req.body;
      const email = req.body.email;
      const query = {email: email}
      const existingUser = await usersCollention.findOne(query);
      if(existingUser){
        res.send({message: 'User already exist, Do not need to insert again.'});
      }
      else{
        const result = await usersCollention.insertOne(newUser);
        res.send(result);

      }
    })


    // Add challenges Methords 
    app.post('/api/challenges', async (req, res)=>{
      const newUser = req.body;
      const createdBy = req.body.createdBy;
      const query = {createdBy: createdBy}
      const existingChallenges = await challengesCollection.findOne(query);
      if(existingChallenges){
        res.send({message: 'Challenges already exist, Do not need to insert again.'});
      }
      else{
        const result = await challengesCollection.insertOne(newUser);
        res.send(result);
        // console.log(result);

      }
    })



        // find  challengesCollection all data
        app.get('/api/challenges', async (req, res)=> {
          const cursor = challengesCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        })


        // EcoTips Collection 
        app.get('/api/eco-tips', async (req, res)=>{
          const cursor = ecoTipsCollection.find();
          const result = await cursor.toArray();
          res.send(result)
          console.log(result);
        })



























    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, ()=>{
  console.log(`Server is running on port: ${port}`);
})

