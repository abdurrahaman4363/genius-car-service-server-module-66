const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());//eta use na korle body diye je data ta pai eta parse korte pari an 

function verifyJWT(req, res, next) {
    const authheader = req.headers.authorization;
    if (!authheader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authheader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: 'Forbiden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
    // console.log('inside verifyJWT',authheader);
    
}

// connect to mongodb

// password: 0KidsXx5n2EjBUsu
//user: geniusUser
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jow1k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('geniusCar').collection('service');
        const orderCollection = client.db('geniusCar').collection('order');

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            console.log('user' , user);
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // services API
        app.get('/service', async (req, res) => { // get method diye data load kora hoi database teke data gulo patanu hoi client side e
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/service/:id', async (req, res) => {// single user er jonno data patanu client side e
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        // post method to add data from client side
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })


        // delete method dalete something from UI and database
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })


        // order collection api

        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEamil = req.decoded.email;
            const email = req.query.eamil;
            // console.log(eamil)
            if (email === decodedEamil) {
                const query = { eamil: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else{
                res.status(403).send({message:'Forbidden access'});
            }
        })
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
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