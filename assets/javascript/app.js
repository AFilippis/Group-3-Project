const analyzeButton = document.querySelector("#analyze-btn");
const analyzeText = document.querySelector("#analyzeInputText");
const textResult = document.querySelector("#analyzeInputTextResult");
const emotionButtonArray = Array.from(document.querySelectorAll(".filter-selector-btn"));
const randomGeneratedFile = "mued-upload-" + parseInt(Date.now() * Math.random()) +".mp3";
const bucketUrl = "https://meud-audio.s3.amazonaws.com/" + randomGeneratedFile;
const uploadButton = document.querySelector("#audio-upload-btn");
const audioFileInput = document.querySelector("#audio-file-input");
const loader = document.getElementById("loader");




var awsSend = {
  "async": true,
  "crossDomain": true,
  "url": "https://cors-anywhere.herokuapp.com/https://meud-audio.s3.amazonaws.com/",
  "method": "POST",
  "headers": {
    "enctype": "multipart/form-data",
    "cache-control": "no-cache",
    "postman-token": "5e763941-048a-b0da-cfe3-9c026d0350e0"
  },
  "processData": false,
  "contentType": false,
  "mimeType": "multipart/form-data",
  "beforeSend" : function() {
    loader.classList.remove("d-none");
  },
  "success" : function() {
    loader.classList.add("d-none");
  }
}




const textAnalysisSettings = {
  "async": true,
  "crossDomain": true,
  "url": "https://gateway-wdc.watsonplatform.net/tone-analyzer/api/v3/tone?version=2017-09-21",
  "method": "POST",
  "headers": {
    "content-type": "application/json",
    "authorization": "Basic YXBpa2V5OlpMaWN1Sk41Ujg0R0pJcWhrUnpGZEd0emlhRWw5eUJ0SEZMWE04ZVc4dWhj",
    "cache-control": "no-cache",
    "postman-token": "47c4bebe-6bad-541a-ee5f-fe396c649413"
  },
  "beforeSend" : function() {
    loader.classList.remove("d-none");
  },
  "success" : function() {
    loader.classList.add("d-none");
  }
}
const audioPost = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.assemblyai.com/transcript",
  "method": "POST",
  "headers": {
    "authorization": "5fda6a4e547e45ca8bd01dbc71afec04",
    "cache-control": "no-cache",
    "postman-token": "2b11a974-5004-3882-4d14-21c0d92ca94a"
  },
  "beforeSend" : function() {
    loader.classList.remove("d-none");
  },
  "success" : function() {
    loader.classList.add("d-none");
  }
}
const audioGetText = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.assemblyai.com/transcript/${id}",
  "method": "GET",
  "headers": {
    "authorization": "5fda6a4e547e45ca8bd01dbc71afec04",
    "cache-control": "no-cache",
    "postman-token": "df1d1e7e-b8d9-d746-682e-c3bc38b7ad5f"
  }
}


//set unique document name


//postTextToSpeech();
//add flag to check if file has been uploaded before trying
//also check to make sure file is uploaded before sending to the assemblyai
//put text into text area so that user can modify the text


document.addEventListener("click", (event) => {
  if(event.target === analyzeButton)
  {
    event.preventDefault();
    //TODO THIS SHOULDNT GO THROUGH AUDIO - TEXT
    analyzeApi(analyzeText.value);
  }
  if(emotionButtonArray.includes(event.target))
  {
    event.preventDefault();
    changeEmotionHighlight(event.target.id.replace("filter-", ""));
    changeEmotionBlurb(event.target.id.replace("filter-", ""));
  }
  if(event.target === uploadButton)
  {
    event.preventDefault();
    awsUpload();
  }

});

function awsUpload()
{
  var form = new FormData();
  form.append("key", randomGeneratedFile);
  form.append("file", audioFileInput.files[0]);
  awsSend.data = form;
  $.ajax(awsSend).done(function (response) {
    postTextToSpeech();
  });
}

function analyzeApi(text)
{
  //make text a json format to send
  //do API call 
  //call a functioin that shows data
  textAnalysisSettings.data = JSON.stringify({"text" : text});

  $.ajax(textAnalysisSettings).done(createFullTextHTML);

}

function postTextToSpeech()
{
  //Normally this will upload to aws
  //then check for when it is uploaded
  //then post text to speech to assembly ai
  audioPost.data = JSON.stringify({"audio_src_url" : bucketUrl}) 

  $.ajax(audioPost).done(response => {

    loader.classList.remove("d-none");
    let intervalId = setInterval(() => {
      checkForText(response.transcript.id, intervalId);
    }, 3000);
  });

}

function checkForText(textId, intervalId)
{
  audioGetText.url = audioGetText.url.replace("${id}", textId);

  $.ajax(audioGetText).done(function (response) {

    if(response.transcript.status === "completed")
    {
      //logic and clear
      clearInterval(intervalId);
      loader.classList.add("d-none")
      analyzeText.value = response.transcript.text
    }
    
  });
}

function createFullTextHTML(response)
{
  let toneArray = [];
  let sentenceHolder = document.createElement("div");
  sentenceHolder.id = "emotion-id";
  
  if(response.sentences_tone !== undefined)
  {
    response.sentences_tone.forEach((element) => 
    {
      let newSpan = document.createElement("p");
      newSpan.innerHTML = element.text + "\n";
  
      if(element.tones.length !== 0)
      {
        element.tones.forEach((innerElement) => 
        {
          newSpan.dataset[innerElement.tone_name.toLowerCase()] = innerElement.score;
          if(!toneArray.includes(innerElement.tone_name.toLowerCase()))
          {
            toneArray.push(innerElement.tone_name.toLowerCase());
          }
        });
      }
  
      newSpan.dataset.sentence_id = element.sentence_id;
      newSpan.classList = "emotion-p";
      sentenceHolder.appendChild(newSpan);
    });
  }
  else if(response.document_tone !== undefined)
  {
    //single sentence doesnt return sentence so regrab info from textarea
      let newSpan = document.createElement("p");
      newSpan.innerHTML = analyzeText.value + "\n";
  
      if(response.document_tone.tones.length !== 0)
      {
        response.document_tone.tones.forEach((innerElement) => 
        {
          newSpan.dataset[innerElement.tone_name.toLowerCase()] = innerElement.score;
          toneArray.push(innerElement.tone_name.toLowerCase());
        });
      }
  
      newSpan.classList = "emotion-p";
      sentenceHolder.appendChild(newSpan);
  }

  textResult.innerHTML = "";
  textResult.appendChild(sentenceHolder);

  hideButtons(toneArray);
}

function changeEmotionHighlight(emotion)
{
  let emotionDivs = document.querySelectorAll("[data-"+emotion+"]");
  let allEmotionDivs = document.querySelectorAll("#emotion-id p");

  allEmotionDivs.forEach((element) => 
  {
    element.classList = "emotion-p";
  });

  emotionDivs.forEach((element) => 
  {
    
    if(parseFloat(element.dataset[emotion]) < .5)
    {
      element.classList = "emotion-p highlight-" + emotion + "-low";
    }
    else if(parseFloat(element.dataset[emotion]) < .75)
    {
      element.classList = "emotion-p highlight-" + emotion + "-medium";
    }
    else
    {
      element.classList = "emotion-p highlight-" + emotion + "-high";
    }
  });

}

function changeEmotionBlurb(emotion)
{
  emotionBlurbs = document.querySelectorAll(".emotion-blurb");
  emotionBlurbs.forEach(element => {
    if(!element.classList.contains("d-none"))
    {
      element.classList.add("d-none")
    }
    if(element.classList.contains("emotion-"+emotion))
    {
      element.classList.remove("d-none");
    }
  });
}

function hideButtons(tones)
{
  emotionButtonArray.forEach(element => {
    if(!tones.includes(element.id.replace("filter-", "")))
    {
      if(!element.classList.contains("d-none"))
      {
        element.classList.add("d-none");
      }
    }
    else
    {
      element.classList.remove("d-none");
    }
  })
}