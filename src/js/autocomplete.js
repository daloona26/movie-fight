import { debounce } from "./utlis";
import { fetchData, onMovieSelect } from ".";

export const creatAutoComplete = function({ root, renderOption, onOptionSelect }){
  root.innerHTML = `
    <label><b>Search For a Movie </b> </label>
    <input class="input" /> 
    <div class="dropdown">
        <div class="dropdown-menu">
            <div class="dropdown-content results">
            </div>
        </div>
    </div>
`;
  const input = root.querySelector("input");
  const dropdown = root.querySelector(".dropdown");
  const resultsWrapper = root.querySelector(".results");

  // let timeoutId;
  const onInput = async (e) => {
    const movies = await fetchData(e.target.value);

    if (!movies.length) {
      dropdown.classList.remove("is-active");
      return;
    }

    resultsWrapper.innerHTML = "";
    dropdown.classList.add("is-active");

    for (let movie of movies) {
      const option = document.createElement("a");
      option.classList.add("dropdown-item");
      option.innerHTML = renderOption(movie);

      option.addEventListener("click", () => {
        dropdown.classList.remove("is-active");
        input.value = movie.Title;
      
        onOptionSelect(movie);
      });

      resultsWrapper.appendChild(option);
    }
  };

  input.addEventListener("input", debounce(onInput));

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) {
      dropdown.classList.remove("is-active");
    }
  });
};


