import React, { useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import { DebounceInput } from "react-debounce-input";
// import throttle from "lodash.throttle";
function FilterList({ cities, filteredCities, setFilteredCities }) {
  // .filter method is still being called for each of the keystrokes. We want to cancel the previous setTimeout method whenever we hit a new key, so that if we have n keystrokes, we’ll end up calling the filter function for just the last key. Let’s use the cleartimeout method to implement this:

  console.log({ filteredCities });

  let filterTimeout;

  const doCityFilter = (event) => {
    console.log(event);
    clearTimeout(filterTimeout);
    if (!event) return setFilteredCities([]);

    // Using setTimeout to debounce
    filterTimeout = setTimeout(() => {
      console.log({ event });
      setFilteredCities(
        cities.filter((city) =>
          city.toLowerCase().includes(event.toString().toLowerCase())
        )
      );
    }, 500);
  };

  // debounce the ChangeHandler
  //   const debouncedHandler = useCallback(
  //     debounce(changeHandler, 300)
  //   , []);

  // debounce the ChangeHandler using useMemo for optimal performance. It memoizes the debounced handler, but also calls debounce() only during initial rendering of the component.
  const debouncedHandler = useMemo(
    () => debounce(doCityFilter, 300),
    // eslint-disable-next-line
    []
  );

  // Stop the invocation of the debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedHandler.cancel();
    };
    // eslint-disable-next-line
  }, []);

  //   const throttledChangeHandler = useMemo(
  //     () => throttle(changeHandler, 300),
  //     []
  //   );

  return (
    <form>
      {/* Debouncing with lodash.debounce */}
      {/* <h2>Debouncing with lodash.debounce:</h2>
      <input
        // onChange={changeHandler}
        onChange={debouncedHandler}
        type="text"
        placeholder="Type a query..."
      />
      <div>
        {filteredCities?.map((city, index) => (
          <p key={index}>{city}</p>
        ))}
      </div> */}

      {/* Easier debouncing with react-debounce-input */}
      <h2>Debouncing with react-debounce-input:</h2>
      <DebounceInput
        placeholder="search here..."
        minLength={1}
        debounceTimeout={500}
        onChange={(event) => doCityFilter(event.target.value)}
      />
      <div>
        {filteredCities?.map((city, index) => (
          <p key={index}>{city}</p>
        ))}
      </div>
    </form>
  );
}

export default FilterList;
