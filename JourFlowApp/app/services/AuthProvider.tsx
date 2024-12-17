import * as React from "react";

import {getItem , setItem , removeItem} from "./async_storage";

// Mở rộng interface để bao gồm userId
interface AuthContextType {
  status: "idle" | "signIn" | "signOut";
  authToken: string | null;
  userId: string | null;
  signIn: (token: string, userId: string) => void;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
  status: "idle",
  authToken: null,
  userId: null ,
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
    userId: null,
  });

  React.useEffect(() => {
    const initState = async () => {
      try {
        const authToken = await getItem("token");
        const userId = await getItem("userId");
        if (authToken !== null && userId !== null) {
          dispatch({ type: "SIGN_IN", token: authToken, userId: userId });
        } else {
          dispatch({ type: "SIGN_OUT" });
        }
      } catch (e) {
        throw e;
      }
    };
    initState();
  }, []);
  const actions = React.useMemo(
    () => ({
      signIn: async (token: string, userId: string) => {
        await setItem("token", token); // Save the token first
        await setItem("userId", userId);
        dispatch({ type: "SIGN_IN", token }); // Then update the state
      },

      signOut: async () => {
        dispatch({ type: "SIGN_OUT" });
        await removeItem("token");
        await removeItem("userId");
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
        userId: null,
      };
    case "SIGN_IN":
      return {
        ...state,
        status: "signIn",
        authToken: action.token,
        userId: action.userId,
      };
    default:
      return state;
  }
};
