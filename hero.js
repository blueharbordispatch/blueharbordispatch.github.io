(() => {

"use strict";


// ===============================
// HERO SETUP
// ===============================

const hero = document.querySelector(".hero");

if (!hero) return;



const canvas = document.createElement("canvas");

canvas.classList.add("hero-canvas");

canvas.setAttribute(
    "aria-hidden",
    "true"
);

hero.appendChild(canvas);



const ctx = canvas.getContext("2d");

if (!ctx) return;




// ===============================
// CANVAS
// ===============================

let width = 0;

let height = 0;



function resizeCanvas() {

    width = canvas.width =
        hero.offsetWidth;


    height = canvas.height =
        hero.offsetHeight;

}



resizeCanvas();




// ===============================
// ENGINE SETTINGS
// ===============================

const settings = {

    particleCount: 70,

    connectionDistance: 140,

    mouseRadius: 180,

    particleSpeed: 0.25,

    scrollStrength: 0.15

};




// ===============================
// MOUSE CONTROL
// ===============================

const mouse = {

    x: 0,

    y: 0,

    targetX: 0,

    targetY: 0,

    radius: settings.mouseRadius

};



hero.addEventListener(
    "mousemove",
    (event) => {


        const rect =
            hero.getBoundingClientRect();



        mouse.targetX =
            event.clientX -
            rect.left;



        mouse.targetY =
            event.clientY -
            rect.top;


    }
);



hero.addEventListener(
    "mouseleave",
    () => {


        mouse.targetX =
            width / 2;


        mouse.targetY =
            height / 2;


    }
);




// ===============================
// MOUSE + SCROLL UPDATE
// ===============================

let scrollOffset = 0;



function updateMouse() {


    mouse.x +=
        (
            mouse.targetX -
            mouse.x
        ) * 0.08;



    mouse.y +=
        (
            mouse.targetY -
            mouse.y
        ) * 0.08;


}



window.addEventListener(
    "scroll",
    () => {


        const rect =
            hero.getBoundingClientRect();



        scrollOffset =
            (
                window.innerHeight -
                rect.top
            )
            *
            settings.scrollStrength;


    },
    {
        passive: true
    }
);




// ===============================
// PARTICLE SYSTEM
// ===============================

const particles = [];



class Particle {


    constructor(){

        this.reset();

    }



    reset(){


        this.x =
            Math.random() *
            width;



        this.y =
            Math.random() *
            height;



        this.size =
            Math.random() *
            2 +
            0.8;



        this.speedX =
            (
                Math.random() -
                0.5
            )
            *
            settings.particleSpeed;



        this.speedY =
            (
                Math.random() -
                0.5
            )
            *
            settings.particleSpeed;



        this.opacity =
            Math.random()
            *
            0.6
            +
            0.2;



        this.depth =
            Math.random()
            *
            0.8
            +
            0.2;



        this.scrollY = 0;


    }




    update(){


        this.x +=
            this.speedX;



        this.y +=
            this.speedY;



        if(
            this.x < -50
        ){

            this.x =
                width + 50;

        }



        if(
            this.x > width + 50
        ){

            this.x =
                -50;

        }



        if(
            this.y < -50
        ){

            this.y =
                height + 50;

        }



        if(
            this.y > height + 50
        ){

            this.y =
                -50;

        }




        const dx =
            mouse.x -
            this.x;



        const dy =
            mouse.y -
            this.y;



        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );




        if(
            distance <
            mouse.radius
        ){


            const force =
                (
                    mouse.radius -
                    distance
                )
                /
                mouse.radius;



            this.x -=
                dx *
                force *
                0.015 *
                this.depth;



            this.y -=
                dy *
                force *
                0.015 *
                this.depth;


        }




        this.scrollY =
            scrollOffset *
            0.0005 *
            this.depth;


    }




    draw(){


        ctx.beginPath();



        ctx.arc(
            this.x,
            this.y + this.scrollY,
            this.size,
            0,
            Math.PI * 2
        );



        ctx.fillStyle =
            `rgba(100,180,255,${this.opacity})`;



        ctx.fill();


    }


}




function createParticles(){


    particles.length = 0;



    for(
        let i = 0;
        i < settings.particleCount;
        i++
    ){


        particles.push(
            new Particle()
        );


    }


}



createParticles();




// ===============================
// CONNECTION NETWORK
// ===============================

function drawConnections(){


    for(
        let i = 0;
        i < particles.length;
        i++
    ){


        for(
            let j = i + 1;
            j < particles.length;
            j++
        ){


            const p1 =
                particles[i];


            const p2 =
                particles[j];



            const dx =
                p1.x -
                p2.x;



            const dy =
                p1.y -
                p2.y;



            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );



            if(
                distance <
                settings.connectionDistance
            ){


                const opacity =
                    1 -
                    (
                        distance /
                        settings.connectionDistance
                    );



                ctx.beginPath();



                ctx.moveTo(
                    p1.x,
                    p1.y
                );



                ctx.lineTo(
                    p2.x,
                    p2.y
                );



                ctx.strokeStyle =
                    `rgba(80,150,255,${opacity * 0.18})`;



                ctx.lineWidth =
                    0.7;



                ctx.stroke();


            }


        }


    }


}




// ===============================
// MOUSE GLOW
// ===============================

function drawMouseGlow(){


    const gradient =
        ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            mouse.radius
        );



    gradient.addColorStop(
        0,
        "rgba(80,170,255,0.16)"
    );



    gradient.addColorStop(
        1,
        "rgba(80,170,255,0)"
    );



    ctx.fillStyle =
        gradient;



    ctx.beginPath();



    ctx.arc(
        mouse.x,
        mouse.y,
        mouse.radius,
        0,
        Math.PI * 2
    );



    ctx.fill();


}




// ===============================
// LOGISTICS ROUTES
// ===============================

const routes = [];



function createRoutes(){


    routes.length = 0;



    for(
        let i = 0;
        i < 6;
        i++
    ){


        routes.push({

            x:
                Math.random() *
                width,


            y:
                Math.random() *
                height,


            length:
                Math.random() *
                180 +
                80,


            speed:
                Math.random() *
                0.3 +
                0.15

        });


    }


}



createRoutes();



function drawRoutes(){


    routes.forEach(
        route => {


            route.x +=
                route.speed;



            if(
                route.x >
                width + 200
            ){

                route.x =
                    -route.length;

            }



            ctx.beginPath();



            ctx.moveTo(
                route.x,
                route.y
            );



            ctx.lineTo(
                route.x +
                route.length,
                route.y
            );



            ctx.strokeStyle =
                "rgba(90,170,255,0.08)";



            ctx.lineWidth =
                2;



            ctx.stroke();


        }
    );


}

// ===============================
// DEPTH PARALLAX
// ===============================

let heroOffsetX = 0;

let heroOffsetY = 0;



function updateParallax(){


    const moveX =
        (
            mouse.x -
            width / 2
        )
        *
        0.008;



    const moveY =
        (
            mouse.y -
            height / 2
        )
        *
        0.008;



    heroOffsetX +=
        (
            moveX -
            heroOffsetX
        )
        *
        0.05;



    heroOffsetY +=
        (
            moveY -
            heroOffsetY
        )
        *
        0.05;


}




// ===============================
// FLOATING GLASS OBJECTS
// ===============================

const floatingObjects = [];



class FloatingObject {


    constructor(){

        this.reset();

    }



    reset(){


        this.x =
            Math.random() *
            width;


        this.y =
            Math.random() *
            height;


        this.size =
            Math.random() *
            35 +
            20;


        this.speed =
            Math.random() *
            0.3 +
            0.1;


        this.rotation =
            Math.random() *
            Math.PI *
            2;



        this.rotationSpeed =
            (
                Math.random() -
                0.5
            )
            *
            0.002;



        this.depth =
            Math.random() *
            0.8 +
            0.2;



        this.opacity =
            Math.random() *
            0.08 +
            0.04;



        this.floatOffset =
            Math.random() *
            Math.PI *
            2;


    }



    update(){


        this.y -=
            this.speed *
            this.depth;



        this.x +=
            Math.sin(
                performance.now() *
                0.001 +
                this.floatOffset
            )
            *
            0.15;



        this.rotation +=
            this.rotationSpeed;




        if(
            this.y <
            -100
        ){

            this.reset();

            this.y =
                height + 100;

        }





        const dx =
            mouse.x -
            this.x;



        const dy =
            mouse.y -
            this.y;



        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );



        if(
            distance <
            mouse.radius
        ){


            const force =
                (
                    mouse.radius -
                    distance
                )
                /
                mouse.radius;



            this.x -=
                dx *
                force *
                0.004 *
                this.depth;



            this.y -=
                dy *
                force *
                0.004 *
                this.depth;


        }


    }




    draw(){


        ctx.save();



        ctx.translate(
            this.x,
            this.y
        );



        ctx.rotate(
            this.rotation
        );



        ctx.beginPath();



        if(
            ctx.roundRect
        ){

            ctx.roundRect(
                -this.size / 2,
                -this.size / 2,
                this.size,
                this.size,
                8
            );

        }
        else{

            ctx.rect(
                -this.size / 2,
                -this.size / 2,
                this.size,
                this.size
            );

        }




        ctx.fillStyle =
            `rgba(90,160,255,${this.opacity})`;



        ctx.fill();



        ctx.restore();


    }


}




function createFloatingObjects(){


    floatingObjects.length = 0;



    for(
        let i = 0;
        i < 14;
        i++
    ){

        floatingObjects.push(
            new FloatingObject()
        );

    }


}




createFloatingObjects();





function drawFloatingObjects(){


    floatingObjects.forEach(
        object => {


            object.update();


            object.draw();


        }
    );


}





// ===============================
// FREIGHT DATA STREAMS
// ===============================

const dataStreams = [];



class DataStream {


    constructor(){

        this.reset();

    }



    reset(){


        this.x =
            -200;


        this.y =
            Math.random() *
            height;



        this.length =
            Math.random() *
            120 +
            60;



        this.speed =
            Math.random() *
            1.2 +
            0.5;



        this.opacity =
            Math.random() *
            0.15 +
            0.05;



        this.width =
            Math.random() *
            2 +
            1;


    }




    update(){


        this.x +=
            this.speed;



        if(
            this.x >
            width + 200
        ){

            this.reset();

        }


    }




    draw(){


        const gradient =
            ctx.createLinearGradient(
                this.x,
                this.y,
                this.x +
                this.length,
                this.y
            );



        gradient.addColorStop(
            0,
            "rgba(70,160,255,0)"
        );



        gradient.addColorStop(
            0.5,
            `rgba(70,160,255,${this.opacity})`
        );



        gradient.addColorStop(
            1,
            "rgba(70,160,255,0)"
        );



        ctx.beginPath();



        ctx.moveTo(
            this.x,
            this.y
        );



        ctx.lineTo(
            this.x +
            this.length,
            this.y
        );



        ctx.strokeStyle =
            gradient;



        ctx.lineWidth =
            this.width;



        ctx.stroke();


    }


}




function createDataStreams(){


    dataStreams.length = 0;



    for(
        let i = 0;
        i < 18;
        i++
    ){

        dataStreams.push(
            new DataStream()
        );

    }


}




createDataStreams();





function drawDataStreams(){


    dataStreams.forEach(
        stream => {


            stream.update();


            stream.draw();


        }
    );


}

// ===============================
// ROUTE PULSES
// ===============================

const pulses = [];



class RoutePulse {


    constructor(){

        this.reset();

    }



    reset(){

        this.x =
            Math.random() * width;


        this.y =
            Math.random() * height;


        this.radius = 2;


        this.maxRadius =
            Math.random() * 40 + 25;


        this.speed =
            Math.random() * 0.25 + 0.15;


        this.opacity = 0.5;

    }



    update(){

        this.radius +=
            this.speed;



        this.opacity =
            1 -
            (
                this.radius /
                this.maxRadius
            );



        if(
            this.radius >
            this.maxRadius
        ){

            this.reset();

        }

    }



    draw(){

        ctx.beginPath();



        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );



        ctx.strokeStyle =
            `rgba(80,170,255,${this.opacity * 0.25})`;



        ctx.lineWidth = 1;



        ctx.stroke();

    }


}




function createPulses(){


    pulses.length = 0;



    for(
        let i = 0;
        i < 20;
        i++
    ){

        pulses.push(
            new RoutePulse()
        );

    }


}




function drawPulses(){


    pulses.forEach(
        pulse => {


            pulse.update();


            pulse.draw();


        }
    );


}






// ===============================
// MAGNETIC HERO INTERACTION
// ===============================

const heroButtons =
    document.querySelectorAll(
        ".hero a, .hero button"
    );



heroButtons.forEach(
    button => {


        button.addEventListener(
            "mousemove",
            event => {


                const rect =
                    button.getBoundingClientRect();



                const x =
                    event.clientX -
                    rect.left -
                    rect.width / 2;



                const y =
                    event.clientY -
                    rect.top -
                    rect.height / 2;



                button.style.transform =
                    `
                    translate3d(
                        ${x * 0.12}px,
                        ${y * 0.12}px,
                        0
                    )
                    `;


            }
        );



        button.addEventListener(
            "mouseleave",
            () => {


                button.style.transform =
                    "translate3d(0,0,0)";


            }
        );


    }
);






// ===============================
// HERO CONTENT PARALLAX
// ===============================

const heroContent =
    document.querySelector(
        ".hero-content"
    );



if(heroContent){


    hero.addEventListener(
        "mousemove",
        () => {


            const moveX =
                (
                    mouse.x -
                    width / 2
                )
                *
                0.01;



            const moveY =
                (
                    mouse.y -
                    height / 2
                )
                *
                0.01;



            heroContent.style.transform =
                `
                translate3d(
                    ${moveX}px,
                    ${moveY}px,
                    0
                )
                `;


        }
    );



    hero.addEventListener(
        "mouseleave",
        () => {


            heroContent.style.transform =
                "translate3d(0,0,0)";


        }
    );


}





// ===============================
// SCROLL DEPTH
// ===============================

let scrollProgress = 0;



function updateScrollDepth(){


    const heroRect =
        hero.getBoundingClientRect();



    scrollProgress =
        Math.min(
            Math.max(
                (
                    window.innerHeight -
                    heroRect.top
                )
                /
                hero.offsetHeight,
                0
            ),
            1
        );


}




window.addEventListener(
    "scroll",
    updateScrollDepth,
    {
        passive:true
    }
);






// ===============================
// PERFORMANCE SETTINGS
// ===============================

const isMobile =
    window.innerWidth < 768;



if(isMobile){


    settings.particleCount = 35;


    settings.connectionDistance = 90;


    settings.mouseRadius = 120;


}




const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;



if(reducedMotion){


    settings.particleCount = 15;


    settings.particleSpeed = 0.05;


}
// ===============================
// CANVAS OPTIMIZATION
// ===============================

function optimizeCanvas(){


    const pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );



    canvas.width =
        width *
        pixelRatio;



    canvas.height =
        height *
        pixelRatio;



    canvas.style.width =
        width + "px";



    canvas.style.height =
        height + "px";



    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


}






// ===============================
// CANVAS LAYERING
// ===============================

canvas.style.position =
    "absolute";


canvas.style.inset =
    "0";


canvas.style.width =
    "100%";


canvas.style.height =
    "100%";


canvas.style.pointerEvents =
    "none";


canvas.style.zIndex =
    "1";



hero.style.position =
    "relative";



if(heroContent){


    heroContent.style.position =
        "relative";


    heroContent.style.zIndex =
        "3";


}





// ===============================
// AMBIENT LIGHT ATMOSPHERE
// ===============================

const ambientLights = [];



class AmbientLight{


    constructor(){


        this.x =
            Math.random() * width;


        this.y =
            Math.random() * height;


        this.size =
            Math.random() * 250 + 150;


        this.speed =
            Math.random() * 0.15 + 0.05;


        this.opacity =
            Math.random() * 0.05 + 0.02;


    }



    update(){


        this.x +=
            this.speed;



        if(
            this.x >
            width + this.size
        ){

            this.x =
                -this.size;

        }


    }




    draw(){


        const glow =
            ctx.createRadialGradient(
                this.x,
                this.y,
                0,
                this.x,
                this.y,
                this.size
            );



        glow.addColorStop(
            0,
            `rgba(70,150,255,${this.opacity})`
        );



        glow.addColorStop(
            1,
            "rgba(70,150,255,0)"
        );



        ctx.fillStyle =
            glow;



        ctx.fillRect(
            0,
            0,
            width,
            height
        );


    }


}




function createAmbientLights(){


    ambientLights.length = 0;



    for(
        let i = 0;
        i < 4;
        i++
    ){

        ambientLights.push(
            new AmbientLight()
        );

    }


}




function drawAmbientLights(){


    ambientLights.forEach(
        light => {


            light.update();


            light.draw();


        }
    );


}






// ===============================
// ROUTE PARTICLES
// ===============================

const routeParticles = [];



class RouteParticle{


    constructor(){

        this.reset();

    }



    reset(){


        this.x =
            Math.random() * width;


        this.y =
            Math.random() * height;


        this.speed =
            Math.random() * 0.8 + 0.3;


        this.size =
            Math.random() * 2 + 1;


        this.opacity =
            Math.random() * 0.5 + 0.2;


        this.direction =
            Math.random() > 0.5
            ? 1
            : -1;


    }



    update(){


        this.x +=
            this.speed *
            this.direction;



        if(
            this.x > width + 20 ||
            this.x < -20
        ){

            this.reset();

        }


    }




    draw(){


        ctx.beginPath();



        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );



        ctx.fillStyle =
            `rgba(120,190,255,${this.opacity})`;



        ctx.fill();


    }


}




function createRouteParticles(){


    routeParticles.length = 0;



    for(
        let i = 0;
        i < 45;
        i++
    ){

        routeParticles.push(
            new RouteParticle()
        );

    }


}




function drawRouteParticles(){


    routeParticles.forEach(
        particle => {


            particle.update();


            particle.draw();


        }
    );


}






// ===============================
// FINAL RENDER LOOP
// ===============================

function render(){


    ctx.clearRect(
        0,
        0,
        width,
        height
    );



    updateMouse();


    updateParallax();



    ctx.save();



    ctx.translate(
        heroOffsetX,
        heroOffsetY -
        scrollOffset * 0.01
    );



    drawAmbientLights();


    drawRoutes();


    drawDataStreams();


    drawConnections();


    drawPulses();


    drawFloatingObjects();


    drawRouteParticles();



    particles.forEach(
        particle => {


            particle.update();


            particle.draw();


        }
    );



    ctx.restore();



    drawMouseGlow();



    requestAnimationFrame(
        render
    );


}






// ===============================
// CLEANUP
// ===============================

function cleanupHeroEngine(){


    particles.length = 0;


    floatingObjects.length = 0;


    dataStreams.length = 0;


    pulses.length = 0;


    routes.length = 0;


    routeParticles.length = 0;


    ambientLights.length = 0;


}






// ===============================
// ENGINE CONTROL
// ===============================

let engineStarted = false;



function startHeroEngine(){


    if(engineStarted)
        return;



    engineStarted = true;



    createParticles();

    createRoutes();

    createFloatingObjects();

    createDataStreams();

    createPulses();

    createAmbientLights();

    createRouteParticles();



    resizeCanvas();


    optimizeCanvas();



    requestAnimationFrame(
        render
    );


}




if(
    document.readyState === "loading"
){


    document.addEventListener(
        "DOMContentLoaded",
        startHeroEngine
    );


}
else{


    startHeroEngine();


}






// ===============================
// RESIZE HANDLER
// ===============================

let resizeTimeout;



window.addEventListener(
    "resize",
    () => {


        clearTimeout(
            resizeTimeout
        );



        resizeTimeout =
            setTimeout(
                () => {


                    resizeCanvas();


                    optimizeCanvas();


                    createParticles();


                    createRoutes();


                    createFloatingObjects();


                    createDataStreams();


                    createPulses();


                    createAmbientLights();


                    createRouteParticles();


                },
                250
            );


    }
);






// ===============================
// PUBLIC CONTROLS
// ===============================

window.BHDHero = {


    refresh(){


        resizeCanvas();


        optimizeCanvas();


        createParticles();


        createRoutes();


        createFloatingObjects();


        createDataStreams();


        createPulses();


        createAmbientLights();


        createRouteParticles();


    },



    destroy(){

        cleanupHeroEngine();

    }


};






document.addEventListener(
    "visibilitychange",
    () => {


        canvas.style.display =
            document.hidden
            ? "none"
            : "block";


    }
);






hero.classList.add(
    "bhd-hero-active"
);





})();