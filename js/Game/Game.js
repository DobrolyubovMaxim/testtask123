const fieldWidth = 40;
const fieldHeight = 25;
const minRoomsCount = 5;
const maxRoomsCount = 10;
const minRoomSize = 3;
const maxRoomSize = 8;
const minPassagesCount = 3;
const maxPassagesCount = 5;
const swordCount = 2;
const healPotionCount = 10;
const enemyCount = 10;

const tileSize = 25.6;

//it can be rewritten using classes and inheritance, but so far it is of little use
const objects = {
    floor: {
        id: "",
        canPass: true,
        weight: 1,
    },
    wall: {
        id: "W",
        canPass: false,
        weight: 0,
    },
    enemy: {
        id: "E",
        canPass: false,
        weight: 3,
        health: 100,
        damage: 10,
        position: { y: 0, x: 0 },
    },
    player: {
        id: "P",
        canPass: false,
        weight: 3,
        health: 100,
        damage: 40,
    },
    potion: {
        id: "HP",
        canPass: true,
        weight: 2,
    },
    sword: {
        id: "SW",
        canPass: true,
        weight: 2,
    },

};

export class Game {
    constructor() {
        this.field = new Array(fieldHeight)
        for (let i = 0; i < fieldHeight; i++) {
            this.field[i] = new Array(fieldWidth);
            for (let k = 0; k < fieldWidth; k++) {
                this.field[i][k] = new Tile([objects.wall]);
            }
        }
        this.countOfRooms = getRandomInt(minRoomsCount, maxRoomsCount);
        this.countOfPassagesUpDown = getRandomInt(minPassagesCount, maxPassagesCount);
        this.countOfPassagesLeftRight = getRandomInt(minPassagesCount, maxPassagesCount);
        this.playerPos = [0, 0];
        this.enemyList = [];
    }

    init() {
        for (let i = 0; i < this.countOfRooms; i++) {
            let height = getRandomInt(minRoomSize, maxRoomSize);
            let width = getRandomInt(minRoomSize, maxRoomSize);
            let newRoom = this.getFreeRectangle(height, width);
            this.fillRectangle(newRoom);
        }

        for (let i = 0; i < this.countOfPassagesUpDown; i++) {
            let place = getRandomInt(0, fieldWidth);
            let newPassage = new Rectangle(place, 0, place + 1, fieldHeight)
            this.fillRectangle(newPassage);
        }

        for (let i = 0; i < this.countOfPassagesLeftRight; i++) {
            let place = getRandomInt(0, fieldHeight);
            let newPassage = new Rectangle(0, place, fieldWidth, place + 1)
            this.fillRectangle(newPassage);
        }


        this.placeObjects(objects.sword, swordCount);
        this.placeObjects(objects.potion, healPotionCount);
        this.placeObjects(objects.enemy, enemyCount);
        this.playerPos = this.placeObjects(objects.player, 1);
    }

    draw() {
        let oldTiles = document.querySelectorAll('.field .tile')
        for (let tile of oldTiles)
            tile.remove();

        for (let i = 0; i < fieldHeight; i++)
            for (let k = 0; k < fieldWidth; k++) {
                var cell = document.createElement('div');
                cell.classList.add(`tile`);
                cell.classList.add(`tile${this.field[i][k].id}`);
                cell.style.left = `${k * tileSize}px`
                cell.style.top = `${i * tileSize}px`

                var healthBar
                if (this.field[i][k].id == "P" || this.field[i][k].id == "E") {
                    healthBar = document.createElement('div');
                    healthBar.classList.add(`health`);
                    healthBar.style.width = `${this.field[i][k].health * tileSize / 100}px`;
                    cell.appendChild(healthBar);
                }

                document.querySelector('.field').appendChild(cell);

            }

    }

    getFreeRectangle(height, width) {
        let x;
        let y;
        let check;
        for (let m = 0; m < 10; m++) {
            //get top left corner of new rectangle
            x = getRandomInt(0, fieldWidth - width); // (fieldWidth - width) is used to keep within bounds of the array
            y = getRandomInt(0, fieldHeight - height);
            check = true
            for (let i = 0; i < height; i++) {
                for (let k = 0; k < width; k++) {
                    if (this.field[y + i][x + k].canPass) {
                        check = false;
                        break;
                    }
                }
                if (!check)
                    break
            }
            if (check)
                return new Rectangle(x, y, x + width, y + height)

        }
        return false
    }

    fillRectangle(rectangle) {
        for (let i = 0; i < rectangle.width; i++)
            for (let k = 0; k < rectangle.height; k++)
                this.field[rectangle.y1 + k][rectangle.x1 + i] = new Tile([Object.assign({}, objects.floor)])
    }

    placeObjects(type, count) {
        let x, y;
        for (let i = 0; i < count;) {
            x = getRandomInt(0, fieldWidth);
            y = getRandomInt(0, fieldHeight);
            let newObject;
            if (this.field[y][x].canPass && !this.field[y][x].getObject(type.id)) {
                newObject = Object.assign({}, type)
                this.field[y][x].content.push(newObject);
                this.field[y][x].updateStats();
                i++;
                if (type.id == "E") {
                    this.enemyList.push(newObject)
                    newObject.position = { y: y, x: x }
                }
            }
        }
        return [y, x]
    }

    movePlayer(direction) {
        let x = 0;
        let y = 0;
        switch (direction) {
            case "up":
                y = -1;
                break;
            case "left":
                x = -1;
                break;
            case "down":
                y = 1;
                break;
            case "right":
                x = 1;
                break;
        }
        let newY = this.playerPos[0] + y
        let newX = this.playerPos[1] + x

        if (newY < 0 || newY > fieldHeight || newX < 0 || newX > fieldWidth)
            return

        let playerTile = this.field[this.playerPos[0]][this.playerPos[1]]
        let newTile = this.field[newY][newX]

        if (!newTile.canPass)
            return

        newTile.content.push(objects.player)
        newTile.updateStats();

        playerTile.content.splice(playerTile.content.indexOf(playerTile.getObject("P")), 1);
        playerTile.updateStats();

        this.playerPos = [newY, newX];
    }

    attack() {
        const player = this.field[this.playerPos[0]][this.playerPos[1]].getObject("P");

        for (let i = -1; i <= 1; i++)
            for (let k = -1; k <= 1; k++) {
                let indexY = this.playerPos[0] + i;
                let indexX = this.playerPos[1] + k;
                if (indexY < 0 || indexY > fieldHeight || indexX < 0 || indexX > fieldWidth)
                    continue;
                let enemy = this.field[indexY][indexX].getObject("E");

                if (enemy && player) {
                    enemy.health -= player.damage;
                    if (enemy.health <= 0) {
                        let enemyListObj = this.enemyList.find(e => (e.position.x == indexX && e.position.y == indexY))
                        this.enemyList.splice(enemyTile.content.indexOf(enemyListObj), 1);
                    }
                    this.field[indexY][indexX].updateStats();
                }

            }
    }

    AIMove() {
        for (let enemy of this.enemyList) {
            if (Math.abs(enemy.position.y - this.playerPos[0]) <= 1 && Math.abs(enemy.position.x - this.playerPos[1]) <= 1)
                objects.player.health -= enemy.damage;

            let direction = getRandomInt(0, 4);
            let newPosition
            switch (direction) {
                case 0:
                    newPosition = { y: enemy.position.y, x: enemy.position.x - 1 };
                    break;
                case 1:
                    newPosition = { y: enemy.position.y - 1, x: enemy.position.x };
                    break;
                case 2:
                    newPosition = { y: enemy.position.y, x: enemy.position.x + 1 };
                    break;
                case 3:
                    newPosition = { y: enemy.position.y + 1, x: enemy.position.x };
                    break;
            }
            if (newPosition.y < 0 || newPosition.y > fieldHeight || newPosition.x < 0 || newPosition.x > fieldWidth)
                continue;

            let enemyTile = this.field[enemy.position.y][enemy.position.x]
            let newTile = this.field[newPosition.y][newPosition.x]

            if (!newTile.canPass)
                continue;

            enemy.position = newPosition;

            newTile.content.push(enemy)
            enemyTile.content.splice(enemyTile.content.indexOf(enemy), 1);

            newTile.updateStats();
            enemyTile.updateStats();



        }

    }

}

class Rectangle {
    constructor(x1, y1, x2, y2) {
        //sets x1, y1 in top left corner
        this.x1 = x1 < x2 ? x1 : x2;
        this.y1 = y1 < y2 ? y1 : y2;
        this.x2 = x1 > x2 ? x1 : x2;
        this.y2 = y1 > y2 ? y1 : y2;

        //calculate size
        this.width = x2 - x1;
        this.height = y2 - y1;
    }
}

class Tile {
    id = "";
    canPass = true;
    content = [];
    health = false;

    constructor(content) {
        this.content = content.slice();
        this.updateStats();
    }

    updateStats() {
        let maxWeight = -1;
        let potion = false;
        let sword = false;
        let player = false;
        let needHealthBar = false;

        for (let object of this.content) {
            if (object.health) {
                if (object.health <= 0) {
                    this.content.splice(this.content.indexOf(object), 1);
                    continue;
                }
                this.health = object.health;
                needHealthBar = true;
            }

            if (object.weight > maxWeight) {
                this.id = object.id;
                maxWeight = object.weight;
            }

            switch (object.id) {
                case "HP":
                    potion = object;
                    break;
                case "SW":
                    sword = object;
                    break;
                case "P":
                    player = object;
                    break;
            }
        }

        if (!needHealthBar)
            this.health = false;

        if (this.content.every(object => object.canPass))
            this.canPass = true;
        else
            this.canPass = false;


        if (player && potion) {
            player.health = 100;
            //removes potion from tile's content
            this.content.splice(this.content.indexOf(this.getObject("HP")), 1);
        }

        if (player && sword) {
            player.damage += 30;
            //removes sword from tile's content
            this.content.splice(this.content.indexOf(this.getObject("SW")), 1);
        }
    }

    getObject(objectID) {
        for (let object of this.content)
            if (object.id == objectID)
                return object
        return false
    }

}


function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
