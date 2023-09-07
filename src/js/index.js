import { API_KEY } from "./config";
import { debounce } from "./utlis";
import { creatAutoComplete } from "./autocomplete.js";
export const fetchData = async (searchTerm) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: `${API_KEY}`,
      s: searchTerm,
    },
  });

  if (response.data.Error) {
    return [];
  }

  return response.data.Search;
};

const autoCompleteConfig = {
  renderOption: (movie) => {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src="${movie.Poster}" />
    <h1>${movie.Title} (${movie.Year})</h1>
   `;
  },
};

creatAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-autocomplete"), "left");
  },
});

creatAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(
      movie,
      document.querySelector("#right-autocomplete"),
      "right"
    );
  },
});

let leftMovies;
let rightMovies;

export const onMovieSelect = async (movie, summaryTarget, side) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: `${API_KEY}`,
      i: movie.imdbID,
    },
  });
  summaryTarget.innerHTML = movieTemplate(response.data);

  if (side === "left") {
    leftMovies = response.data;
  } else {
    rightMovies = response.data;
  }

  if (leftMovies && rightMovies) {
    runComparison();
  }
};

const runComparison =  () => {
  const leftSideStats =  document.querySelectorAll(
    '#left-autocomplete .notification'
  );
  const rightSideStats =  document.querySelectorAll(
    '#right-autocomplete .notification'
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = leftStat.dataset.value;
    const rightSideValue = rightStat.dataset.value;

    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    } else {
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    }
  });
};


const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );

  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));

  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return (prev += value);
    }
  }, 0);
  console.log(awards);
  return `
    <article class"media">
        <figure class="media-left">
          <p class="image">
            <img src="${movieDetail.Poster}" />
          </p>
        </figure>
        <div class="media-content"> 
            <div class="content">
                <h1>${movieDetail.Title}</h1>
                <h4>${movieDetail.Genre}</h4>
                <p>
                ${movieDetail.Plot}
                </p>
            </div>
        </div>
    </article>

    <article data-value=${awards} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
        <p class="title">${movieDetail.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="Metascore">IMDB </p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
        </article>
    <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes  </p>
    </article>
    `;
};
