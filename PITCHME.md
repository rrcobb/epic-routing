---
# Epic Routing
## Rob Cobb - May 18 2017

---

How to do routing in single page apps?

+++

..but really

+++

How to do routing in React + Redux?

---

State of the Art

+++

React-Router

```js
const Home = (
  <div>
    <span>My Home Page</span>
    <Link to="/about">About</Link>
  </div>
)

<Router>
  <Route  path="/" component={Home}>
  <Route  path="/about" component={About}>
</Router>
```

+++

Great!
...So long as you

+++

- have pages
- you use `<Link>` to navigate between them
- each page component handles `props.location`
- components rerender on location change

---

What about replicating complicated single page state?

...like a dashboard? |

---

Naively

---

Represent the state in the url

...maybe some action adds to the history as a side effect?

```js
const updateUser = (userId) => {
  history.push(`?userId=${userId}`)
  return { type: 'update_user', userId }
}
```
---

And, the other direction

(history changes to store state)

+++

Get history changes as redux actions
(in some initializer)

```js
import history from 'history'
import store from 'root/store'

history.listen((location, action) =>
  store.dispatch({ type: 'location_changed', location, action })
)
```

+++

whichever reducers need to be updated have actions to respond to

```js
// reducer
function userId(state, action) {
  if (action.type === 'location_changed' && action.location.params) {
    return action.location.params.userId
  }
  return state
}
```
---

And our Route component

---

```js
class Home extends Component {
  componentWillMount(props) {
    initializeComplicatedState(props.location)
  }

  componentWillReceiveProps(nextProps) {
    // this gets particularly tricky
    updateComplexState(props)
  }

  render() {
    <div>
      <span>Current User: {props.userId}</span>
      <Button onClick={() => updateUser(1)}>Choose user 1</Button>
      <Button onClick={() => updateUser(2)}>Choose user 2</Button>
      <Button onClick={() => updateUser(3)}>Choose user 3</Button>
    </div>
  }
}

export default connect((state) => { userId: state.userId })(Home)
```

---

What might `initializeComplexState`  be doing?

What might `updateComplexState`  be doing?

+++

- connecting to services (Pusher, Rollbar)
- fetching data |
- validating url |
- calling redux actions to set some state |
- maybe even |
- *gasp* |
- `updateUser(userId)` ?!!?!?!? |

+++

```js
  componentWillReceiveProps(nextProps) {
    // this gets particularly tricky!!
    updateComplexState(props)
  }
```

+++

- How to tell which location changes were the ones we triggered?
  - (this is the problem that keeps on giving)
- How do the redux actions know _not to update the url_?
- How do code contributors reason about infinite-loop prone side effects? |

+++

```js
// This method calls the appropiate actions to setup the dashboard from the
// route and params. Make sure all actions that are emitted DO NOT route to
// the dashboard again if there are no changes. Failing to do so will cause
// an infinite loop between this method and the action callback.
_setupPage: function(userId, currentThreadId, deepLinkingParams) {
```
+++

😳 😳 😳

---

Goals:
- represent state in url
- restore state on browser action
- isolate url management from other state management

---

Represent State in the url: Navigation Reducer

+++

```js
// navigation reducer
const location = (state: Location, action: Action): Location => {
  switch(action.type) {
    case 'UpdateUser':
      return {...state, params: {...userId: action.data.userId }}
    default:
      return state
  }
}
export location

// root store
import location from './location'
export default combineReducers({ location })
```

+++

Plumbing

```js
store.subscribe(() => {
  let nextLocation = store.getState().location
  if(nextLocation !== history.location) {
    history.push(nextLocation)
  }
}
```

+++

Nothing else should push to history!

+++

(unless it's navigating to another page, like a `<Link>`)

+++

- 😇 functional representation of url changes
- 👿 knows about lots of different actions |
- ¯\_(ツ)_/¯ |

---

Restoring state from history changes

---

still want history change actions...

+++

```js
import history from 'history'
import store from 'root/store'

history.listen((location, action) =>
  store.dispatch({ type: 'location_changed', location, action })
)
```
+++

Instead of handling `'location_changed'` actions in every reducer...

---

# Navigation Epic!!!

+++

```js
import { Observable } from 'rxjs'

const epic = (action$, store) => {
  const urlUpdate$ = action$.ofType('location_change')
  return urlUpdate$.flatMap(action => {
    let { userId } = action.location.params
    if (userId !== store.getState().userId) {
      return { type: 'UpdateUser', userId }
    }
    else {
      return Observable.empty()
    }
  })
}
```
(plus some plumbing for epics to work)

+++

- 😇 (mostly) declarative representation of how to restore the state when the url changes
- 👿 knows about lots of things that have to happen to restore the url |
- ¯\_(ツ)_/¯ |

+++

Better that this file know enough to handle all the routing than for every reducer to be routing-aware

---

What about the infinite loop?

+++

...still need to solve it

+++

```js
// share this var
var weAreCurrentlyNavigating = false

store.subscribe(() => {
  let nextLocation = store.getState().location
  if(nextLocation !== history.location) {
    weAreCurrentlyNavigating = true
    history.push(nextLocation)
    weAreCurrentlyNavigating = false
  }
}

history.listen((location, action) =>
  if(!weAreCurrentlyNavigating) {
    store.dispatch({ type: 'location_changed', location, action })
  }
)
```

+++

still kind of a pain...

+++

but it's all in the plumbing, nothing else needs to think about it!

---

[working example (TODO: fill in working example)]()

---

\#epic

---

You should look at:
- https://github.com/ReactTraining/react-router/tree/master/packages/react-router-redux
- https://github.com/ReactTraining/history
- https://github.com/redux-observable/redux-observable