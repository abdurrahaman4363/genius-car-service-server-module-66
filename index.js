const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());//eta use na korle body diye je data ta pai eta parse korte pari an 

// connect to mongodb

// password: 0KidsXx5n2EjBUsu
//user: geniusUser
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jow1k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');

        app.get('/service', async (req, res) => { // get method diye data load kora hoi database teke data gulo patanu hoi client side e
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/service/:id', async(req, res) =>{// single user er jonno data patanu client side e
             const id=req.params.id;
             const query = {_id: ObjectId(id)};
             const service = await serviceCollection.findOne(query);
             res.send(service);
        })
        
        // post method to add data from client side
        app.post('/service', async(req, res) =>{
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })


        // delete method dalete something from UI and database
        app.delete('/service/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })


    }

    finally {

    }

}

run().catch(console.dir);


// test to run browser
app.get('/', (req, res) => {
    res.send('Running Genius sever')
})

// test to run server
app.listen(port, () => {
    console.log('Listening to port', port);
})