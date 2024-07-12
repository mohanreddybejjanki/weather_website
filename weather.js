const codes = {
  countryUrl: "https://api.countrystatecity.in/v1/countries",
  countryKey: "ajFYZWtoQktBeWpxaW00Yjh6U1JkOW1Bbjd0Vk40SGh1Vk1FbFpGYw==",
  weatherUrl: "https://api.openweathermap.org/data/2.5/",
  weatherKey: "daf2744b1fa1ae149486dcaf306fcaeb",
};

function ofcurrent(){
  const weatherDiv = document.querySelector("#weathershow");
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}else{
    alert("Your browser not support geolocation api");
}
}
//to get counties
const getdata = async (place, ...args) => {
  let apiEndPoint;
  switch (place) {
    case "countries":
      apiEndPoint =  codes.countryUrl;
      break;
    case "states":
      apiEndPoint = `${ codes.countryUrl}/${args[0]}/states`;
      break;
    case "cities":
      apiEndPoint = `${ codes.countryUrl}/${args[0]}/states/${args[1]}/cities`;
    default:
  }

  const response = await fetch(apiEndPoint, {
    headers: { "X-CSCAPI-KEY":  codes.countryKey },
  });
  if (response.status != 200) {
    throw new Error(`Something went wrong, status code: ${response.status}`);
  }
  const countries = await response.json();
  return countries;
};
//   inputField.addEventListener("keyup", e =>{
//     if(e.key == "Enter" && inputField.value != ""){
//         requestApi(inputField.value);
//     }
// });


// locationBtn.addEventListener("onclick", () =>{
//   if(navigator.geolocation){
//       navigator.geolocation.getCurrentPosition(onSuccess, onError);
//   }else{
//       alert("Your browser not support geolocation api");
//   }
// });
function onSuccess(position){
  const {latitude, longitude} = position.coords;
  apiEndPoint = `${codes.weatherUrl}weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${codes.weatherKey}`;
  getWeather(apiEndPoint);

}
function getWeatherof(cityName,ccode){
const apiEndPoint = `${codes.weatherUrl}weather?q=${cityName},${ccode.toLowerCase()}&units=metric&APPID=${codes.weatherKey}`;
getWeather(apiEndPoint);
}
function onError(error){
  weatherDiv.innerText = error.message;
 weatherDiv.classList.add("error");
}
// get weather info

const getWeather = async (apiEndPoint) => {
// const apiEndPoint = `${
//   codes.weatherUrl
// }weather?q=${cityName},${ccode.toLowerCase()}&units=metric&APPID=${codes.weatherKey}`;

try {
  const response = await fetch(apiEndPoint);
  if (response.status != 200) {
    if (response.status == 404) {
      weatherDiv.innerHTML = `<div class="alert-danger">
                            <h3>Oops! No data available.</h3>
                            </div>`;
    } else {
      throw new Error(
        `Something went wrong, status code: ${response.status}`
      );
    }
  }
  const weather = await response.json();
  console.log(weather);
  displayWeather(weather);
  //return weather;
}
catch (error) {
  console.log(error);
}
};
const getDateTime = (unixTimeStamp) => {
const milliSeconds = unixTimeStamp * 1000;
const dateObject = new Date(milliSeconds);
const options = {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
};
const humanDateFormate = dateObject.toLocaleDateString("en-US", options);
return humanDateFormate;
};

const displayWeather = (data) => {
const weathershow2=`<div class="card">
    <div class="card-body">
        <h4 class="card-title"> ${data.name},${data.sys.country}</h4>
    <p>${getDateTime(data.dt)}</p>
    <h2 id="t1">${data.main.temp}°C</h2>
    ${data.weather.map(w => `<div id="img-container">${w.main} <img src="https://openweathermap.org/img/wn/${w.icon}.png" /><p>${w.description}</p>`).join("\n")}
      <div class="class-text">Humidty :${data.main.humidity} %<br>Wind-Speed :${data.wind.speed}km/hr</div>
       </div>
      </div>
</div>`;
document.body.style.backgroundImage="url(https://source.unsplash.com/1600x900/?"+data.name+")";
weatherDiv.innerHTML =weathershow2;

};
const getLoader = () => {
return `<div class="spinner-grow text-info" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`;
};
const locationBtn = document.querySelector("#currlocation");
const countriesList = document.querySelector("#countrylist");
const statesList = document.querySelector("#statelist");  
const citiesList = document.querySelector("#citylist");
const weatherDiv = document.querySelector("#weathershow");

// on content load
document.addEventListener("DOMContentLoaded", async () => {
  const countries = await getdata("countries");
  console.log(countries);
  let countriesOptions = "";
  if (countries) {
    countriesOptions += `<option value="">Country</option>`;
    countries.forEach((coutry) => {
      countriesOptions += `<option value="${coutry.iso2}">${coutry.name}</option>`;
    });

    countriesList.innerHTML = countriesOptions;
  }
});

  // list states
  countriesList.addEventListener("change", async function () {
    const CountryCode = this.value;
    const states = await getdata("states",CountryCode);
    //console.log(states);
    let statesOptions = "";
    if (states) {
      statesOptions += `<option value="">State</option>`;
      states.forEach((state) => {
        statesOptions += `<option value="${state.iso2}">${state.name}</option>`;
      });
      statesList.innerHTML = statesOptions;
      statesList.disabled = false;
      citiesList.innerHTML = "";
    }
  });
  // list cities
  statesList.addEventListener("change", async function () {
    const CountryCode = countriesList.value;
    const StateCode = this.value;
    const cities = await getdata(
      "cities",
      CountryCode,
      StateCode
    );
    //  console.log(cities);
    let citiesOptions = "";
    if (cities) {
      citiesOptions += `<option value="">City</option>`;
      cities.forEach((city) => {
        citiesOptions += `<option value="${city.name}">${city.name}</option>`;
      });
      citiesList.innerHTML = citiesOptions;
      citiesList.disabled = false;
    }
  });
  
  // select city
  citiesList.addEventListener("change", async function () {
    const CountryCode = countriesList.value;
    const selectedCity = this.value;
   weatherDiv.innerHTML = getLoader();
   getWeatherof(selectedCity,CountryCode);
  // const weatherInfo = await getWeatherof(selectedCity,CountryCode);
  //  displayWeather(weatherInfo);
  });

