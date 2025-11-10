// ✅ POST /api/participants - Add new participant and increase challenge count
app.post('/api/participants', async (req, res) => {
  try {
    const participant = req.body;

    // Insert the new participant
    const result = await challengesParticipantsCollection.insertOne(participant);

    // ✅ Update participants count in the related challenge
    await challengesCollection.updateOne(
      { _id: new ObjectId(participant.challengeId) },
      { $inc: { participants: 1 } }
    );

    res.status(201).send({ message: 'Participant joined successfully', result });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).send({ message: 'Server error', error });
  }
});

