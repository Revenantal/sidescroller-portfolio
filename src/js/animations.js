import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


let globalDuration = 3;
let windowWidth = document.documentElement.clientWidth;
let windowHeight = document.documentElement.clientHeight;
let player = document.querySelector('.player');
let playerTL = null;
let masterTL = null;



export function animations() {
	masterTL = gsap.timeline({
		//yoyo: true,
		//repeat: -1,
		//repeatDelay: 1,
		ease: 'none',
		scrollTrigger: {
			scrub: 0.5,
			pin: '#app',
			end: '5000%',
			onUpdate: function(self) {
				onScrollUpdate(self)
			}
		}
	})

	initPlayer()
	window.addEventListener("scroll", onScroll)
	//window.addEventListener("scrollend", onScrollEnd)
	masterTL.addLabel('start')
	masterTL.add(overworldTL())
	masterTL.addLabel('sky-world-start')
	masterTL.add(skyworldTL())
	masterTL.addLabel('castle-world-start')
	masterTL.add(castleWorldTL())
	masterTL.addLabel('water-world-start')
	masterTL.add(waterWorldTL())
	masterTL.addLabel('end')


	let testTL = gsap.timeline({
		//yoyo: true,
		repeat: -1,
		//repeatDelay: 5,
		ease: 'none',
	})
	//testTL.add(masterTL.tweenFromTo(2, 5));
	//masterTL.pause()

	document.addEventListener('keyup', event => {
		if (event.code === 'Space') {
			testTL.paused( !testTL.paused() );
		}
	})


}

function overworldTL() {
	let tl = gsap.timeline({
		defaults: {
			duration: globalDuration,
			ease: 'linear'
		}
	});

	let overworld = document.querySelector('.overworld');
	
	let ground = overworld.querySelector('.ground');
	let cloudsElem = overworld.querySelector('.backgrounds > .clouds');
	let skyworld = document.querySelector('.skyworld')
	tl.to(ground, { x:() => windowWidth - ground.clientWidth })
	tl.fromTo(skyworld, { x:() => ground.clientWidth - windowWidth }, { x: 0 }, "0")

	overworld.querySelectorAll('.backgrounds > *').forEach((background) => {
		tl.add(parallaxBackground(background), "0");
	})

	return tl;	
}

function skyworldTL() {
	let tl = gsap.timeline({
		defaults: {
			duration: globalDuration,
			ease: 'linear'
		}
	});
	let skyworld = document.querySelector('.skyworld')
	let overworld = document.querySelector('.overworld')
	let frozenPlayer = skyworld.querySelector('.frozen-player')

	let scrollRatePerSecond = windowHeight / globalDuration;
	let skyWorldDuration = skyworld.clientHeight / scrollRatePerSecond;

	tl.addLabel('skyworld-show')
	tl.call(() => { playerIsOnLadder = false })
	tl.call(() => { playerIsOnLadder = true })
	tl.to(overworld, {y: windowHeight})
	tl.fromTo(skyworld, {
		y:() => window.scrollY - skyworld.clientHeight, 
	}, {
		y: 0,
		duration: skyWorldDuration
	}, '<')
	tl.add(snapshotPlayer(player, frozenPlayer))
	tl.addLabel('skyworld-done')
	return tl;
}

function castleWorldTL() {
	let tl = gsap.timeline({
		defaults: {
			duration: globalDuration,
			ease: 'linear'
		}
	});

	let skyworld = document.querySelector('.skyworld')
	let castleWorld = document.querySelector('.castleWorld')
	let frameSection = castleWorld.querySelector('.frame-section')
	let frame = frameSection.querySelector('.frame')
	let mainSection = castleWorld.querySelector('.main-section')
	let tankSection = castleWorld.querySelector('.tank-section')
	let waterWorld = document.querySelector('.waterWorld')

	let panSpeed = windowWidth / globalDuration;
	let mainSectionDuration = mainSection.clientWidth / panSpeed;
	let playerXDistanceToLeft =  player.getBoundingClientRect().x + player.clientWidth
	let playerXDistanceToRight =  windowWidth - player.getBoundingClientRect().x;
	let playerEntryDuration = globalDuration * (playerXDistanceToLeft / windowWidth);
	let playerExitDuration = globalDuration * (playerXDistanceToRight / windowWidth);

	tl.addLabel('castle-show')
	tl.to(skyworld, { scale: () => frame.clientWidth / windowWidth }, 'show-castle')
	tl.to(skyworld, { y:() => windowHeight/2 - frame.clientHeight/2, transformOrigin: 'top' }, 'show-castle')
	tl.from(frameSection, { scale: () => windowWidth / frame.clientWidth }, 'show-castle')
	tl.add(revealPlayer(player))
	tl.call(() => { playerIsOnLadder = true })
	tl.call(() => { playerIsOnLadder = false })
	tl.set(player, { x:  -playerXDistanceToLeft })
	tl.to(player, { x: 0, duration: playerEntryDuration })
	tl.addLabel('castle-pan-left')
	tl.to(skyworld, { x: -windowWidth }, "castle-pan-left")
	tl.to(frameSection, { x: -windowWidth }, "castle-pan-left")
	tl.fromTo(mainSection, { x: windowWidth }, {x: -mainSection.clientWidth , duration: mainSectionDuration + globalDuration  }, "castle-pan-left")
	tl.fromTo(tankSection, { x: windowWidth }, {x: 0 }, ">-" + globalDuration)
	tl.fromTo(waterWorld, { x: windowWidth }, {x: 0 }, ">-" + globalDuration)
	tl.to(player, { x: playerXDistanceToRight, duration: playerExitDuration })
	return tl;
}

function waterWorldTL() {
	let tl = gsap.timeline({
		defaults: {
			duration: globalDuration,
			ease: 'linear'
		}
	});

	let waterWorld = document.querySelector('.waterWorld')
	let castleWorld = document.querySelector('.castleWorld')
	let waterTankSection = waterWorld.querySelector('.tank-section')
	let castleTankSection = castleWorld.querySelector('.tank-section')
	let castleTank = castleTankSection.querySelector('.tank')
	let waterMainSection = waterWorld.querySelector('.main-section')

	let panSpeed = windowWidth / globalDuration;
	let waterMainSectionDuration = waterMainSection.clientWidth / panSpeed;
	let playerXDistanceToLeft =  player.getBoundingClientRect().x + player.clientWidth
	let playerEntryDuration = globalDuration * (playerXDistanceToLeft / windowWidth);


	tl.addLabel('water-show-tank')
	tl.to(player, { scale: 1 } , 'water-show-tank')
	tl.from(waterTankSection, { scale: () => castleTank.clientWidth / windowWidth }, 'water-show-tank')
	tl.to(castleTankSection, { scale: () => windowWidth / castleTank.clientWidth }, 'water-show-tank')
	tl.set(player, { x:  -playerXDistanceToLeft })	
	tl.to(player, { x: 0, duration: playerEntryDuration })
	tl.addLabel('water-pan-left')
	tl.to(waterTankSection, { x: -windowWidth }, 'water-pan-left')
	tl.fromTo(waterMainSection, { x: windowWidth }, { x: -windowWidth, duration: waterMainSectionDuration  }, 'water-pan-left')

	return tl;
}

function parallaxBackground(elem){
	let speed = elem.dataset.speed ? elem.dataset.speed : 1;
	gsap.set(elem, { width: () => elem.clientWidth * speed });

	let to = gsap.to(elem, {
		x:() => -elem.clientWidth + windowWidth, 
		ease: 'none',
		duration: globalDuration,
	});
	
	return to;
}

function generateClouds(elem, count = 10) {

	let frag = document.createDocumentFragment();
	let clouds = [];

	for (let i = 0; i < count; i++) {
		
		let cloud = document.createElement('cloud');
		frag.appendChild(cloud);

		gsap.set(cloud, {
			left: "random(0, 100, 1)%",
			top: "random(0, 70, 1)%",
			width: "random(100, 300, 1)",
			height: "random(100, 300, 1)",
		});

		gsap.to(cloud, {
			scrollTrigger: {
				scrub: true,
			},
			x:"random(-500, 0)"
		})

		clouds.push(cloud);
	}
	elem.appendChild(frag);
	return clouds;
}

function initPlayer() {
	playerTL = gsap.timeline({
		paused: true,
		ease: 'none',
	});

	let player = document.querySelector('.player')

	playerTL.set(player, { backgroundPosition: '100% 0%'}, "0").addLabel('stand')
	playerTL.set(player, { backgroundPosition: '100% 25%'}, "2").addLabel('walk-start')
	playerTL.set(player, { backgroundPosition: '100% 50%'}, "<0.2")
	playerTL.set( {}, {}, "<0.2" ).addLabel('walk-end')
	playerTL.set(player, { backgroundPosition: '100% 75%'}, '4').addLabel('climb-start')
	playerTL.set(player, { backgroundPosition: '100% 100%'}, "<0.3")
	playerTL.set( {}, {}, "<0.3" ).addLabel('climb-end')

}

function playerStand() {
	playerTL.tweenFromTo("stand", 0)
}

function playerClimb() {
	playerTL.tweenFromTo("climb-start", "climb-end", { onComplete: playerClimb } )
}

function playerWalk() {
	playerTL.tweenFromTo("walk-start", "walk-end", { onComplete: playerWalk } )
}

function snapshotPlayer(activePlayer, frozenPlayer) {

	let tl = gsap.timeline()

	let activeBounding = player.getBoundingClientRect()
	let frozenBounding = frozenPlayer.getBoundingClientRect()

	tl.set(frozenPlayer, { y:() => activeBounding.y - frozenBounding.y, autoAlpha: 1 })
	tl.set(activePlayer, { autoAlpha: 0 })

	return tl
}

function revealPlayer(activePlayer) {
	let tl = gsap.timeline()
	tl.set(activePlayer, { autoAlpha: 1 })
	return tl
}

let playerIsMoving = null;
let playerDirection = 1;
let playerIsOnLadder = false;


function onScrollUpdate(scrollTrigger) {
	//console.log("progress:", self.progress.toFixed(3), "direction:", self.direction, "velocity", self.getVelocity());


	//playerTL.timeScale( 0.2 )

	// Change directions
	if (scrollTrigger.direction != playerDirection ) {
		playerDirection = scrollTrigger.direction
		gsap.set(player, { scaleX: playerDirection})
	}




	// Animate Movement
	if (playerIsMoving == false) {
		playerTL.timeScale( 1 );
		if (playerIsOnLadder) {
			playerClimb()
		} else {
			playerWalk()
		}
		playerIsMoving = true
		clearTimeout(window.scrollEndTimer)
		window.scrollEndTimer = setTimeout(scrollEnd, 500) // Scrolltrigger only fires an update about once every 200ms, so we need to time a little beyond that.
	}
	
}


function onScroll(event) {
	if (playerIsMoving === null) {
		playerIsMoving = false;
	}
	
}

function scrollEnd() {
	if (playerIsMoving) {
		playerIsMoving = false;
		if (playerIsOnLadder) {
			playerTL.timeScale( 0 );
		} else {
			playerStand()
		}
		
	}
}

function calculateWalkSpeed(velocity) {
	let playerWidth = 200;
	let speed = velocity / playerWidth ;
	return speed;
}
