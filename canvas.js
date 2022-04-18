//images
const landFloating = document.getElementById('land-floating');
const landFloor = document.getElementById('land-floor');
const sky = document.getElementById('sky');
const landBg = document.getElementById('landBg');
const cloud = document.getElementById('cloud');
const sun = document.getElementById('sun');
const landPlatform = document.getElementById('land-platform');
const cave = document.getElementById('cave');
const brickPlatform= document.getElementById('brick-platform');
//player sprite
const spriteStandRight = document.getElementById('stand-right');
const spriteStandLeft = document.getElementById('stand-left');
const spriteWalkRight =document.getElementById('walk-right');
const spriteWalkLeft = document.getElementById('walk-left');
const spriteJumpRight = document.getElementById('jump-right');
const spriteJumpLeft = document.getElementById('jump-left');
//enemy sprite
const enemyGreen = document.getElementById('enemy-green');
const enemyOrange = document.getElementById('enemy-orange');

const canvas = document.querySelector('canvas');
const c  = canvas.getContext('2d');

canvas.height = 576;
canvas.width = 1024;


//  Variables
const gravity = .65;
//const dashTimer = 500;
const leftCorner = 100;
const rightCorner = 400;
const aceleration = .7;
//let dashSpeed = 0;
const winingPoint = 46500;
const cavePosition = 900;
let jumpCount = 0;
let jumpEnable = true;
const jumpPower = 9.8;
const playerSpeed = 7
let enemyJumpPower;
const floorPositionY = canvas.height-landFloor.height;

// player class
class Player{
    constructor(){
        this.position={
            x:120,
            y:300
        }
        this.width = 25;
        this.height = 42;
        this.direction = {
            right: true,
            left: false
        }
        this.velocity = {
            x:0,
            y:0
        }
        this.speed = playerSpeed;
        //this.dashEnable = true;
        this.image = spriteStandRight;
        this.frames = 0;
        this.sprites= {
            stand:{
                right: spriteStandRight,
                left: spriteStandLeft,
                spriteWidth: spriteStandLeft.width
            },
            walk:{
                right: spriteWalkRight,
                left: spriteWalkLeft
            },
            jump:{
                right: spriteJumpRight,
                left: spriteJumpLeft
            }
        }
        this.currentSprite = spriteStandRight;
    }
    draw(){
        c.drawImage(this.currentSprite,
                    25* this.frames,
                    0,
                    25,
                    42,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height)
    }
    update(){
        this.frames++;
        if(this.frames > 13 && (this.currentSprite === spriteStandRight
            || this.currentSprite === spriteStandLeft ||
            this.currentSprite === spriteWalkRight || this.currentSprite === spriteWalkLeft)){
                this.frames =0;
            }else if(this.frames > 7 && (this.currentSprite === spriteJumpLeft ||
                    this.currentSprite === spriteJumpRight)) this.frames = 0;

        this.draw()
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        if(this.position.y + this.height+
            this.velocity.y <= canvas.height){
            this.velocity.y += gravity;
        }
    }
}

//enemy class
class Enemy{
    constructor({x,y,speed,image,maxframes,range,jumpPower=8,jumpRange = 90}){
        this.position = {
            x:x,
            y:y
        };
        this.initPosition = {
            x:x,
            y:y
        }
        this.speed = speed;
        this.sprite = image;
        this.spriteHeight = image.height;
        this.spriteWidth = image.width/maxframes;
        this.maxframes = maxframes;
        this.frameCount = 0;
        this.initRange = range;
        this.actualRange = range;
        this.jumpPower = jumpPower;
        this.jumpRange = jumpRange;
    }
    draw(){
        c.drawImage(this.sprite,
                    this.spriteWidth * this.frameCount,
                    0,
                    this.spriteWidth,
                    this.spriteHeight,
                    this.position.x,
                    this.position.y,
                    this.spriteWidth,
                    this.spriteHeight)
    }
    update(){
        this.frameCount ++;
        if(this.frameCount >= this.maxframes) this.frameCount = 0;
        this.position.x += this.speed;
        this.actualRange -=this.speed;
        if(this.actualRange < 0 || this.actualRange>this.initRange) this.speed *= -1;
        this.draw();
    }
    jumpPlayerInteraction(range,player){
        let distance = Math.abs(player.position.x - this.position.x);
        if(distance < 100){
            this.position.y -= this.jumpPower;
            this.jumpRange -= this.jumpPower;
            if(this.jumpRange <= 0 ||this.jumpRange>range || this.position.y>=floorPositionY - 20){ 
                this.jumpPower*=-1;
            };
        }else {
            this.position.y = this.initPosition.y
            this.jumpRange = range};
    }
}

// platform class
class Platform{
    constructor({x,y,image,hasMovement = false,direction=undefined,speed=0,range=0}){
        this.position = {
            x,
            y
        }
        this.image = image;
        this.width = image.width;
        this.height = image.height;
        this.hasMovement =  hasMovement;
        this.movement = {
            x:null,
            y:null,
            direction,
            speed,
            range
        }
        this.initRange = range
    }
    draw(){
        c.drawImage(this.image,this.position.x,this.position.y)
    }
    update(){
        const axis = this.movement.direction;
        if(axis == 'y'){
             this.position.y += this.movement.speed;
        }else if(axis === 'x'){
            this.position.x +=this.movement.speed
        }
        this.movement.range -= this.movement.speed;
        if(this.movement.range <= 0 || Math.abs(this.movement.range) >= this.initRange){
            this.movement.speed *= -1;
        }
    }

}

// Generic Scene object class
class SceneObject{
    constructor({x,y,image}){
        this.position = {
            x,
            y
        }
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }
    draw(){
        c.drawImage(this.image,this.position.x,this.position.y)
    }    
}

// implementation
let player = new Player();
let platforms =   [];
let enemies = [];
let sceneObjects=[];
const keys = {
    right:{
        pressed: false,
    },
    left:{
        pressed: false,
    }
}
let lastKey

//reset values
function init(){
    player = new Player();
    enemies =   [new Enemy({x:400,y:floorPositionY-20,speed:1,image:enemyGreen,maxframes:12,range:120}),
                new Enemy({x:600,y:floorPositionY-20,speed:.5,image:enemyGreen,maxframes:12,range:120}),
                new Enemy({x:landFloor.width*3.5,y:floorPositionY-20,speed:1,image:enemyGreen,maxframes:12,range:120}),
                new Enemy({x:2100,y:230-20,speed:2,image:enemyGreen,maxframes:12,range:140}),
                new Enemy({x:landFloor.width*7.3,y:floorPositionY-20,speed:1,image:enemyGreen,maxframes:12,range:120}),
                new Enemy({x:landFloor.width*6.3,y:floorPositionY-25,speed:3.5,image:enemyOrange,maxframes:28,range:220,jumpPower:15})];
    platforms =   [new Platform({x:400,y:300,image:landFloating}),
                        new Platform({x:700,y:200,image:landFloating}),
                        new Platform({x:2100,y:230,image:landFloating}),
                        new Platform({x:1800,y:floorPositionY - landPlatform.height + 3,image:landPlatform}),
                        new Platform({x:0,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*2.5,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*3.5,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*4.8,y:150,image:brickPlatform,hasMovement:true,direction:'y',speed:0.5,range:120}),
                        new Platform({x:landFloor.width*5.7,y:250,image:brickPlatform,hasMovement:true,direction:'y',speed:0.6,range:120}),
                        new Platform({x:landFloor.width*6.3,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*7.3,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*8.3 -cave.width*1.5,y:floorPositionY-cave.height+18,image:cave})];
     sceneObjects=[new SceneObject({x:0,y:0,image:sky}),
                        new SceneObject({x:480,y:0,image:sun}),
                        new SceneObject({x:430,y:110,image:cloud}),
                        new SceneObject({x:830,y:120,image:cloud}),
                        new SceneObject({x:0,y:0,image:landBg}),
                        new SceneObject({x:700,y:40,image:cloud})];

    scrollOffset = 0;
    //dashSpeed = 0;
    jumpCount = 0;
    jumpEnable = true;
}



function animate(){
    c.fillStyle = 'white';
    c.fillRect(0,0,canvas.width,canvas.height);
    requestAnimationFrame(animate);
    sceneObjects.forEach(object=>{
        object.draw();
    })
    platforms.forEach(platform =>{
        platform.draw();
        if(platform.hasMovement){
            platform.update();
        }
    })
    const cloudObject = sceneObjects[5];
    cloudObject.position.x -=1;
    if(cloudObject.position.x <= -1000 - cloudObject.width){
        cloudObject.position.x = player.position.x + 500;
        cloudObject.position.y +=( Math.random()-0.5) * 100
    }
    player.update();
    enemies.forEach(enemy =>{
        enemy.update();
        if(enemy.sprite === enemyGreen)enemy.jumpPlayerInteraction(90,player)
        else if(enemy.sprite === enemyOrange) {
            enemy.jumpPlayerInteraction(110,player)
        };
    })

        if((keys.right.pressed && player.position.x < rightCorner
            ||(keys.right.pressed && scrollOffset >=winingPoint && player.position.x < cavePosition))){
            player.velocity.x = player.speed;
            player.direction.right = true;
            player.direction.left = false;
        }else
        if(keys.left.pressed && player.position.x > leftCorner
            ||( keys.left.pressed && scrollOffset === 0 && player.position.x >leftCorner)){
            player.velocity.x = -player.speed;
            player.direction.right = false;
            player.direction.left = true;
        }else{
            player.velocity.x = 0;
            if(keys.right.pressed && scrollOffset<winingPoint){
                platforms.forEach(platform =>{
                    scrollOffset += player.speed;
                    platform.position.x -= player.speed;
                })
                sceneObjects.forEach(object=>{
                    if(object.image === sun){
                        object.position.x -= player.speed * .18;
                }else if(object === sceneObjects[2] || object === sceneObjects[3]){
                        object.position.x -= player.speed * .28;
                } else object.position.x -=player.speed * .66;
                })
                enemies.forEach(enemy=>{
                    enemy.position.x -=player.speed;
                })

            }else if(keys.left.pressed && scrollOffset > 0){
                platforms.forEach(platform =>{
                    scrollOffset -= player.speed;
                    platform.position.x += player.speed;
                })
                sceneObjects.forEach(object=>{
                    if(object.image === sun){
                        object.position.x += player.speed * .18;
                    }else if(object === sceneObjects[2] || object === sceneObjects[3]){
                        object.position.x += player.speed *.28;
                }else object.position.x += player.speed * .66;
                });
                enemies.forEach(enemy=>{
                    enemy.position.x +=player.speed;
                })
        }}
        if(player.position.y < - 400){
            init();
        }
        //platform colision 
        platforms.forEach(platform =>{
            if(player.position.y + player.height <= platform.position.y+10
                && player.position.y + player.height + player.velocity.y >= platform.position.y+5
                && player.position.x + player.width >= platform.position.x
                && player.position.x <= platform.position.x + platform.width){
                player.velocity.y = 0;
                jumpCount = 0;
                if(platform.hasMovement){
                    player.velocity.y += platform.movement.speed;
               }
            }
        })

        //sprite switching 
        if( keys.right.pressed && lastKey === 'right' 
            && player.currentSprite !== player.sprites.walk.right){
            player.frames = 1;
            player.currentSprite = player.sprites.walk.right;
        }else if(keys.left.pressed && lastKey === 'left' 
                && player.currentSprite !== player.sprites.walk.left){
            player.frames = 1;
            player.currentSprite = player.sprites.walk.left;
        }else if( !keys.right.pressed && lastKey === 'right' 
            && player.currentSprite !== player.sprites.stand.right){
            player.frames = 1;
            player.currentSprite = player.sprites.stand.right;
        }else if(!keys.left.pressed && lastKey === 'left' 
                && player.currentSprite !== player.sprites.stand.left){
            player.frames = 1;
            player.currentSprite = player.sprites.stand.left;
        }
    // dash hability - NOT WORKING PROPERLY
    /*
    let maxDashSpeed = 0.2;
        addEventListener('keydown',({key})=>{
            if(key === ' '){
                if(player.dashEnable){
                    if(player.direction.right){
                        platforms.forEach(platform =>{
                            scrollOffset += dashSpeed;
                            platform.position.x -= dashSpeed;
                    })
                        sceneObjects.forEach(object=>{
                            if(object.image === sun){
                                object.position.x -= dashSpeed*.18;
                            }else if(object === sceneObjects[2] || object === sceneObjects[3]){
                                object.position.x -= dashSpeed * .28;
                        }else{ object.position.x -= dashSpeed*.66;
                        }
                    })           
                    }else if(player.direction.left){
                        platforms.forEach(platform =>{
                            scrollOffset -= dashSpeed;
                            platform.position.x += dashSpeed;
                        })
                        sceneObjects.forEach(object=>{
                            if(object.image === sun){
                                object.position.x += dashSpeed*.18;
                            }else if(object === sceneObjects[2] || object === sceneObjects[3]){
                                object.position.x += dashSpeed * .28;
                        }else object.position.x += dashSpeed*.66;
                        })
                    }
                    dashSpeed+=0.006;
                    console.log(dashSpeed)
                    if(dashSpeed >= maxDashSpeed){
                    dashSpeed = 0;
                }
            }
            }
        })
        addEventListener('keyup',({key})=>{
            if(key === ' '){
                setTimeout(()=>{
                    player.dashEnable = true;
                    dashSpeed = 0;
                },dashTimer);
            }
        });
    */
    //win condition
    if(scrollOffset > winingPoint){
        console.log('you win');
    }

    //lose condition
    if(player.position.y > canvas.height + player.height){
        init();
    }
    enemies.forEach(enemy =>{
        if(player.position.x >= enemy.position.x -15 && player.position.x <= enemy.position.x+enemy.spriteWidth
            && player.position.y-15<= enemy.position.y&& player.position.y >= enemy.position.y-25){
            init();
        }
    })

}

// eventListeners

addEventListener('DOMContentLoaded',()=>{
    init();
    animate();
})

addEventListener('keydown',({ key })=>{
    switch(key){
        case "a":
            keys.left.pressed = true;
            lastKey = 'left';
            break
        case "s":
            break 
        case "d":
            keys.right.pressed = true;
            lastKey = 'right';
            break
        case "w":
            if(jumpEnable && jumpCount <2){
            player.velocity.y -=jumpPower;//9.65 salto muy dificil a ladrillos (sin movimientos)
            jumpCount ++;
            }

            if(player.currentSprite === player.sprites.stand.right
                || player.currentSprite === player.sprites.walk.right){
                    player.currentSprite = player.sprites.jump.right;
                }else if(player.currentSprite === player.sprites.stand.left
                        || player.currentSprite === player.sprites.walk.left){
                            player.currentSprite = player.sprites.jump.left;
                }
            break
    }
})

addEventListener('keyup',({key})=>{
    switch(key){
        case "a":
            keys.left.pressed = false;
            break
        case 's':
            break 
        case 'd':
            keys.right.pressed = false;
            break
        case 'w':
            if(jumpCount >=2){
                jumpEnable = false;
                jumpCount=0;
            }
            if(!jumpEnable){
                setTimeout(()=>{
                    jumpEnable = true;
                },500);
            }
            player.velocity.y += 0;
            if(player.currentSprite === player.sprites.jump.left){
                player.currentSprite = player.sprites.stand.left;
            }else if(player.currentSprite === player.sprites.jump.right){
                player.currentSprite = player.sprites.stand.right;
            }
            break
    }
})

function distanceBetween(playerPosition, enemyPosition) {
    return Math.abs(playerPosition - enemyPosition);
}