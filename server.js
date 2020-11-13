const {db,syncAndSeed,model:{People,Places,Things,Purchases}} = require('./db');
const express = require('express');
const path = require('path')
const { urlencoded } = require('express');
const app = express();

app.use(express.urlencoded({ extended:false }));
app.use(require('method-override')('_method'));
app.use('/',express.static(path.join(__dirname)));

app.delete('/purchases/:id',async(req,res,next)=>{
    const purchase = await Purchases.findByPk(req.params.id);
    await purchase.destroy();
    res.redirect('/')
})

app.post('/',async(req,res,next)=>{
    try{
        await Purchases.create(req.body)
        res.redirect('/')
    }catch(error){
        next(error)
    }
})

app.get('/',async(req,res,next)=>{
    try{
        const [people,places,things,purchases] = await Promise.all([
            People.findAll(),
            Places.findAll(),
            Things.findAll(),
            Purchases.findAll({
                include:[People,Places,Things]
            })
        ])  
    
        res.send(`
        <html>
        <head>
            <title>People,Places and Things</title>
            <link rel='stylesheet' href = 'styles.css'/>
        </head>
        <body>
            <h1>People,Places and Things</h1>
            <form method = 'POST' id='mainform'>
                
                <label for='person' class='label'>PERSON</label>
                <select name = 'personId'>
                    <option>----not selected----</option>
                        ${people.map(person=>`
                        <option value=${person.id}>
                        ${person.name}
                        </option>
                        `).join('')}
                </select>
                <label for='place' class='label'>PLACE</label>
                <select name = 'placeId'>
                    <option>----not selected----</option>
                        ${places.map(place=>`
                        <option value=${place.id}>
                        ${place.name}
                        </option>
                        `).join('')}
                </select>
                <label for='thing' class='label'>THING</label>
                <select name = 'thingId'>
                    <option>----not selected----</option>
                        ${things.map(thing=>`
                        <option value=${thing.id}>
                        ${thing.name}
                        </option>
                        `).join('')}
                </select>
                

                <div id='countdate'>
                    <label for='count'>Count</label>
                    <input name='count'></input>
                    <label for='date'>Date</label>
                    <input name='date' placeholder='yyyy-mm-dd'></input>
                </div>
                <button>
                SUBMIT
                </button>
            </form>
            <div id ='purchasehistory'>
            <h1>Purchase History</h1>
            <ul>
            ${purchases.map(elem=>`
                <li>
                ${elem.person.name} purchased ${elem.count} ${elem.thing.name} in ${elem.place.name} on ${elem.date.getFullYear()}-${elem.date.getMonth()}-${elem.date.getDate()}
                <form method = 'POST' action='/purchases/${elem.id}?_method=DELETE'>
                <button>X</button>
                </form>
                </li>
            `).join('')}
            </ul>
        </body>
        </html>
        
        
        
        
        
        
        `)
    }catch(error){
        next(error)
    }
})


const init = async() => {
    try{
        await syncAndSeed();
        console.log('READY');
        const port = process.env.PORT || 3000
        app.listen(port,()=>{console.log(`Listening on Port: ${port}`)})
    }catch(error){
        console.log(error);
    }
}

init()