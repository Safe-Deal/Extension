import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";

const root = document.getElementById("popup");
const reactRoot = createRoot(root);
reactRoot.render(<Popup />);
