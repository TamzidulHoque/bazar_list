// main.js — সব module একসাথে জোড়া লাগায় ও app চালু করে (entry point)

// এই import-গুলো প্রতিটা feature-এর listener চালু করে (side-effect)
import "./navbar.js";
import "./tabs.js";
import "./list.js";
import "./pagination.js";
import "./auth.js";

import { loadItems } from "./sync.js";

// শুরুতে সঠিক list লোড করে পর্দা আঁকি
loadItems();
