//Just some code for testing purpose
// let myHeading = document.querySelector("h1");
// myHeading.textContent = "Hey Hello! Whatsup"
// let myImage = document.getElementById("img1");
//
// myImage.onclick = function () {
//     let mySrc = myImage.getAttribute('src');
//     if (mySrc === 'images/scrimg.png') {
//         myImage.setAttribute('src', 'images/spriral.jpg');
//     } else {
//         myImage.setAttribute('src', 'images/scrimg.png');
//     }
// }

const oldYear = new Date(2015, 9, 19);
const currentYear = new Date();
if(currentYear.getMonth() < oldYear.getMonth() || 
   (currentYear.getMonth() === oldYear.getMonth() && currentYear.getDate() < oldYear.getDate())) {
    // If the current date is before the anniversary date in 2015, subtract one year
    yearValue = currentYear.getFullYear() - oldYear.getFullYear() - 4;
}
else{
yearValue = currentYear.getFullYear() - oldYear.getFullYear()-3;
}
document.getElementById("experience-years").textContent = yearValue;
