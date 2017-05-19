import { Observable } from "rxjs";

const location = (state = null, action) => {
  switch (action.type) {
    case "location_changed":
      return action.location;
    case "update_user":
      return {
        ...state,
        search: `userId=${action.userId}`,
      };
    default:
      return state;
  }
};

const epic = (action$, store) => {
  const urlUpdate$ = action$.ofType("location_change");

  return urlUpdate$.flatMap(action => {
    let params = action.location.params || {};
    let userId = params.userId;

    if (userId !== store.getState().userId) {
      return { type: "update_user", userId };
    } else {
      return Observable.empty();
    }
  });
};

export { location, epic };
