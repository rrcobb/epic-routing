import { Observable } from 'rxjs';
import queryString from 'query-string';

const location = (state = null, action) => {
  switch (action.type) {
    case 'location_changed':
      return action.location;
    case 'update_user':
      return {
        ...state,
        search: `?userId=${action.userId}`,
      };
    default:
      return state;
  }
};

const epic = (action$, store) => {
  const urlUpdate$ = action$.ofType('location_changed');

  return urlUpdate$.flatMap(action => {
    let userId = queryString.parse(action.location.search).userId;
    if (userId && userId !== store.getState().userId) {
      store.dispatch({ type: 'update_user', userId });
    }
    return Observable.empty();
  });
};

export { location, epic };
