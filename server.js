'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const axios = require('axios');
const qs = require('querystring');
const fs = require('fs');

require('dotenv').config();

/////////////////////////////////////////////
// Expressなう
const server = express();
const host = '0.0.0.0';
const port = process.env.PORT || 3000;

server.use(express.urlencoded({ extended: true, limit: '500mb' }))
server.use(express.static(path.join(__dirname, 'public')));

///////////////////////////////////////////////
// Face APIのキーを指定
const subscriptionKey = process.env.FACE_APIKEY

// URLだよ！
const BASE_URL = process.env.BASE_URL
const params = qs.stringify({
  'returnFaceId': 'true',
  'returnFaceLandmarks': 'false',
  // 'returnFaceLandmarks': 'true',
  'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
});
const PATH = `/face/v1.0/detect?${params}`;


///////////////////////////////////////////////
// GET: フロントからのリクエストだよ！
server.get('/facenow', (req, res) => {
  console.log("getだよ")
  res.send("GETできたねー");
})


///////////////////////////////////////////////
// POST: フロントからのリクエストだよ！
server.post('/facenow', (req, res) => {
  console.log("postだよ")
  // console.log("nowko" + JSON.stringify(req.body, null, 4))

  /////////////////////////////////////////////////////
  // 画像受信なう
  let buffers = [];
  let cnt = 0;
  const filePath = "./face.jpg";

  req.on('data', (chunk) => {
    buffers.push(chunk);
    console.log(++cnt);
  });

  req.on('end', () => {
    console.log(`[done] Image upload`);
    req.rawBody = Buffer.concat(buffers);

    ////////////////////////////////////
    // ★FaceAPIコールだよ！！！！！！
    const config = {
      baseURL: BASE_URL,
      url: PATH,
      method: 'post',
      headers: {
        'Content-Type': `application/octet-stream`, // URL指定の時は'application/json'
        'Ocp-Apim-Subscription-Key' : subscriptionKey
      },
      data: req.rawBody
    }
    ////////////////////////////////////
    axios.request(config)
      .then((response) => {
        console.log(response.status);
        console.log(response.data)
        console.log("Axiosコールなう")

        // フロントにレスポンス
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.send(response.data);

        // face情報セーブ
        // fs.writeFileSync('data/face.json', JSON.stringify(response.data));
      })

      // エラー応答
      .catch((error) => {
        console.log(error);

        // res.status(response.status);
        // res.send(error);
        res.send("エラーがでたよ！");
      })
    ////////////////////////////////////
  })
})


///////////////////////////////////////////////
// サーバ起動
// server.listen(port, () => {
//   console.log(`Listening on port ${port}`);
// });
server.listen(port, host, function() {
  console.log("Server started.......");
});
///////////////////////////////////////////////
