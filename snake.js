/*The basic idea behind my version of the classic game snake is the snake object has properties Headcount and tailcount, when the snake head passes over a spot it passes on its headcount value to the spot. Tailcount is the headcount minus the length of the snake. Then if a spot has a value greater than the tailcount it is considered the snake for drawing an colision purposes*/

var size = 20;

var Computer = true; //set to false to play yourself
var fps = 80; //lower to change speed

var SW = 800 //proportions of game window
var SH = 800
var dx = Math.floor(SW / size)
var dy = Math.floor(SH / size)

var randX = Math.floor(Math.random() * dx);
var randY = Math.floor(Math.random() * dy);
//inialising global matrix variable as empty array and path as an array contain 0,0 so the computer can make its first move
var matrix = [];
var path2 = [0, 0]

function Spot(i, j, v) { // create object to store information about each node

    // Location
    this.i = i;
    this.j = j;
    this.v = v;
    this.f = false;
    this.s = false;
    this.fval = 0;
    this.g = 0;
    this.h = 0;
    this.neighbours = [];
    this.previous = undefined;

    this.show = function (col) {
        fill(col)
        rect(this.i * size, this.j * size, snake.size, snake.size);
    }
    //method to find all the neighbours of each node, if the node is on the edge of the screen then it will have fewer neighbours
    this.getNeighbours = function (matrix) {
        var i = this.i
        var j = this.j
        if (i < dx - 1) {
            this.neighbours.push(matrix[i + 1][j])
        }
        if (i > 0) {
            this.neighbours.push(matrix[i - 1][j])
        }
        if (j < dy - 1) {
            this.neighbours.push(matrix[i][j + 1])
        }
        if (j > 0) {
            this.neighbours.push(matrix[i][j - 1])
        }
    }


}
//function to remove elements from array, starts at the end so as to avoid issues with indexing after removal
function removeFromArray(arr, elt) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == elt) {
            arr.splice(i, 1);
        }
    }
}

//function to find the distance from a point to a given point, the choice of distance formula will affect the A* algo.  With the current setup, the snake takes a slightly longer path whihc can prolong its life. For shortest path, use the taxi cab metric.
function heuristic(a, b) {
    //    var e = Math.pow((abs(a.i - b.i) + abs(a.j - b.j)), 4)
    var e = dist(a.i, a.j, b.i, b.j);
    if (e != 0) {
        var d = 1 / e;
    } else {
        var d = 0
    }
    return d
}

var snake = { //snake object
    xPos: Math.floor(Math.random() * dx),
    yPos: Math.floor(Math.random() * dy),
    size: 20,
    vel: 0,
    xVel: 1,
    yVel: 0,
    Headcount: 1,
    Tailcount: 1
};


//Randomly generates a spot for food, if snakebody is there then regenerates. Also decrements tailcount, ie increases length
function food() {
    while (true) {
        randX = Math.floor(Math.random() * dx);
        randY = Math.floor(Math.random() * dy);
        if (matrix[randX][randY].v < snake.Tailcount) {
            matrix[randX][randY].f = true
            break;
        }
    }
    snake.Tailcount -= 1 //increases the size of the snake
}

function reset() {
    snake.xPos = Math.floor(Math.random() * dx);
    snake.yPos = Math.floor(Math.random() * dy);
    snake.Headcount = 1;
    snake.Tailcount = 1;
    for (var i = 0; i < dx; i++) {
        for (var j = 0; j < dy; j++) {
            matrix[i][j].v = 0; //set the value of every node equal to 0
        }
    }

}


//for a human to play
function keyPressed() {
    if ((keyCode === UP_ARROW) & (snake.yVel != 1)) {
        snake.xVel = 0;
        snake.yVel = -1;
    } else if ((keyCode === DOWN_ARROW) & (snake.yVel != -1)) {
        snake.xVel = 0;
        snake.yVel = 1;
    } else if ((keyCode === RIGHT_ARROW) & (snake.xVel != -1)) {
        snake.xVel = 1;
        snake.yVel = 0;
    } else if ((keyCode === LEFT_ARROW) & (snake.xVel != 1)) {
        snake.xVel = -1;
        snake.yVel = 0;
    }
    snake.vel = 1;
}

//A* algo which is based on the Coding Trains Maze solver version
function aStar(start, end, openList, closedSet) {

    openList.push(start);
    while (openList.length > 0) {
        var winner = 0;

        for (var i = 0; i < openList.length; i++) {
            if (openList[i].fval < openList[winner].fval) {

                winner = i;
            }
        }

        var current = openList[winner];

        if (current == end) {
            path = [];
            var temp = current;
            path.push(temp);
            while (temp.previous) {
                path.push(temp.previous);
                temp = temp.previous
            }

            break
        }
        removeFromArray(openList, current);
        closedSet.push(current);


        var neighbours = current.neighbours;
        for (var i = 0; i < neighbours.length; i++) {
            var neighbour = neighbours[i];
            if (!closedSet.includes(neighbour) && !neighbour.s) {
                var tempG = current.g + 1;

                if (openList.includes(neighbour)) {
                    if (tempG < neighbour.g) {
                        neighbour.g = tempG
                    }
                } else {
                    neighbour.g = tempG
                    openList.push(neighbour)
                }

                neighbour.h = heuristic(neighbour, end);
                neighbour.fval = neighbour.g + neighbour.h
                neighbour.previous = current;
            }

        }

    }


    return path
}


function setup() {
    // put setup code here
    createCanvas(SW, SH);
    frameRate(fps);

    for (var i = 0; i < dx; i++) { //creates 2d array and puts a new instance of Spot in each index
        matrix[i] = [];
        for (var j = 0; j < dy; j++) {
            matrix[i][j] = new Spot(i, j, 0);


        }
    }
    for (var i = 0; i < dx; i++) {
        for (var j = 0; j < dy; j++) {
            matrix[i][j].getNeighbours(matrix); //populates Neighbours of each spot

        }
    }

}


function draw() {
    // put game loop and drawing code here
    background(51); //A nice shade of gray for the background

    //Loops through the matrix and draws the snake while also setting the valid spots as snake
    for (var i = 0; i < dx; i++) {
        for (var j = 0; j < dy; j++) {
            if (matrix[i][j].v >= snake.Tailcount) {
                matrix[i][j].s = true; //this spot is a snake
                matrix[i][j].show(color(255));

            }
        }
    }
    snake.Headcount += 1;
    snake.Tailcount += 1

    //updates the snake position based on the velocity which is determined by the algo
    snake.xPos += snake.vel * snake.xVel;
    snake.yPos += snake.vel * snake.yVel;

    //Boundary Collision
    if (((0 > snake.xPos) || (snake.xPos) > dx - 1) || ((0 > snake.yPos) || (snake.yPos > dy - 1))) { //if snake hits outside wall
        reset()
    }



    if (matrix[snake.xPos][snake.yPos].v < snake.Tailcount) { //checks to make sure the value that we are about to set is less than tailcount, if it is not then the head is about to hit the body
        matrix[snake.xPos][snake.yPos].v = snake.Headcount;
    } else {
        //So we have hit the body, call the food function to reset the food, then the reset to reset all the snake values
        matrix[randX][randY].f = false;
        food();
        reset();


    }


    //Snake eats food
    if ((randX === snake.xPos) & (randY === snake.yPos)) {
        matrix[randX][randY].f = false;
        food();
    }

    //draw food, red
    fill(255, 0, 0)
    rect(randX * size, randY * size, size, size)

    if (Computer) {
        //start and end point for A*
        start = matrix[snake.xPos][snake.yPos];
        end = matrix[randX][randY];



        //EAch time this function is called it requires two empty arrays to be fed to it. Without this it throws an error.
        emptyList1 = [];
        emptyList2 = [];
        path2 = aStar(start, end, emptyList1, emptyList2)

        //The returned path is the series of moves from where the snake is now to the food, however all I require is the next move for the snake
        var CompMove = path2[path2.length - 2];


        var Snakehead = matrix[snake.xPos][snake.yPos] //where is the snakehead now

        //below finds the direction of the next move and gives that instruction to the snake
        if (CompMove.i - Snakehead.i == 1) {
            snake.xVel = 1;
            snake.yVel = 0;

        } else if (CompMove.i - Snakehead.i == -1) {
            snake.xVel = -1;
            snake.yVel = 0;

        } else if (CompMove.j - Snakehead.j == 1) {
            snake.xVel = 0;
            snake.yVel = 1;

        } else if (CompMove.j - Snakehead.j == -1) {
            snake.xVel = 0;
            snake.yVel = -1;

        } else {
            snake.vel = 0;
        }

    }
    //This is a reset for the values associated with A* as then will need to be recalculated next interation
    for (var i = 0; i < dx; i++) {
        for (var j = 0; j < dy; j++) {
            matrix[i][j].fval = 0;
            matrix[i][j].g = 0;
            matrix[i][j].h = 0;
            matrix[i][j].previous = undefined;
            matrix[i][j].s = false;
        }
    }


}
