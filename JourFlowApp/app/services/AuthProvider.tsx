import * as React from "react";

import {
  getItem as getToken,
  setItem as setToken,
  removeItem as removeToken,
} from "./async_storage";

const AuthContext = React.createContext({
  status: "idle",
  authToken: null,
  signIn: (token: string) => {},
  signOut: () => {},
});

export const useAuthorization = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("Error");
  }
  return context;
};

export const AuthProvider = (props: any) => {
  const [state, dispatch] = React.useReducer(reducer, {
    status: "idle",
    authToken: null,
  });

  React.useEffect(() => {
    console.log("AuthProvider mounted");
    const initState = async () => {
      try {
        const authToken = await getToken();
        console.log("Token retrieved during initialization:", authToken);
        if (authToken !== null) {
          dispatch({ type: "SIGN_IN", token: authToken });
        } else {
          dispatch({ type: "SIGN_OUT" });
        }
      } catch (e) {
        console.log(e);
      }
    };
    initState();
  }, []);
  const actions = React.useMemo(
    () => ({
      signIn: async (token: any) => {
        console.log("signIn function called");
        await setToken(token); // Save the token first
        dispatch({ type: "SIGN_IN", token }); // Then update the state
      },

      signOut: async () => {
        dispatch({ type: "SIGN_OUT" });
        await removeToken();
      },
    }),
    [state, dispatch]
  );
  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
      {props.children}
    </AuthContext.Provider>
  );
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "SIGN_OUT":
      return {
        ...state,
        status: "signOut",
        authToken: null,
      };
    case "SIGN_IN":
      return {
        ...state,
        status: "signIn",
        authToken: action.token,
      };
    default:
      return state;
  }
};
