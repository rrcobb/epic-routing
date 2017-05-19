const updateUser = userId => {
  return { type: "update_user", userId };
};

const userReducer = (state = 1, action) => {
  switch (action.type) {
    case "update_user":
      return action.userId;
    default:
      return state;
  }
};

export { updateUser };
export default userReducer;
