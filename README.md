# coup-client
Game Client for playing Coup Games run by [coup-server](https://github.com/shanemcc/coup-server)

The latest version of this can be found running at https://coup.ds.df.vg/

# TODO: Installation and Running

It runs in docker (registry.shanemcc.net/coup/client:latest), it needs to be told where to point clients (by default it looks in `public/config.json` to decide or uses `SERVERADDR` env var for this) to get access to the server websocket. The default is `ws://:3000/` which works if you're running the images localy for testing, you may want something like `wss://:443/` for real-world usage.

# How it works

The client is fairly dumb. It sends/receives game-events from the server which is where all the logic is, the client just shows what it is told to show.

# Comments, Questions, Bugs, Feature Requests etc.
Bugs and Feature Requests should be raised on the [issue tracker on github](https://github.com/ShaneMcC/coup-client/issues), and I'm happy to recieve code pull requests via github, however I may not always accept every pull request if it does not meet my vision for the project.

Game-Related bugs should probably be raised on the [coup-server issue tracker](https://github.com/ShaneMcC/coup-server/issues) instead, this repo is for the UI. If in doubt, raise it on the server repo.

I can be found idling on various different IRC Networks, but the best way to get in touch would be to message "Dataforce" on Quakenet (or chat in #Dataforce), or drop me a mail (email address is in my github profile)