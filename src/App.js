import cities from "cities-list";
import { useState } from "react";
import FilterList from "./components/FilterList";

const citiesArray = Object.keys(cities);

const App = () => {
  const [filteredCities, setFilteredCities] = useState([]);

  return (
    <div className="container">
      <h1>Find your favourite cities</h1>

      <FilterList cities={citiesArray} filteredCities={filteredCities} setFilteredCities={setFilteredCities} />

   
    </div>
  );
};

export default App;
