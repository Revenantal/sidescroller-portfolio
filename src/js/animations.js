import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


let globalDuration = 2;
let windowWidth = document.documentElement.clientWidth;
let windowHeight = document.documentElement.clientHeight;


let player = document.querySelector('.player');
let playerTL = null;
let masterTL = null;
let playerIsMoving = null;
let playerDirection = 1;
let playerIsOnLadder = false;
let mm = gsap.matchMedia();

export function animations() {

	masterTL = gsap.timeline({
		//yoyo: true,
		//repeat: -1,
		//repeatDelay: 1,
		ease: 'none',
		scrollTrigger: {
			scrub: 1,
			pin: '#app',
			end: '2000%',
			onUpdate: function(self) {
				onScrollUpdate(self)
			}
		}
	})

	ScrollTrigger.normalizeScroll(true);
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

}

function overworldTL() {
	let duration = globalDuration * 1;
	let tl = gsap.timeline({
		defaults: {
			duration: duration,
			ease: 'linear'
		}
	});

	let overworld = document.querySelector('.overworld');
	let ground = overworld.querySelector('.ground');
	let content = overworld.querySelector('.content')
	let cloudsElem = overworld.querySelector('.backgrounds > .clouds');
	let skyworld = document.querySelector('.skyworld')

	generateClouds(cloudsElem)
	tl.to([ground, content], { x:() => windowWidth - ground.clientWidth })
	tl.fromTo(skyworld, { x:() => ground.clientWidth - windowWidth }, { x: 0 }, "0")

	overworld.querySelectorAll('.backgrounds > *').forEach((background) => {

		let speed = background.dataset.speed ? background.dataset.speed : 1;
		gsap.set(background, { width: () => background.clientWidth * speed });
	
		tl.to(background, {
			x: -background.clientWidth + windowWidth, 
			ease: 'none',
			duration: duration,
		}, "0")
	})

	return tl;	
}

function skyworldTL() {
	let duration = globalDuration * 0.8;
	let tl = gsap.timeline({
		defaults: {
			duration: duration,
			ease: 'linear'
		}
	});

	let skyworld = document.querySelector('.skyworld')
	let skyworldTitle = skyworld.querySelector('.heading')
	let overworld = document.querySelector('.overworld')
	let frozenPlayer = skyworld.querySelector('.frozen-player')

	let scrollRatePerDuration = windowHeight / duration;
	let skyWorldDuration = (skyworld.clientHeight - windowHeight * 0.8) / scrollRatePerDuration;  

	/**
	 * TODO: Something with the 0.8, and 1.8 is messing with this on mobile with notches. Using a top: -20vh seems to fix it, but causes more chaos.
	 */

		mm.add("(min-width: 767px)", (ctx) => {
			tl.addLabel('skyworld-show')
			tl.call(() => { playerIsOnLadder = false })
			tl.call(() => { playerIsOnLadder = true })
		})
		mm.add("(max-width: 767px)", (ctx) => {
			tl.to(player, { x: windowWidth - player.getBoundingClientRect().x, duration: duration / 2 })
			tl.addLabel('skyworld-show')
		})
		tl.to(overworld, {y: windowHeight}, 'skyworld-show')
		tl.fromTo(skyworldTitle, {
			y:() => skyworld.clientHeight - windowHeight*1.8
		}, {
			y: -windowHeight, 
			duration: skyWorldDuration 
		}, 'skyworld-show')
		tl.fromTo(skyworld, {
			y:() => 0 - skyworld.clientHeight + windowHeight * 0.8,
		}, {
			y: 0,
			duration: skyWorldDuration
		}, 'skyworld-show')


	mm.add("(min-width: 767px)", (ctx) => {
		tl.add(snapshotPlayer(player, frozenPlayer))
	})


	tl.set(skyworld, {className: 'skyworld clipped'})
	tl.addLabel('skyworld-done')

	return tl;
}

function castleWorldTL() {
	let duration = globalDuration * 0.6;
	let tl = gsap.timeline({
		defaults: {
			duration: duration,
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

	let panSpeed = windowWidth / duration;
	let mainSectionDuration = mainSection.clientWidth / panSpeed;
	let playerXDistanceToLeft =  player.getBoundingClientRect().x + player.clientWidth
	let playerXDistanceToRight =  windowWidth - player.getBoundingClientRect().x;
	let playerEntryDuration = duration * (playerXDistanceToLeft / windowWidth);
	let playerExitDuration = duration * (playerXDistanceToRight / windowWidth);

	tl.addLabel('castle-show')
	tl.to(skyworld, { scale: () => frame.clientWidth / windowWidth, duration: duration/2 }, 'show-castle')
	tl.to(skyworld, { y:() => windowHeight/2 - frame.clientHeight/2, transformOrigin: 'top', duration: duration/2 }, 'show-castle')
	tl.from(frameSection, { scale: () => windowWidth / frame.clientWidth, duration: duration/2 }, 'show-castle')
	tl.add(revealPlayer(player))
	mm.add("(min-width: 767px)", (ctx) => {
		tl.call(() => { playerIsOnLadder = true })
		tl.call(() => { playerIsOnLadder = false })
	})

	tl.set(player, { x:  -playerXDistanceToLeft })
	tl.to(player, { x: 0, duration: playerEntryDuration })
	tl.addLabel('castle-pan-left')
	tl.to(skyworld, { x: -windowWidth }, "castle-pan-left")
	tl.to(frameSection, { x: -windowWidth }, "castle-pan-left")
	tl.fromTo(mainSection, { x: windowWidth }, {x: -mainSection.clientWidth , duration: mainSectionDuration + duration  }, "castle-pan-left")
	tl.fromTo(tankSection, { x: windowWidth }, {x: 0 }, ">-" + duration)
	tl.fromTo(waterWorld, { x: windowWidth }, {x: 0 }, ">-" + duration)
	tl.to(player, { x: playerXDistanceToRight, duration: playerExitDuration })
	return tl;
}

function waterWorldTL() {
	let duration = globalDuration * 0.6;
	let tl = gsap.timeline({
		defaults: {
			duration: duration,
			ease: 'linear'
		}
	});

	let waterWorld = document.querySelector('.waterWorld')
	let castleWorld = document.querySelector('.castleWorld')
	let waterTankSection = waterWorld.querySelector('.tank-section')
	let castleTankSection = castleWorld.querySelector('.tank-section')
	let castleTank = castleTankSection.querySelector('.tank')
	let waterMainSection = waterWorld.querySelector('.main-section')



	let panSpeed = windowWidth / duration;
	//let waterMainSectionDuration = waterMainSection.clientWidth / panSpeed;
	let waterMainSectionDuration = (waterMainSection.clientWidth - windowWidth) / panSpeed;
	let playerXDistanceToLeft =  player.getBoundingClientRect().x + player.clientWidth
	let playerEntryDuration = duration * (playerXDistanceToLeft / windowWidth);

	tl.addLabel('water-show-tank')
	tl.from(waterTankSection, { scale: () => castleTank.clientWidth / windowWidth }, 'water-show-tank')
	tl.to(castleTankSection, { scale: () => windowWidth / castleTank.clientWidth }, 'water-show-tank')
	tl.set(player, { x:  -playerXDistanceToLeft })	
	tl.to(player, { x: 0, duration: playerEntryDuration })
	tl.set(waterWorld, {className: 'waterWorld'})
	tl.addLabel('water-pan-left')
	tl.to(waterTankSection, { x: -windowWidth }, 'water-pan-left')
	//tl.fromTo(waterMainSection, { x: windowWidth }, { x: -waterMainSection.clientWidth, duration: waterMainSectionDuration + duration }, 'water-pan-left')
	tl.fromTo(waterMainSection, { x: windowWidth }, { x: -waterMainSection.clientWidth + windowWidth, duration: waterMainSectionDuration + duration }, 'water-pan-left')

	return tl;
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

function onScrollUpdate(scrollTrigger) {
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
