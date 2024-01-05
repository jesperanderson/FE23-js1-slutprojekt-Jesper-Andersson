/*
 * JESPER ANDERSSON, JANUARY 2024 
 * 
 * THE MOVIE DATABASE
 * Uses TMD API - https://themoviedb.org
 * 
 * Fetches movies and actors matching a users search.
 * Movies are desplayed in order based on popularity or rating.
 * Hidden sidebar with genre categories.
 * 
 * --- JQUERY is used for Sidebar (categories) AND search and radioBtn functions. ---
 * --- EXTRA FUNCTION = MOUSEOVER SIDEBAR WITH CATEGORIES ---
 * 
 * Info displayed for each movie
 * - Poster img
 * - Movie name
 * - Date of release
 * - Hovering overview
 * 
 * Info displayed for each actor
 * - Picture img
 * - Actor name
 * - Known for
 */ 

const API_KEY = "511c6c0f11c83e225e33b3aea9c617fa";
const url = "https://api.themoviedb.org/3/discover/movie?api_key=511c6c0f11c83e225e33b3aea9c617fa";
const BaseUrl = "https://api.themoviedb.org/3";
const ApiUrl = BaseUrl + "/discover/movie?api_key=" + API_KEY;
const imgUrl = "https://image.tmdb.org/t/p/w300/";

// const genreUrl = BaseUrl + 'https://api.themoviedb.org/3/genre/movie/list?api_key=' +API_KEY

const main = document.getElementById("movie-section");
const form = document.getElementById("form");
const search = document.getElementById("search");

///////////// HEADER SLIDESHOW ///////////// 
function startSlideshow() {
  let currentSlide = 0;
  const slides = $('#slideshow img');

  function showSlide(index) {
    slides.hide();
    slides.eq(index).fadeIn();
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  setInterval(nextSlide, 30000);
}

// startar om när sidan laddas om
startSlideshow();

///////////// LÄNKAR - NAVBAREN ///////////// 
  getMovies(ApiUrl + "&sort_by=release_date.desc&vote_count.gte=100&page=1");
  const popularLink = document.getElementById("popular-link");
  const topRatedLink = document.getElementById("top-rated-link");
  const homeLink = document.querySelector(".navbar-links li:first-child a");
  popularLink.addEventListener("click", function (event) {
    event.preventDefault();
    getMovies(ApiUrl + "&sort_by=popularity.desc&page=1");
  });

  topRatedLink.addEventListener("click", function (event) {
    event.preventDefault();
    getMovies(ApiUrl + "&sort_by=vote_count.desc&page=1");
  });

  homeLink.addEventListener("click", function (event) {
    event.preventDefault();
    getMovies(ApiUrl + "&sort_by=release_date.desc&vote_count.gte=100&page=1");
  });

///////////// MAIN CONTENT - HOMEPAGE - DISPLAY TOP 10 MOVIES ///////////// 
function getMovies(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];

        if (firstResult.title) {
          showMovies(data.results.slice(0, 10));
        }
      } else {
        console.log("No valid data found.");
      }
    });
}

function showMovies(data) {
  const main = document.getElementById("movie-container");
  main.innerHTML = "";

  data.forEach((movie) => {
    const { title, poster_path, release_date, overview } = movie;
    const movieEl = createMovieElement(
      title,
      poster_path,
      release_date,
      overview
    );
    main.appendChild(movieEl);
  });
}

function createMovieElement(title, poster_path, release_date, overview) {
  const imgUrl = 'https://image.tmdb.org/t/p/w300/';
  const defaultImage = 'https://image.tmdb.org/t/p/w300/';

  const movieEl = document.createElement('div');
  movieEl.classList.add('movie-section');
  movieEl.innerHTML = `
    <img class="movieImage" src="${poster_path ? imgUrl + poster_path : defaultImage}" alt="${title}"/>
    <h2 class="h2Name">${title}</h2>
    <p class="pDate">${release_date}</p>
    <p class="pAbout">${overview}</p>`;

  return movieEl;
}

///////////// JQUERY FUNKTION FÖR SÖK /////////////
function performSearch() {
  $('#movie-container').empty();
  let query = $("#query").val();
  let searchType = $('input[name="searchType"]:checked').val();

  let apiUrl;
  if (searchType === "movie") {
    apiUrl = "https://api.themoviedb.org/3/search/movie";
  } else if (searchType === "actor") {
    apiUrl = "https://api.themoviedb.org/3/search/person";
  }

  console.log("Performing search with query:", query);
  console.log("API URL:", apiUrl);

  $.getJSON(apiUrl, {
    api_key: "511c6c0f11c83e225e33b3aea9c617fa",
    query: query,
  })
    .done(function (data) {
      console.log("API Response:", data);

      if (data && data.results && data.results.length > 0) {
        $('#movie-container').empty();
        $('.error-message').remove();

        // Loop och append 
        data.results.forEach(function (result) {
          let name = result.title || result.name;
          let posterPath = result.poster_path || result.profile_path;
          let releaseDate = result.release_date || result.known_for_department;
          let overview = result.overview || result.known_for.map((item) => item.title || item.name).join(", ");
          let knownFor = result.known_for
            ? result.known_for.map((item) => item.title || item.name).join(", ")
            : "N/A";

          // Skapa Elementet för alla filmer och skådespelare
          const movieElement = createMovieElement(
            name,
            posterPath,
            releaseDate || result.known_for_department,
            overview || knownFor,
          );

          // Append movie element
          $("#movie-container").append(movieElement);
        });
      } else {
        // Error message
        $('.ERROR').html('<p class="error-message">No results found for the selected category.</p>');
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('API request failed:', textStatus, errorThrown);
    });
}

// Sök via "ENTER" -- Källa Google JQUERY
$("#query").on("keyup", function (event) {
  if (event.key === "Enter") {
    performSearch();
  }
});

// Sök via "KLICK" på knappen 
$("#searchBtn").click(function () {
  performSearch();
});

///////////// SÖK FUNKTION KATEGORIER - JQUERY ///////////// 
function performCategorySearch(category) {
  $.getJSON('https://api.themoviedb.org/3/discover/movie', {
    api_key: '511c6c0f11c83e225e33b3aea9c617fa',
    with_genres: category
  })
    .done(function(data) {
      if (data && data.results && data.results.length > 0) {
        // Rensar tidigare sökningar
        $('#movie-container').empty();
        $('.error-message').remove();

        // Loop och apend
        data.results.forEach(function(result) {
          let name = result.title;
          let posterPath = result.poster_path;

          // Skapa movie element
          const movieElement = createMovieElement(name, posterPath, result.release_date, result.overview);

          // Append movie element 
          $('#movie-container').append(movieElement);
        });
      } else {
        console.error('No results or unexpected response format:', data);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('API request failed:', textStatus, errorThrown);
    });
}

///////////// SIDEBAR LÄNKAR - EXTRA FUNKTION ///////////// 
$('#tags a').click(function(e) {
  e.preventDefault();
  let categoryId = $(this).data('category-id');

  // Reset movie container innan ny sökning
  $('#movie-container').empty();
  $('.error-message').remove();

  // Genomför en sökning baserat på vald kategori
  performCategorySearch(categoryId);
});
performCategorySearch(28); 

///////////// MOUSEOVER FÖR SIDEBAR (DOLD - SYNLIG) ///////////// 
function isMouseOnLeft(event) {
  return event.clientX <= 120;
}
document.addEventListener("mousemove", function (event) {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");

  if (isMouseOnLeft(event)) {
    sidebar.style.width = "200px";
    content.style.marginLeft = "200px";
  } else {
    sidebar.style.width = "0";
    content.style.marginLeft = "0";
  }
});