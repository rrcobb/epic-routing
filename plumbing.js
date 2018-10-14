export default function initialize(store, history) {
  const updateLocation = (location, action) => {
    store.dispatch({
      type: 'location_changed',
      location,
      action,
    });
  };

  const locationChanged = (curr, prev) => {
    let changed =
      curr && curr !== prev && (curr.pathname !== prev.pathname || curr.search !== prev.search);
    return changed;
  };

  store.subscribe(() => {
    let nextLocation = store.getState().location;
    if (locationChanged(nextLocation, history.location)) {
      nextLocation.__epicNavigation = true;
      history.push(nextLocation);
    }
  });

  history.listen((location, action) => {
    if (action !== 'PUSH' || !location.__epicNavigation) {
      updateLocation(location, action);
    }
  });

  updateLocation(history.location, 'PUSH');

  return history;
}
