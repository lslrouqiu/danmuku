
import danmuku from './app/index';

let app = document.querySelector("#app");
let danmu = danmuku('#app');
function send(){
  setTimeout(() => {
    for(let i = 0;i <5;i++){
      danmu.emit({
        content:'打发打发十分打发打发十分打发打发十分'+i,
        html:'打发打发十分打发打发十分打发打发十分'+i
      });
    }
    send();
  }, 1000);
}
send();
let stop = document.querySelector("#stop");
stop.addEventListener('click',()=>{
  danmu.stop();
})
let run = document.querySelector("#run");
run.addEventListener('click',()=>{
  danmu.run();
})
let type = document.getElementById("type");
type.addEventListener("change", () =>{
  app.innerHTML = "";
  danmu = danmuku('#app',parseInt(type.value));
});

