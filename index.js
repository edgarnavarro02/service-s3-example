require('dotenv').config({path: '.env'});
const express = require("express");
const bodyParser = require('body-parser');
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload  } = require("@aws-sdk/lib-storage");
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs-extra');
const cors = require('cors');


//CURL
// curl --location 'http://localhost:4000/up' \
// --form 'uploaded_file=@"/C:/Users/postm/Downloads/contact.csv"'


const s3Client = new S3Client({
  endpoint: process.env.ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
  forcePathStyle: true,
});


const upload = multer({
  storage: multer.memoryStorage()
});


const uploadFileToMinIO = async (file) => {
  const uploadParams = {
    Bucket: process.env.BUCKET,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params: uploadParams
    });
    const data = await upload.done();
    console.log('file uploaded to minIo:', data);
    return data;
  } catch (err) {
    console.error('Error uploading file to MinIO:', err);
    throw err;
  }
};

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cors());
app.post('/up', upload.single('uploaded_file'), async (req, res) => {


  try {
    const data = await uploadFileToMinIO(req.file);
    res.json({data});
  } catch (err) {
    res.status(500).send('Error uploading file to MinIO');
  }

  
});

const port = process.env.PORT || 4000
app.listen({port}, () => {
  console.log(`Server ready at http://localhost:${port}/`);
});


