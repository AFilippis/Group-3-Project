const analyzeButton = document.querySelector("#analyze-btn");
const analyzeText = document.querySelector("#analyzeInputText");
const textResult = document.querySelector("#analyzeInputTextResult");
const emotionButtonArray = Array.from(document.querySelectorAll(".filter-selector-btn"));

var textAnalysisSettings = {
  "async": true,
  "crossDomain": true,
  "url": "https://gateway-wdc.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21",
  "method": "POST",
  "headers": {
    "content-type": "application/json",
    "authorization": "Basic YXBpa2V5OlpMaWN1Sk41Ujg0R0pJcWhrUnpGZEd0emlhRWw5eUJ0SEZMWE04ZVc4dWhj",
    "cache-control": "no-cache",
    "postman-token": "47c4bebe-6bad-541a-ee5f-fe396c649413"
  }
}

// $.ajax(settings).done(function (response) {
//   console.log(response);
// });

document.addEventListener("click", (event) => {
  event.preventDefault();
  if(event.target === analyzeButton)
  {
    analyzeApi(analyzeText.value);
  }
  if(emotionButtonArray.includes(event.target))
  {
    changeEmotionHighlight(event.target.id.replace("filter-", ""));
  }
});

function analyzeApi(text)
{
  //make text a json format to send
  //do API call 
  //call a functioin that shows data
  textAnalysisSettings.data = JSON.stringify({"text" : text});

  $.ajax(textAnalysisSettings).done(analysisCallback);


}

function analysisCallback(response)
{
  createFullTextHTML(response);

}

function createFullTextHTML(response)
{
  let sentenceHolder = document.createElement("div");
  sentenceHolder.id = "emotion-id";
  response.sentences_tone.forEach((element) => 
  {
    let newSpan = document.createElement("p");
    newSpan.innerHTML = element.text;

    if(element.tones.length !== 0)
    {
      element.tones.forEach((innerElement) => 
      {
        newSpan.dataset[innerElement.tone_name.toLowerCase()] = innerElement.score;
      });
    }

    newSpan.dataset.sentence_id = element.sentence_id;
    newSpan.classList = "emotion-p";
    sentenceHolder.appendChild(newSpan);
  })

  textResult.appendChild(sentenceHolder);
}

function changeEmotionHighlight(emotion)
{
  let test = document.querySelectorAll("[data-"+emotion+"]");
  let testDiv = document.querySelectorAll("#emotion-id p");

  testDiv.forEach((element) => 
  {
    element.classList = "emotion-p";
  });

  test.forEach((element) => 
  {
    
    element.classList = "emotion-p highlight-" + emotion;
  });

}
// function createTextObjectArr(response)
// {
//   let textArr = [];
//   response.sentences_tone.forEach((element) => {
//     textArr.push(element);
//   })

//   console.log(textArr);
// }



//This post a json string to get the tones back
//  url : https://gateway-wdc.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21
// data : {"text" : "text to send"}
// Need to stirngify text to send correctly
// on return gives object with information needed

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://gateway-wdc.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21",
//   "method": "POST",
//   "headers": {
//     "content-type": "application/json",
//     "authorization": "Basic YXBpa2V5OlpMaWN1Sk41Ujg0R0pJcWhrUnpGZEd0emlhRWw5eUJ0SEZMWE04ZVc4dWhj",
//     "cache-control": "no-cache",
//     "postman-token": "47c4bebe-6bad-541a-ee5f-fe396c649413"
//   },
//   "data": JSON.stringify({
//     "text": "Team, I know that times are tough! Product sales have been disappointing for the past three quarters. We have a competitive product, but we need to do a better job of selling it!"
//   })
// }

// $.ajax(settings).done(function (response) {
//   console.log(response);
// });


//This post the audio file to the api
// url  : https://api.assemblyai.com/transcript
// data : {"audio_src_url" : "audio url"}
// need to JSON stringify data to send correctly
// on done returns object with id for get method

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://api.assemblyai.com/transcript",
//   "method": "POST",
//   "headers": {
//     "authorization": "5fda6a4e547e45ca8bd01dbc71afec04",
//     "cache-control": "no-cache",
//     "postman-token": "2b11a974-5004-3882-4d14-21c0d92ca94a"
//   },
//   "data" :  JSON.stringify("audio_src_url" : "https://s3-us-west-2.amazonaws.com/blog.assemblyai.com/audio/8-7-2018-post/7510.mp3");
// }

// $.ajax(settings).done(function (response) {
//   console.log(response);
// });

//Working get method for assemblyai
// url : https://api.assemblyai.com/transcript/${queryId}
// Gets by the id of the data returned with the post data
// Note it takes about half as long as the audio file to return successfully
// It will returned queued until it is successfullt transcribed 
// Set interval timer to test every 5 seconds?

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://api.assemblyai.com/transcript/${id}",
//   "method": "GET",
//   "headers": {
//     "authorization": "5fda6a4e547e45ca8bd01dbc71afec04",
//     "cache-control": "no-cache",
//     "postman-token": "df1d1e7e-b8d9-d746-682e-c3bc38b7ad5f"
//   }
// }

// $.ajax(settings).done(function (response) {
//   console.log(response);
// });