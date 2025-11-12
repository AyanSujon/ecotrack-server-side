
// assignment-B12A10
// EmCSTbirhFUjKOXP
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// const verifyfirebaseToken = (req, res, next)=>{
//   console.log("in the verify middleware", req.headers.authorization);



//   next();
// }


























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



app.get('/', (req, res) => {
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
    const eventsCollection = db.collection("events");
    const subscribersCollection = db.collection("subscribers");
    const challengesParticipantsCollection = db.collection("challengesParticipants");



    // ALl Methords 
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email }
      const existingUser = await usersCollention.findOne(query);
      if (existingUser) {
        res.send({ message: 'User already exist, Do not need to insert again.' });
      }
      else {
        const result = await usersCollention.insertOne(newUser);
        res.send(result);

      }
    })

    //     // without filter challengesCollection api 
    // app.get('/api/challenges', async (req, res) => {
    //   const cursor = challengesCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })


    // participants range filtering using $gte / $lte Example query:
    app.get('/api/challenges', async (req, res) => {
      try {
        // Get query parameters from URL
        const { participantsMin, participantsMax, category, startDateFrom, startDateTo } = req.query;

        // Create dynamic filter object
        const filter = {};

        // participants range filtering using $gte / $lte  (/api/challenges?participantsMin=10&participantsMax=100)
        if (participantsMin || participantsMax) {
          filter.participants = {};
          if (participantsMin) filter.participants.$gte = parseInt(participantsMin);
          if (participantsMax) filter.participants.$lte = parseInt(participantsMax);
        }




        // Get category from query parameters
        // Example: ?category=Waste%20Reduction,Energy%20Saving
        if (category) {
          // Split comma-separated categories into array
          const categories = Array.isArray(category) ? category : category.split(',');
          filter.category = { $in: categories };
        }
        // Api endpoint:
        // /api/challenges?category=Waste%20Reduction,Energy%20Saving
        // GET /api/challenges?category=Waste%20Reduction




    // StartDate range filter
    if (startDateFrom || startDateTo) {
      filter.startDate = {};
      if (startDateFrom) filter.startDate.$gte = startDateFrom;
      if (startDateTo) filter.startDate.$lte = startDateTo;
    }
    // Api endPoints:
    // 2. Filter by startDate between 2024-07-01 and 2024-07-31:
    // GET /api/challenges?startDateFrom=2024-07-01&startDateTo=2024-07-31

    // 3. Filter by category "Waste Reduction" and startDate range:
    // GET /api/challenges?category=Waste%20Reduction&startDateFrom=2024-07-01&startDateTo=2024-07-31




    
        // Fetch filtered data from MongoDB
        const result = await challengesCollection.find(filter).toArray();



        // Send response
        res.send(result);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }

      // Api endpoints:
      // GET /api/challenges
      // GET /api/challenges?participantsMin=50
      // GET /api/challenges?participantsMax=100
      // GET /api/challenges?participantsMin=10&participantsMax=100

    });


















    // find  challengesCollection all data
    app.get('/api/participants', async (req, res) => {
      const cursor = challengesParticipantsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })











































    // Add challenges Method
    app.post('/api/challenges',  async (req, res) => {
      const newChallenge = req.body;
      const { createdBy, title } = newChallenge;

      // Check if the same user already added this specific challenge title
      const query = { createdBy: createdBy, title: title };
      const existingChallenge = await challengesCollection.findOne(query);

      if (existingChallenge) {
        return res.status(400).send({
          success: false,
          message: 'You have already added this challenge. Please choose a different title.'
        });
      }

      // If not found, insert the new challenge
      const result = await challengesCollection.insertOne(newChallenge);
      res.send({ success: true, result });
    });













    // POST /api/participants - Add new participant and increase challenge count
    app.post('/api/participants', async (req, res) => {
      try {
        const participant = req.body;
        const { participantEmail, challengeId } = participant;

        // Check if the participant already joined this challenge
        const existing = await challengesParticipantsCollection.findOne({
          participantEmail,
          challengeId
        });

        if (existing) {
          return res.status(400).send({
            message: 'You have already joined this challenge!',
          });
        }

        // Insert the new participant
        const result = await challengesParticipantsCollection.insertOne(participant);

        //  Update participants count in related challenge
        await challengesCollection.updateOne(
          { _id: new ObjectId(challengeId) },
          { $inc: { participants: 1 } }
        );

        res.status(201).send({
          message: 'Participant joined successfully',
          result,
        });
      } catch (error) {
        console.error('Error adding participant:', error);
        res.status(500).send({ message: 'Server error', error });
      }
    });


    // New subscriber Api 
    app.post("/api/subscribe", async (req, res) => {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: "Name and Email are required" });
      }

      try {
        // Check if email already exists
        const existing = await subscribersCollection.findOne({ email });
        if (existing) {
          return res.status(400).json({ message: "Email already subscribed" });
        }

        // Insert new subscriber
        const result = await subscribersCollection.insertOne({
          name,
          email,
          createdAt: new Date(),
        });

        res.status(201).json({ message: "Subscribed successfully!", subscriberId: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });





    // EcoTips Collection 
    app.get('/api/eco-tips', async (req, res) => {
      const cursor = ecoTipsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
      // console.log(result);
    })

    // PATCH /api/eco-tips/:id/upvote for update recent Tips
    app.patch('/api/ecotips/:id/upvote', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const update = { $inc: { upvotes: 1 }, $set: { updatedAt: new Date() } };
        const result = await ecoTipsCollection.updateOne(query, update);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update upvotes" });
      }
    });

    // 

    // events Collection 
    app.get('/api/events', async (req, res) => {
      const cursor = eventsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
      // console.log(result);
    })

    // Find single event
    app.get('/api/events/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.findOne(query);
      res.send(result);
    })













// UPDATE a challenge (by ID)
app.patch('/api/challenges/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const query = { _id: new ObjectId(id) };


    const updateDoc = {
      $set: {
        title: updatedData.title,
        category: updatedData.category,
        description: updatedData.description,
        duration: updatedData.duration,
        target: updatedData.target,
        impactMetric: updatedData.impactMetric,
        startDate: updatedData.startDate,
        endDate: updatedData.endDate,
        imageUrl: updatedData.imageUrl,
        updatedAt: new Date(),
      },
    };

    const result = await challengesCollection.updateOne(query, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("Error updating challenge:", error);
    res.status(500).send({ message: "Failed to update challenge" });
  }
});


// DELETE a challenge (by ID)
app.delete('/api/challenges/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await challengesCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).send({ message: "Failed to delete challenge" });
  }
});




    // Find single Challenges by id
    app.get('/api/challenges/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await challengesCollection.findOne(query);
      res.send(result);
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




app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})

