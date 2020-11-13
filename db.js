const Sequelize = require('sequelize');
const {STRING,INTEGER,DATE} = Sequelize;
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_ppt_db')

const People = db.define('people',{
    name:{
        type:STRING
    }
})

const Places = db.define('places',{
    name:{
        type:STRING
    }
})

const Things = db.define('things',{
    name:{
        type:STRING
    }
})

const Purchases = db.define('purchases',{
    count:{
        type:INTEGER
    },
    date:DATE
})

Purchases.belongsTo(People);
People.hasMany(Purchases);

Purchases.belongsTo(Places);
Places.hasMany(Purchases);

Purchases.belongsTo(Things);
Things.hasMany(Purchases);



const syncAndSeed = async() => {
await db.sync({force:true});

const [moe,lucy,larry]=await Promise.all(
    ['moe','lucy','larry'].map(name => People.create({name}))
    );

const [NYC,Chicago,LA,Dallas]=await Promise.all(
    ['NYC','Chicago','LA','Dallas'].map(name => Places.create({name}))
    );

const [foo,bar,baz,qua]=await Promise.all(
    ['foo','bar','baz','qua'].map(name => Things.create({name}))
    );

const [purchase1,purchase2,purchase3]=await Promise.all([
    Purchases.create({count:3,date:'2020/10/31'}),
    Purchases.create({count:1,date:'2019/11/06'}),
    Purchases.create({count:2,date:'2020/03/15'})
])

purchase1.personId=moe.id;
purchase1.placeId=LA.id;
purchase1.thingId=foo.id
purchase2.personId=larry.id;
purchase2.placeId=Chicago.id;
purchase2.thingId=bar.id
purchase3.personId=lucy.id;
purchase3.placeId=Chicago.id;
purchase3.thingId=baz.id;

await purchase1.save()
await purchase2.save()
await purchase3.save()

}

module.exports={
    db,
    syncAndSeed,
    model:{
        People,
        Places,
        Things,
        Purchases
    }
}