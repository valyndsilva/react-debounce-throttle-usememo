# Debounce and Throttle Callbacks

Debounce and throttle are two similar (but different!) techniques to control how many times we allow a function to be executed over time.

Having a debounced or throttled version of our function is important when we are attaching the function to a DOM event as we have no control over how often those DOM events are going to be emitted.

Ex: When scrolling using a trackpad, scroll wheel, or just by dragging a scrollbar can trigger easily 30 events per second. But scrolling slowly (swapping) in a smartphone could trigger as much as 100 events per second during my tests. Is your scroll handler prepared for this rate of execution?

# Scripts installed:

npm install cities-list
npm install lodash.debounce
npm install lodash.throttle

## Debounce

The Debounce technique allow us to “group” multiple sequential calls in a single one.

## Throttle

When we throttle a function, it will only be invoked once in a given period, no matter how many times its corresponding event listener is triggered.

## How to Correctly Debounce and Throttle Callbacks in React

When a React component handles bursting events like window resize, scrolling, user typing into an input, etc. — it's wise to soften the handlers of these events.

Otherwise, when the handlers are invoked too often you risk making the application lagging or even unresponsive for a few seconds. Fortunately, debouncing and throttling techniques can help you control the invocation of the event handlers.

### The callback without debouncing

Let's say that a component <FilterList> accepts a big list of names (at least 200 records). The component has an input field where the user types a query and the names are filtered by that query.

Here's the first version of <FilterList> component:

```
import { useState } from 'react';
export function FilterList({ names }) {
  const [query, setQuery] = useState('');
  let filteredNames = names;
  if (query !== "") {
    filteredNames = names.filter((name) => {
      return name.toLowerCase().includes(query.toLowerCase());
    });
  }
  const changeHandler = event => {
    setQuery(event.target.value);
  };
  return (
    <div>
      <input
        onChange={changeHandler}
        type="text"
        placeholder="Type a query..."
      />
      {filteredNames.map(name => <div key={name}>{name}</div>)}
    </div>
  );
}
```

When typing the query into the input field, you can notice that the list gets filtered for every introduced character.

For example, if you type char by char the word Michael, then the component would display flashes of filtered lists for the queries M, Mi, Mic, Mich, Micha, Michae, Michael. However, the user would need to see just one filter result: for the word Michael.

Let's improve the process of filtering by applying 300ms time debouncing on the changeHandler callback function.

### Debouncing a callback, the first attempt

To debounce the changeHandler function I'm going to use the lodash.debounce package. You can use any other library at your will, or even write the debounce function by yourself.

First, let's look at how to use the debounce() function:

```
import debounce from 'lodash.debounce';
const debouncedCallback = debounce(callback, waitTime);
```

debounce() function accepts the callback argument function, and returns a debounced version of that function.

When the debounced function debouncedCallback gets invoked multiple times, in bursts, it will invoke the callback only after waitTime has passed after the last invocation.

The debouncing fits nicely to soften the filtering inside the <FilterList>: let's debounce changeHandler to 300ms wait time.

The only problem with applying debouncing to changeHandler inside a React component is that the debounced version of the function should remain the same between component re-renderings.

The first approach would be to use the useCallback(callback, dependencies) that would keep one instance of the debounced function between component re-renderings.

```
import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
export function FilterList({ names }) {
  const [query, setQuery] = useState("");
  let filteredNames = names;
  if (query !== "") {
    filteredNames = names.filter((name) => {
      return name.toLowerCase().includes(query.toLowerCase());
    });
  }
  const changeHandler = event => {
    setQuery(event.target.value);
  };
  const debouncedChangeHandler = useCallback(
    debounce(changeHandler, 300)
  , []);
  return (
    <div>
      <input
        onChange={debouncedChangeHandler}
        type="text"
        placeholder="Type a query..."
      />
      {filteredNames.map(name => <div key={name}>{name}</div>)}
    </div>
  );
}
```

debounce(changeHandler, 300) creates a debounced version of the event handled, and useCallback(debounce(changeHandler, 300), []) makes sure to return the same instance of the debounced callback between re-renderings.

Note: the approach also works with creating throttled functions, e.g. useCallback(throttle(callback, time), []).

Type a query: you'll see that the list is filtered with a delay of 300ms after the last typing: which brings a softer and better user experience.

However... this implementation has a small performance issue: each time the component re-renders, a new instance of the debounced function is created by the debounce(changeHandler, 300).

That's not a problem regarding the correctness: useCallback() makes sure to return the same debounced function instance. But it would be wise to avoid calling debounce(...) on each rendering.

Let's see how to avoid creating debounced functions on each render in the next section.

### Debouncing a callback, second attempt

Fortunately, using useMemo() hook as an alternative to useCallback() is a more optimal choice:

```
import { useState, useMemo } from 'react';
import debounce from 'lodash.debounce';
export function FilterList({ names }) {
  const [query, setQuery] = useState("");
  let filteredNames = names;
  if (query !== "") {
    filteredNames = names.filter((name) => {
      return name.toLowerCase().includes(query.toLowerCase());
    });
  }
  const changeHandler = (event) => {
    setQuery(event.target.value);
  };
  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 300)
  , []);
  return (
    <div>
      <input
        onChange={debouncedChangeHandler}
        type="text"
        placeholder="Type a query..."
      />
      {filteredNames.map(name => <div key={name}>{name}</div>)}
    </div>
  );
}
```

useMemo(() => debounce(changeHandler, 300), []) memoizes the debounced handler, but also calls debounce() only during initial rendering of the component.

This approach also works with creating throttled functions: useMemo(() => throttle(callback, time), []).

Typing into the input field is still debounced.

### Be careful with dependencies

If the debounced handler uses props or state, to avoid creating stale closures, I recommend setting up correctly the dependencies of useMemo():

```
import { useMemo } from 'react';
import debounce from 'lodash.debounce';
function MyComponent({ prop }) {
  const [value, setValue] = useState('');

  const eventHandler = () => {
    // the event uses `prop` and `value`
  };
  const debouncedEventHandler = useMemo(
    () => debounce(eventHandler, 300)
  , [prop, stateValue]);

  // ...
}
```

Properly setting the dependencies guarantees refreshing the debounced closure.

### Cleanup

Because debouncing and throttling execute the function with a delay, you might end up in a situation when the function is executed after the component is unmounted.

When no longer needed, it is recommended to cancel debouncing and throttling.

The debounce and throttle implementations usually provide a special method to cancel the execution. For example lodash.debounce library provides debouncedCallback.cancel() to cancel any scheduled calls.

Here's how you can cancel the debounced function when the component unmounts:

```
import { useState, useMemo, useEffect } from 'react';
import debounce from 'lodash.debounce';
export function FilterList({ names }) {
  // ....
  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 300)
  , []);
  // Stop the invocation of the debounced function
  // after unmounting
  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    }
  }, []);
  return (
    // ....
  );
}
```

## Conclusion

A good way to create debounced and throttled functions, to handle often happening events, is by using the useMemo() hook:

```
import { useMemo } from 'react';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
function MyComponent() {
  const eventHandler = () => {
    // handle the event...
  };
  const debouncedEventHandler = useMemo(
    () => debounce(eventHandler, 300)
  , []);
  const throttledEventHandler = useMemo(
    () => throttle(eventHandler, 300)
  , []);

  // ...
}
```

If the debounced or throttled event handler accesses props or state values, do not forget to set the dependencies argument of useMemo(..., dependencies).

## Easier debouncing with react-debounce-input

npm install react-debounce-input

import { DebounceInput } from 'react-debounce-input'

Instead of our current <input/> tag in the JSX code, let’s paste this:

```
<DebounceInput
  className="px-2"
  placeholder="search here..."
  minLength={1}
  debounceTimeout={500}
  onChange={event => (doCityFilter(event.target.value))}
/>
```

Our <DebounceInput /> component comes with a debounceTimeout prop for specifying how long we want to wait before the onChange function is called. Here, we’ve used 500 milliseconds. We also have a minLength for specifying the minimum number of inputs we want before our onChange event is triggered.

Now that we are using the <DebounceInput /> component, we can go back to the simple version of the doCityFilter() function

```
const doCityFilter = query => {
  if (!query) return setFilteredCities([])

  setFilteredCities(citiesArray.filter(
    city => city.toLowerCase().includes(query.toLowerCase())
  ))
}
```
