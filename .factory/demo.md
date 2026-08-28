# Shelf Bridge demo sandbox

Open `/demo` or `/?demo=1` to load a three-row BoardGameGeek-style collection: Catan, Gloomhaven, and Terraforming Mars. The sample demonstrates owned, previously owned, wishlist, and want-to-play statuses.

Demo mode stores only its shipped sample under the browser session key `demo:shelf-bridge:sample`. It never reads or writes real working data. The persistent demo banner has **Reset demo** to reseed the sample and **Start for real** to remove the `demo:` key, discard the sample state, and return to the empty converter.

Claim tests use `/demo` from a fresh browser context. Offline testing first loads that URL online, waits for the service worker, then reloads it offline.
