import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form=document.querySelector('form');
const chatContainer=document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent='';
  loadInterval=setInterval(() => {
    element.textContent+='.';
    if (element.textContent==='....'){
      element.textContent='';
    }
  }, 300) //every 300ms the AI outputs . and it resets to empty after it becomes ...
}

function typeText(element, text){
  let index=0;
  let interval=setInterval(() => {
    if (index<text.length){
      element.innerHTML+=text.charAt(index); //this gets the index of the character the AI should return
      index++;
    }
    else{
      clearInterval(interval);
    }
  }, 20)
}//every 20ms the AI will type the answer

function generateUniqueId(){
  const timestamp=Date.now();
  const randomNumber=Math.random();
  const hexadecimalString=randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAI, value, uniqueId){
  return(
    `
      <div class="wrapper ${isAI && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAI ? bot:user}"
              alt="${isAI ? 'bot':'user'}"
            />
          </div>
          <div 
            class="message"
            id="${uniqueId}"
          >
            ${value}
          </div>
        </div>
      </div>
    `
  )
}

const handleSubmit=async(e) => {
  e.preventDefault();//prevent loading browser (default behavior)
  const data=new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML+=chatStripe(false, data.get('prompt'));//color for when user types
  form.reset();//clears text area input

  //bot's chatstripe
  const uniqueId=generateUniqueId();
  chatContainer.innerHTML+=chatStripe(true, " ", uniqueId);//color for when AI types

  chatContainer.scrollTop=chatContainer.scrollHeight;
  const messageDiv=document.getElementById(uniqueId);
  loader(messageDiv);

  //fetch data from server (get bot response)
  const response=await fetch('https://j-a-r-v-i-s-2-0.onrender.com', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML='';

  if (response.ok){
    const data=await response.json();
    const parsedData=data.bot.trim();
    typeText(messageDiv, parsedData);
  }
  else{
    const err=await response.text();
    messageDiv.innerHTML='Something went wrong';
    console.log(response.status);
    alert(err);
  }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode===13){
    handleSubmit(e);
  }
})
