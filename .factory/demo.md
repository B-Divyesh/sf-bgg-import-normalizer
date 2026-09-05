# Shelf Bridge demo sandbox

Open `/demo` or `/?demo=1` to load four BoardGameGeek-style rows for Catan, Gloomhaven, and Terraforming Mars. The second Catan row is a deliberate duplicate, so the sample immediately demonstrates duplicate review as well as owned, previously owned, wishlist, and want-to-play statuses.

Demo mode stores only its shipped sample under the browser session key `demo:shelf-bridge:sample`. It never reads or writes real working data. The persistent demo banner has **Reset demo** to reseed the sample and **Use my BGG CSV** to remove the `demo:` key, discard the sample state, and restore any real collection already open in this tab.

Claim tests use `/demo` from a fresh browser context. Offline testing first loads that URL online, waits for the service worker, then reloads it offline.
