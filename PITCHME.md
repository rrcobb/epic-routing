---

# Epic Routing

Rob Cobb - May 18 2017

---

How to do routing in single page apps?

+++

...but really

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

const App = (
  <Router>
    <Route  path="/" component={Home}>
    <Route  path="/about" component={About}>
  </Router>
)

```

+++

Great!

+++

...So long as you

- have pages |
- navigate with Link |
- handle props.location in each component |

---

What about replicating complicated single page state?

+++

...like a dashboard?

---

Naively

- represent the state in the url |
- restore the state when the url changes |

+++

Represent the state in the url

+++

...push history as an action side effect?

```js

const updateUser = (userId) => {
  history.push(`?userId=${userId}`)
  return { type: 'update_user', userId }
}

const userReducer = (state, action) => {
  switch(action.type) {
    case 'update_user':
      return action.userId
    default:
      return state
  }
}

```
---

And, the other direction

+++

Get history changes as redux actions

+++

(in some initializer)

```js

import history from 'history'
import store from 'rootstore'

history.listen((location, action) =>
  store.dispatch({
    type: 'location_changed',
    location,
    action
  })
)

```

+++

update the reducer to respond to the url change action...

```js

const userReducer = (state, action) => {
  switch(action.type) {
    case 'update_user':
      return action.userId
    case 'location_changed':
      if(action.location.params) {
        return action.location.params.userId
      }
    default:
      return state
  }
}

```
---

And, for completeness,

+++

The Route component

+++

```js

import { connect } from 'react-redux'
import { updateUser } from 'userId'

class Users extends Component {
  componentWillMount(props) {
    initializeState(props)
  }

  componentWillReceiveProps(nextProps) {
    updateComplexState(props)
  }

  render() {
    let { userId, updateUser } = this.props

```

+++

```js
    return (
      <div>
        <span>Current User: {userId}</span>
        <Button onClick={() => updateUser(1)}>
          Choose user 1
        </Button>
        <Button onClick={() => updateUser(2)}>
          Choose user 2
        </Button>
        <Button onClick={() => updateUser(3)}>
          Choose user 3
        </Button>
      </div>
    )
  }
}

export default connect(
  (state) => ({ userId: state.userId }),
  { updateUser }
)(Users)

```

---

What's `initializeComplexState`?

What's `updateComplexState`?

+++

- connecting services (Pusher, Rollbar)
- fetching data |
- validating url |
- calling redux actions to set some state |
- maybe even |
- *gasp* |
- updateUser(userId) ?!!?!?!? |

+++

This gets particularly tricky!!

```js

  componentWillReceiveProps(nextProps) {
    updateComplexState(props)
  }

```

+++

How to tell which location changes were the ones we triggered?

 (this is the problem that keeps on giving)

+++

How do actions know when _not_ to update the url?

+++

How do we reason about infinite-loop prone side effects?

+++

```js

// This method calls the appropiate actions to setup
// the dashboard from the route and params. Make sure
// all actions that are emitted DO NOT route to the
// dashboard again if there are no changes. Failing to
// do so will cause an infinite loop between this
// method and the action callback.
_setupPage: function(userId, currentThreadId, deepLinkingParams) {


```
+++

😳 😳 😳

---

Goals

+++

- represent state in url |
- restore state on browser action |
- isolate url management from other state management |

---

Represent state in the url

+++

Navigation Reducer

+++

```js
const location = (state, action) => {
  switch(action.type) {
    case 'update_user':
      return {
        ...state,
        params: {
          ...state.params,
          userId: action.data.userId
        }
      }
    default:
      return state
  }
}
```

+++

Plumbing

```js

import store from 'rootstore'

store.subscribe(() => {
  let nextLocation = store.getState().location
  if(nextLocation !== history.location) {
    history.push(nextLocation)
  }
}

```

+++

Nothing else should push to history!!

+++

(unless it's navigating to another page, like a `<Link>`)

+++

- 😇 functional representation of url changes
- 👿 knows about lots of different actions |
- ¯\_(ツ)_/¯ |

---

Restoring state from history changes

+++

We still need history change actions...

+++

```js

import history from 'history'
import store from 'rootstore'

// same as before
history.listen((location, action) =>
  store.dispatch({ type: 'location_changed', location, action })
)

```

+++

Instead of `'location_changed'` in every reducer...

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
      return { type: 'update_user', userId }
    } else {
      return Observable.empty()
    }
  })
}
```

(plus some plumbing for epics to work)

+++

- 😇 (mostly) declarative
- 😇 restores state from url |
- 👿 knows about everything restored from the url |
- ¯\_(ツ)_/¯ |

+++

All restore logic lives here

Otherwise, routing logic in _every reducer_

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
})
```

+++

```js

history.listen((location, action) => {
  if(!weAreCurrentlyNavigating) {
    store.dispatch({
      type: 'location_changed',
      location,
      action
    })
  }
})

```

+++

still kind of a pain...

+++

...but it's all in the plumbing!

+++

Nothing else needs to think about routing!

---

\#epic

---

[working example](https://epic-routing-hpyotubcli.now.sh)

---

You should look at:
- https://github.com/ReactTraining/react-router/tree/master/packages/react-router-redux
- https://github.com/ReactTraining/history
- https://github.com/redux-observable/redux-observable