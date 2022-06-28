let APIKey = "6d8933a026862848585d2830afb5c692";
let locations = [];

// getting the location from the api
function getWeatherData(lat, lon, city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=,minutely,hourly,alerts&appid=" + APIKey;

    //  AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // Stores data in an object called "response"
        .then(function (response) {

            console.log(response);

            showWeatherData(response, city);

        });           
 };


 // calls the weather API based on zip code and call the fucntion showWeatherData to load the values
function loadWeatherZip(zipCpde, isClicked) {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?zip=" + zipCpde + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    // Here we run our AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // We store all of the retrieved data inside of an object called "response"
        .then(function (response) { 

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);  //save the city and zip to local storage
                renderLocations();
            }

            //load weather
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);
            
            // error message if user enters an invalid zipcode
        }).catch(function (response){
            alert("Please enter a vaild Zip Code")
        });
}

// lets user click previously searched city
function loadWeatherCity(city, isClicked) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");


    // AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // Stores data inside of an object called "response"
        .then(function (response) {

            console.log(response);

            if (!isClicked)
            {
                saveLocations(response);  //save the city and zip to local storage
                renderLocations();
            }

            //load weather
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function(response){
            alert("Not a valid City");
        });
}

function showWeatherData(weatherData, city)
{
    //load current weather
    var iconURL = "http://openweathermap.org/img/w/" + weatherData.current.weather[0].icon + ".png";  //get weather icon
    $("#cityDate").html(city + " (" + new Date().toLocaleDateString() + ") <img id=\"icon\" src=\"" + iconURL  + "\" alt=\"Weather icon\"/>");

    var temp = parseInt(weatherData.current.temp);
    temp = Math.round(((temp-273.15)*1.8) + 32);
    $("#currentTemp").html(" " + temp +  "  &degF");
    $("#currentHumidity").html(weatherData.current.humidity + "%");
    $("#currentWindSpeed").html(weatherData.current.wind_speed + " MPH");

    //current uv index and store in the uvIndex.current array 
    var uvIndex = weatherData.current.uvi;

    var bgColor = "";  //holds the background color for UV Index
    var textColor = "";  //holds the text color for UV Index

    // color codes the UV index
    if (uvIndex < 3) 
    {
        bgColor = "bg-success";
        textColor = "text-light";  
    }
    else if (uvIndex > 2 && uvIndex < 6)  
    {
        bgColor = "bg-warning";
        textColor = "text-dark";             
    }
    else
    {
        bgColor = "bg-danger";
        textColor = "text-light";            
    }

    //set the UVIndex and color to the html
    $("#currentUVIndex").html(uvIndex).addClass(bgColor + " p-1 " +  textColor);


    //load 5 Day 
    var ul5 = $("#fiveDay");
    ul5.empty();

    // five day forcast
    for (i=1; i < 6; i++)
    {
        //make the elements to display the 5 day forecast and append to the parent div
        var div = $("<div>").addClass("bg-primary");

        var dateTime = parseInt(weatherData.daily[i].dt); 
        var dateHeading = $("<h6>").text(new Date(dateTime * 1000).toLocaleDateString());  //converts time to javascript date
        var iconDayURL = "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0].icon + ".png";  //    gets the weather icons
        var icon = $("<img>").attr("src", iconDayURL);

        //convert kelvin to Fahrenheit
        temp = parseInt(weatherData.daily[i].temp.day);
        temp = Math.round(((temp-273.15)*1.8) + 32); 
        var temp5 = $("<p>").html("Temp: " + temp +  "  &degF");

        var humidity5 = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + "%");

        div.append(dateHeading);
        div.append(icon);
        div.append(temp5);
        div.append(humidity5);
        ul5.append(div);

    }

    $("#weatherData").show();
}

//load locations from local storage to the locations array
function loadLocations()
{
    var locationsArray = localStorage.getItem("locations");
    if (locationsArray) 
    {
      locations = JSON.parse(locationsArray);  //make sure there is a locations object in local storage
      renderLocations();
    }
    else {
      localStorage.setItem("locations", JSON.stringify(locations));  //if not make one and store it to local storage
    }
}

function renderLocations()
{
    var divLocations = $("#locationHistory");
    divLocations.empty();  //clears the city list before rendering it from the local storage object

    $.each(locations, function(index, item){
        var a = $("<a>").addClass("list-group-item list-group-item-action city").attr("data-city", locations[index]).text(locations[index]);
        divLocations.append(a);
    });

    $("#locationHistory > a").off();

    $("#locationHistory > a").click(function (event)
    {   
        var element = event.target;
        var city = $(element).attr("data-city");

        loadWeatherCity(city, true);
    });

}

//save locations to the locations array and local storage
function saveLocations(data)
{
    // gets city name
    var city = data.city.name;

    locations.unshift(city);
    localStorage.setItem("locations", JSON.stringify(locations));  //convert to a string then sends it to local storage

}

$(document).ready(function () {

    $("#weatherData").hide();

    loadLocations();  //get the locations from local storage then loads them into the locations array

    $("#searchBtn").click(function (event) {
        var element = event.target; //set element to the div that was clicked
        var searchCriteria = $("#zipCode").val();  //get the user input
        
        if (searchCriteria !== "")  //checks to make sure it's not empty
        {
            var zip = parseInt(searchCriteria); //is it a zip code or city name

            if (!isNaN(zip)) //yes it is a zip code
            {
                loadWeatherZip(zip, false);
            }
            else
            {
                loadWeatherCity(searchCriteria, false);  //no, it is a city name
            }
        }
    });
});