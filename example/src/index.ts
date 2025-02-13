import { render } from "react-dom";
import h from "@macrostrat/hyper";
import { App } from "./app";

const main = document.createElement("div");
main.className = "main";
document.body.appendChild(main);


render(h(App), main);
