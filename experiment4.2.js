const express=require("express");
//const express = require('express');
//const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const app = express();
const port = 3000;

const app = express();
app.use(express.json());

let cards = [
{ id: 1, suit: 'hearts', value: 'ace', collection: 'standard' },
{ id: 2, suit: 'spades', value: 'king', collection: 'vintage' }
];

function getConnection(){
    mongoose.connect('mongodb://localhost:27017/Cards')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

}

const cardSchema = new mongoose.Schema({
    id:{
        type:Number,
        required:true,
        unique:true
    },
    suit:{
        type:String,
        trim:true
    },
    value:{
        type:String,
        trim:true
    },
    collection:{
        type:String,
        trim:true
    }
});

const Card=mongoose.model('Cards',cardSchema);

function nextId(){
    let x=cards.length+1;
    return x;
}
app.get('/api/cards', async (req, res) => {
    //res.json(cards);
    const cards = await Card.find();
    res.json(cards);
});

app.get('/api/cards/:id', (req, res) => {
    const card = cards.find(c => c.id === parseInt(req.params.id));
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
});

 app.post('/api/cards', (req, res) => {
    getConnection();
    const { suit, value, collection } = req.body;
    if (!suit || !value || !collection) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const newcard = {
    id: nextId(),
    suit,
    value,
    collection
    };

    cards.push(newcard);
    const newCard = new Card({
        id:nextId(),
        suit,
        value,
        collection
    });

    
    try {
        newCard.save();
        res.json({"message":"Records saved"})
    }
    catch(err)
    {
        if (err.code === 11000) {
            res.json({"message":"Error occured "});
          } else {
            res.json({"message":"Error occured please check"});
          }
    }
    
}); 

app.put('/api/cards/:id', (req, res) => {
    const card = cards.find(c => c.id === parseInt(req.params.id));
    if (!card) return res.status(404).json({ error: 'Card not found' });
    const { suit, value, collection } = req.body;
    if (suit) card.suit = suit;
    if (value) card.value = value;
    if (collection) card.collection = collection;
    res.json(card);
});

app.delete('/api/cards/:id', (req, res) => {
    const index = cards.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Card not found' });
    cards.splice(index, 1);
    res.status(204).send();
});

// server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  