# Snake-with-A-star
A version of the classic game snake in JavaScript with p5.js ad uses the A-star algorithm to control the snake. This was my first Javascript project so there are probably a few redundancies and ineffiencient methods in the code. 

The basic idea behind my version of the classic game snake is the snake object has properties Headcount and Tailcount, when the snake head passes over a spot it passes on its headcount value to the spot. Tailcount is the headcount minus the length of the snake. Then if a spot has a value greater than the tailcount it is considered the snake for drawing and colision purposes

