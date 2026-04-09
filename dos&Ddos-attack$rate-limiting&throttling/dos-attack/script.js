// setInterval(() => {
//   fetch("http://localhost:4000/register");
// }, 10);
const button = document.querySelector("button")
button.addEventListener("click",async ()=>{
  // button.disabled=true
  const response = await fetch("http://localhost:4000/register");
  // button.disabled=false
})