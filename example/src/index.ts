import { createRoot } from "react-dom/client";
import h from "@macrostrat/hyper";
import { App } from "./app";

const main = document.createElement("div");
main.className = "main";
document.body.appendChild(main);

const root = createRoot(main);
root.render(h(App));
