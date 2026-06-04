# Island Siege

This is an open-source online implementation of [Island Siege](https://boardgamegeek.com/boardgame/133405/island-siege).
**This implementation is not affiliated with APE Games in any way**.
Please consider [buying the game](https://www.amazon.com/APE-Games-Island-Siege-Multi/dp/099942887X/) to show support to the creators.

This project is built using typescript and react.

## Building

### npm installation

Use npm to install the required packages. From the project root run the following command:

`npm install`

## Running

To run both the game server and the frontend together:

`npm run dev`

This starts the backend on port 3001 and the React frontend on port 3000. Open `http://localhost:3000` to play.

To run them separately:

- Frontend only: `npm start`
- Server only: `npm run server:dev`

You can also use `npm run` to list all available commands.

## Testing

This project uses jester testing. npm can be used to run the unit tests. From the project root run the following command:

`npm run test`
