import store from "./rootstore";
import createHistory from "history/createBrowserHistory";
const history = createHistory();

// share this var
var weAreCurrentlyNavigating = false;

const updateLocation = (location, action) => {
  store.dispatch({
    type: "location_changed",
    location,
    action,
  });
};

export default function initialize() {
  store.subscribe(() => {
    let nextLocation = store.getState().location;
    if (nextLocation !== history.location && nextLocation) {
      weAreCurrentlyNavigating = true;
      history.push(nextLocation);
      weAreCurrentlyNavigating = false;
    }
  });

  history.listen((location, action) => {
    if (!weAreCurrentlyNavigating) {
      updateLocation(location, action);
    }
  });

  updateLocation(history.location);

  return history;
}
