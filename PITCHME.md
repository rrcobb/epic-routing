---
# Epic Routing
## Rob Cobb - May 18 2017

---

How to do routing in single page apps?

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

- If you have pages
- And you use `<Link>` to navigate between them |
- Each component gets `props.location` |
- Components rerender on location change |

---

What about replicating complicated single page state?

---

Maybe some action adds to the history as a side effect:

```js
const updateUser = (userId) => {
  push(`?userId=${userId}`)
  return { type: 'update_user', userId }
}
```

+++

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
      <ComplicatedSubComponents />
    </div>
  }
}
```

+++

Particularly tricky

```js
  componentWillReceiveProps(nextProps) {
    // this gets particularly tricky
    updateComplexState(props)
  }
```

+++

How to tell which location changes were the ones we triggered?
(this is the problem that keeps on giving)

+++

What might `initializeComplexState` be doing?

What might `updateComplexState` be doing? |

- connecting to services (Pusher, Rollbar) |
- fetching data |
- validating url |
- calling redux actions to set some state |
- maybe even *gasp*
- `updateUser(userId)`

---

How do the redux actions know _not to update the url_?
How do code contributors reason about infinite-loop prone side effects? |

+++
```js
// This method calls the appropiate actions to setup the dashboard from the
// route and params. Make sure all actions that are emitted DO NOT route to
// the dashboard again if there are no changes. Failing to do so will cause
// an infinite loop between this method and the action callback.
_setupPage: function(userId, currentThreadId, deepLinkingParams) {
```
+++

- 😳
- 😰 |
- 😱 |