///////////////////////////////////////////////////////////////
// グローバル変数
///////////////////////////////////////////////////////////////
var video  = document.querySelector("#camera");
var canvas = document.querySelector("#picture");
var se     = document.querySelector('#se');
var ctx
var faceapi = document.querySelector('#faceapi');
var map = document.querySelector('#map');

// FaceAPIが応答する年齢！
var age = 0

// ▲Canvasの非表示！
video.style="display:diaplay";
canvas.style="display:none";
faceapi.style="display:none";
map.style="display:none";


///////////////////////////////////////////////////////////////
// カメラ設定
///////////////////////////////////////////////////////////////
var constraints = {
  audio: false,
  video: {
    width: 300,
    height: 200,
    facingMode: "user"   // フロントカメラを利用する
    // facingMode: { exact: "environment" }  // リアカメラを利用する場合
  }
};


///////////////////////////////////////////////////////////////
// カメラを<video>と同期
///////////////////////////////////////////////////////////////
navigator.mediaDevices.getUserMedia(constraints)
.then( (stream) => {
  video.srcObject = stream;
  video.onloadedmetadata = (e) => {
    video.play();
  };
})
.catch( (err) => {
  console.log(err.name + ": " + err.message);
});


///////////////////////////////////////////////////////////////
// シャッターボタン
///////////////////////////////////////////////////////////////
document.querySelector("#shutter").addEventListener("click", () => {
  ctx = canvas.getContext("2d");

  // 演出的な目的で一度映像を止めてSEを再生する
  video.pause();  // 映像を停止
  se.play();      // シャッター音
  setTimeout( () => {
    video.play();    // 0.5秒後にカメラ再開
  }, 500);

  // canvasに画像を貼り付ける
  canvas.style="display:display";
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // ▲Videoの非表示！/ faceapiの表示！
  video.style="display:none";
  canvas.style="display:display";
  faceapi.style="display:display";
  map.style="display:none";

  // ログをクリア
  $("#log").html("");
  $("#info").html("");
  // $("#info2").html("");
  // $("#info3").html("");
});

///////////////////////////////////////////////////////////////
// リセットボタン
///////////////////////////////////////////////////////////////
document.querySelector("#reset").addEventListener("click", () => {
  // location.reload();

  // Videoのみ表示！
  canvas.style="display:none";
  video.style="display:display";
  faceapi.style="display:none";
  map.style="display:none";
})



///////////////////////////////////////////////////////////////
// ★FaceAPIボタン
///////////////////////////////////////////////////////////////
$('#faceapi').click(function() {
  var colors = [ "#F66" , "#6F6" , "#FF6" , "#66F" , "#F6F" , "#6FF"];

  // CANVASから、ファイルをBase64化！
  var base64 = canvas.toDataURL('image/png');
  var bin = atob(base64.replace(/^.*,/,''));
  var buffer = new Uint8Array(bin.length);
  for (var i=0;i<bin.length;i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  var bytesArray = buffer;


  ///////////////////////////////////////////////////
  // ログをクリア
  $("#log").html("");
  $("#info").html("");
  // $("#info2").html("");
  // $("#info3").html("");

  // 状況ステータス
  $("#info").html("... データ送信中 ...");


  //////////////////////////////////////////////////////
  // Face APIコール
  console.log("Ajaxコール開始！")

  $.ajax( {
    url: "/facenow",
    type: 'POST',
    contentType: 'application/octet-stream',
    data: bytesArray,
    // data: {
    //   "bytesArray": "123",
    //   "message": "xxxxxx",
    // },
    dataType: "json",
    // dataType: "text",
    processData: false,


    //////////////////////////////////////////////////////
    // FaceAPI応答成功した場合
    success: function(data) {

      // ログ表示
      addLog("response",data);

      // 表示調整系
      // $("#information").html("");
      var attr = ""
      var info = ""
      // var info2 = ""
      // var info3 = ""

      // 顔データを１つずつ取り出してる（でも、１人のはずーー）
      for (var i=0;i<data.length;i++) {
        // 取得データ
        var json = data[i];
        console.log(json)

        // 顔枠の結果だよ
        var rect = json.faceRectangle;
        if (rect != null) {
          ctx.strokeStyle = colors[i%6];
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(rect.left,rect.top);
          ctx.lineTo(rect.left+rect.width,rect.top);
          ctx.lineTo(rect.left+rect.width,rect.top+rect.height);
          ctx.lineTo(rect.left,rect.top+rect.height);
          ctx.lineTo(rect.left,rect.top);
          ctx.closePath();
          ctx.stroke();
        }

        // 顔認識の結果だよ！
        attr = json.faceAttributes;
        console.log(attr)

        info += '<span style="color:' + colors[i%6] + '">&#9632;&#9632;&#9632;</span><br>'
        + 'smile:' + attr.smile + "<br>"
        + ' gender:' + attr.gender + "<br>"
        + ' age:' + attr.age + '<br><br>';

        // info2 +=
        // 'glasses:' + JSON.stringify(attr.glasses, null, 2) + "<br>"
        // // + ' makeup:' + JSON.stringify(attr.makeup, null, 2) + "<br>"
        // + ' emotion:' + JSON.stringify(attr.emotion, null, 2) + '<br><br>';
        //
        // info3 =
        // 'mask:' + JSON.stringify(attr.mask, null, 2) + "<br>"
      }

      // 顔情報を表示
      $("#info").html(info);
      // $("#info2").html(info2);
      // $("#info3").html(info3);




      // 年齢をグローバル変数に格納
      console.log(typeof attr.age)
      if  (attr.age === undefined)  {
        alert("FaceAPIで年齢認識できてませんでした、リセットボタンを押して、写真を取り直してください！")
        console.log("ageが認識できてません！”")

        // ▲Videoの非表示！/ faceapiの表示！
        video.style="display:none";
        canvas.style="display:display";
        faceapi.style="display:none";
        map.style="display:none";

      } else if (attr.age != 0) {
        console.log("age: " + attr.age)

        // ▲Videoの非表示！/ faceapiの表示！
        video.style="display:none";
        canvas.style="display:display";
        faceapi.style="display:none";
        map.style="display:display";

        // マップボタン
        var url = "map.html?age=" + attr.age
        // var url = "map.html?age=" + 35
        console.log("url: " + url)

        document.querySelector("#map").addEventListener("click", () => {
          console.log(url)
          window.location.href = url
        })


      } else {
        alert("FaceAPIで年齢認識できてませんでした、リセットボタンを押して、写真を取り直してください！")
        console.log("ageが認識できてません！”")

        // ▲Videoの非表示！/ faceapiの表示！
        video.style="display:none";
        canvas.style="display:display";
        faceapi.style="display:none";
        map.style="display:none";
      }

    },
    // FaceAPI接続NGの場合
    error: function(xhr, status, error) {
      console.log(error)
      alert(status);
      alert(error);
    }
  });
})



///////////////////////////////////////////////////
// ログ表示
///////////////////////////////////////////////////
function addLog(title,data) {
  $("#log").html( $("#log").html() + "<pre>" + title + "\n" + JSON.stringify( data , null , "  ") + "</pre>" );
}
