const express = require('express');
const cors = require('cors');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsbi62n.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db('car-doctor').collection('services')
        const bookingCollection = client.db('car-doctor').collection('bookings')

        // Auth related API
        app.post('/jwt', async (req, res) =>{
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn : '1h' })
            res.send(token);
        })
        // Sevices related API
        // get data
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // get specific data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }

            const options = {
                // Include only the `title` `price` and `service_id` fields in the returned document
                projection: {
                    title: 1,
                    price: 1,
                    service_id : 1,
                    img : 1,
                },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })

        // post bookings
        app.post('/bookings', async(req, res) =>{
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        // Read booking data
        app.get('/bookings', async(req, res) =>{
            console.log(req.query.email);
            let query = {};
            if(req.query?.email){
                query = { email: req.query.email }
            }
            const cursor = bookingCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // update booking
        app.put('/booking/:id', async(req, res) =>{
            const updateBooking = req.body;
            console.log(updateBooking);
        })

        // delete data from bookings
        app.delete('/bookings/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({
            ping: 1
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`this port is running at port ${port}`);
})