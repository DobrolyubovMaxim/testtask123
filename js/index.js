import { Game } from './Game/Game.js';

var game = new Game();
game.init();
game.draw();

document.querySelector("body").onkeyup = (event) => {
    switch (event.code) {
        case 'KeyW':
            game.movePlayer("up");
            break;
        case 'KeyA':
            game.movePlayer("left");
            break;
        case 'KeyS':
            game.movePlayer("down");
            break;
        case 'KeyD':
            game.movePlayer("right");
            break;
        case 'Space':
            game.attack();
            break;
    }
    game.AIMove();
    game.draw();

}
