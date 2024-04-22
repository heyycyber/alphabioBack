//Our Dependencies
const dotenv =require ('dotenv');
const {MongoClient} =require ('mongodb');
dotenv.config({
  path: `./.env`,
});
const uri = process.env.MONGODB_URI;
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const port = process.env.PORT;
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
// import multer from "multer";
// import path from "path";

// Lets Create DB

// const db = mysql.createConnection({
//   user: "root",
//   host: "localhost",
//   password: "",
//   database: "alphabiomedicaldb",
// });



app.get("/ourProducts", async (req, res) => {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Specify the "alphabiomedicaldb" database
    const db = client.db('alphabiomedicaldb');

    // Access the "productcategory" collection
    const collection = db.collection('productcategory');

    // Retrieve documents from the collection
    const documents = await collection.find({}).toArray();

    // Send the documents as a JSON response
    res.json(documents);
  }
   catch (error) {
    console.error('Error accessing MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    // Close the connection
    await client.close();
  }
});


app.get("/newLaunchProducts", async (req, res) => {
  let client = null; // Declare the client variable

  try {
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('alphabiomedicaldb');

    const pediaProductsCollection = db.collection('pediaproducts');
    const dermatologyProductsCollection = db.collection('dermatologyproducts');
    const entProductsCollection = db.collection('entproducts');
    const generalProductsCollection = db.collection('generalproducts');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          productLaunchDate: { $gte: thirtyDaysAgo }
        }
      }
    ];

    const documents = await Promise.all([
      pediaProductsCollection.aggregate(pipeline).toArray(),
      dermatologyProductsCollection.aggregate(pipeline).toArray(),
      entProductsCollection.aggregate(pipeline).toArray(),
      generalProductsCollection.aggregate(pipeline).toArray()
    ]);

    const mergedDocuments = documents.flat();

    res.json(mergedDocuments);
  } catch (error) {
    console.error('Error accessing MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});


app.get("/pediaProducts", async (req, res) => {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Specify the "alphabiomedicaldb" database
    const db = client.db('alphabiomedicaldb');

    // Access the "pediaproducts" collection
    const collection = db.collection('pediaproducts');

    // Retrieve documents from the collection
    const documents = await collection.find({}).toArray();

    // Send the documents as a JSON response
    res.send(documents);
    console.log(documents);
  } catch (error) {
    console.error('Error accessing MongoDB:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    await client.close();
  }
});

app.get("/dermaProducts", async (req, res) => {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Specify the "alphabiomedicaldb" database
    const db = client.db('alphabiomedicaldb');

    // Access the "pediaproducts" collection
    const collection = db.collection('dermatologyproducts');

    // Retrieve documents from the collection
    const documents = await collection.find({}).toArray();

    // Send the documents as a JSON response
    res.send(documents);
    console.log(documents);
  } catch (error) {
    console.error('Error accessing MongoDB:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    await client.close();
  }
});
app.get("/entProducts", async (req, res) => {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Specify the "alphabiomedicaldb" database
    const db = client.db('alphabiomedicaldb');

    // Access the "pediaproducts" collection
    const collection = db.collection('entproducts');

    // Retrieve documents from the collection
    const documents = await collection.find({}).toArray();

    // Send the documents as a JSON response
    res.send(documents);
    console.log(documents);
  } catch (error) {
    console.error('Error accessing MongoDB:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    await client.close();
  }
});
app.get("/generalProducts", async (req, res) => {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Specify the "alphabiomedicaldb" database
    const db = client.db('alphabiomedicaldb');

    // Access the "pediaproducts" collection
    const collection = db.collection('generalproducts');

    // Retrieve documents from the collection
    const documents = await collection.find({}).toArray();

    // Send the documents as a JSON response
    res.send(documents);
    console.log(documents);
  } catch (error) {
    console.error('Error accessing MongoDB:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    await client.close();
  }
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});

app.post("/uploadProductType", upload.single("imagee"), (req, res) => {
  
  console.log(req.file);
  const setImage = req.file.filename;
  const { name, title } = req.body;

  const productType = {
    productTypeName: name,
    productTypeTitle: title,
    productTypeImage: setImage
  };
  const client = new MongoClient(uri);
  
  const db = client.db('alphabiomedicaldb');

  // Assuming you have a MongoDB collection named "productcategory"
  db.collection("productcategory").insertOne(productType, (err, result) => {
    if (err) {
      console.error("Error inserting product type:", err);
      return res.json({ Message: "Error" });
    }

    res.json({ Status: "Success" });

    const tablename = name.toLowerCase();
    db.createCollection(`${tablename}products`, (err, result) => {
      if (err) {
        console.error(`Error creating ${tablename}Products collection:`, err);
      } else {
        console.log(`Success creating ${tablename}Products collection`);
      }
    });
  });
});

app.get("/collections", async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('alphabiomedicaldb');
    const collections = await db.listCollections().toArray();

    // List of collections to exclude
    const excludedCollections = ['productcategory'];

    // Filter out excluded collections
    const filteredCollections = collections.filter(collection => !excludedCollections.includes(collection.name));

    const collectionNames = filteredCollections.map(collection => collection.name);

    client.close(); // Close the MongoDB connection

    return res.status(200).json(collectionNames);
  } catch (err) {
    console.error("Error fetching collections:", err);
    return res.status(500).json({ message: "Error fetching collections" });
  }
});
app.post("/uploadProductDetails", upload.single("productImage"), async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('alphabiomedicaldb');

    const productImage = req.file.filename;
    const {
      productName,
      productTitle,
      productComposition,
      productAvailability,
      productIndication,
      productAdverseEffects,
      selectedTable,
    } = req.body;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const productLaunchDate = new Date(year, month - 1, day); // Convert to Date object

    const collection = db.collection(selectedTable);

    const insertResult = await collection.insertOne({
      productName,
      productTitle,
      productImage,
      productComposition,
      productAvailability,
      productIndication,
      productAdverseEffects,
      productLaunchDate,
    });

    client.close(); // Close the MongoDB connection

    if (insertResult.insertedCount === 1) {
      return res.json({ status: "Success" });
    } else {
      return res.json({ status: "Error" });
    }
  } catch (err) {
    console.error("Error inserting product details:", err);
    return res.status(500).json({ message: "Error inserting product details" });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


