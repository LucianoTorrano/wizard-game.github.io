const canvas = document.querySelector('canvas');
const c  = canvas.getContext('2d');


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
//sprite
const spriteStandRight = document.getElementById('stand-right');
const spriteStandLeft = document.getElementById('stand-left');
const spriteWalkRight =document.getElementById('walk-right');
const spriteWalkLeft = document.getElementById('walk-left');
const spriteJumpRight = document.getElementById('jump-right');
const spriteJumpLeft = document.getElementById('jump-left');

canvas.height = 576;
canvas.width = 1024;


//  Variables
const gravity = .7;
const dashTimer = 500;
const leftCorner = 100;
const rightCorner = 400;
const aceleration = .7;
//let dashSpeed = 0;
const winingPoint = 46500;
const cavePosition = 900;


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
        this.speed = 10;
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

// platform class
class Platform{
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
const floorPositionY = canvas.height-landFloor.height;
let player = new Player();
let platforms =   [];
let sceneObjects=[];
const keys = {
    right:{
        pressed: false,
    },
    left:{
        pressed: false,
    },
}
let lastKey

//reset values
function init(){
    player = new Player();
    platforms =   [new Platform({x:400,y:300,image:landFloating}),
                        new Platform({x:700,y:200,image:landFloating}),
                        new Platform({x:2100,y:230,image:landFloating}),
                        new Platform({x:1800,y:floorPositionY - landPlatform.height + 3,image:landPlatform}),
                        new Platform({x:0,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*2.5,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*3.5,y:floorPositionY,image:landFloor}),
                        new Platform({x:landFloor.width*4.8,y:150,image:brickPlatform}),
                        new Platform({x:landFloor.width*5.7,y:200,image:brickPlatform}),
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
    })
    const cloudObject = sceneObjects[5];
    cloudObject.position.x -=1;
    if(cloudObject.position.x <= -1000 - cloudObject.width){
        cloudObject.position.x = player.position.x + 500;
        cloudObject.position.y +=( Math.random()-0.5) * 100
    }
    player.update();

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
                })
        }}
        if(player.position.y < -200){
            init();
        }

        //platform colision 
        platforms.forEach(platform =>{
            if(player.position.y + player.height <= platform.position.y+5
                && player.position.y + player.height + player.velocity.y >= platform.position.y +5
                && player.position.x + player.width >= platform.position.x
                && player.position.x <= platform.position.x + platform.width){
                player.velocity.y = 0;
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
}
init();
animate();

// eventListeners


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
            player.velocity.y -=15;
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
            player.velocity.y += 0;
            if(player.currentSprite === player.sprites.jump.left){
                player.currentSprite = player.sprites.stand.left;
            }else if(player.currentSprite === player.sprites.jump.right){
                player.currentSprite = player.sprites.stand.right;
            }
            break
    }
})