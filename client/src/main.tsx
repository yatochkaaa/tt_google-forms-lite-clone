import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { store } from "./store/index.ts";
import { api } from "./store/baseApi.ts";
import "./index.css";

api.enhanceEndpoints({
  endpoints: {
    GetResponses: { providesTags: ["Response"] },
    SubmitResponse: { invalidatesTags: ["Response"] },
  },
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
