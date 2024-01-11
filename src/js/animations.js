import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Player } from "./player";
gsap.registerPlugin(ScrollTrigger);


let newPlayer = new Player;

let globalDuration = 2;
let windowWidth = document.documentElement.clientWidth;
let windowHeight = document.documentElement.clientHeight;//window.screen.availHeight;
let mobileNavBarHeight = document.querySelector('#app').offsetHeight - windowHeight


let player = document.querySelector('.player');
let masterTL = null;
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
				newPlayer.scrollTriggerEvent(self)
				//onScrollUpdate(self)
			}
		}
	})

	ScrollTrigger.normalizeScroll(true);

	promptAnimation();

	masterTL.addLabel('start')
	masterTL.add(overworldTL())
	masterTL.addLabel('sky-world-start')
	masterTL.add(skyworldTL())
	masterTL.addLabel('castle-world-start')
	masterTL.add(castleWorldTL())
	masterTL.addLabel('water-world-start')
	masterTL.add(waterWorldTL())
	masterTL.addLabel('end')

	// Star Graph Animations
	let starGraphElems = document.querySelectorAll('.star-graph')
	starGraphElems.forEach((starGraphElem) => {

		let tl = gsap.timeline({
			scrollTrigger: {
				scrollTrigger: starGraphElem,
				start: "top top",
				markers: true,
			},
			defaults: {
				duration: 2,
				ease: "elastic.out(1,0.3)",
			}
		})


		let stars = starGraphElem.querySelectorAll('.star')
		stars.forEach((star, index) => {
			tl.from(star, {
				autoAlpha:0,
				scale:0.5,
			}, stars.length/5 - index/5 )
		})

		tl.from(starGraphElem.querySelector('h2'), {
			autoAlpha:0,
			scale:0.5,
		}, "<50%")

		console.log(tl)

	})



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
	let duration = globalDuration * 0.5;
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
	let groundOffset = document.querySelector('.overworld .ground').offsetHeight

	let scrollRatePerDuration = windowHeight / duration;
	let skyWorldHeight = (skyworld.clientHeight - windowHeight) + groundOffset - mobileNavBarHeight
	let skyWorldDuration = skyWorldHeight / scrollRatePerDuration;   	
	mm.add("(min-width: 1260px)", (ctx) => {
			tl.addLabel('skyworld-show')
			tl.call(() => { newPlayer.state = 'on_ground' })
			tl.call(() => { newPlayer.state = 'on_ladder' })
		})
		mm.add("(max-width: 1260px)", (ctx) => {

			tl.to(player, { x: windowWidth - player.getBoundingClientRect().x, duration: duration / 2 })
			tl.addLabel('skyworld-show')
		})
		tl.to(overworld, {y: windowHeight}, 'skyworld-show')
		tl.fromTo(skyworldTitle, {
			y:() => skyWorldHeight - windowHeight - mobileNavBarHeight
		}, {
			y: -windowHeight - mobileNavBarHeight, 
			duration: skyWorldDuration 
		}, 'skyworld-show')
		tl.fromTo(skyworld, {
			y:() => -skyWorldHeight,
		}, {
			y: 0,
			duration: skyWorldDuration 
		}, 'skyworld-show')


	mm.add("(min-width: 1260px)", (ctx) => {
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
	mm.add("(min-width: 1260px)", (ctx) => {
		tl.call(() => { newPlayer.state = 'on_ladder' })
		tl.call(() => { newPlayer.state = 'on_ground' })
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
	let contactSection = waterWorld.querySelector('.contact-section')

	let bubbleElems = waterWorld.querySelectorAll('.backgrounds .bubbles');
	bubbleElems.forEach((bubbleElem) => {
		generateBubbles(bubbleElem)
	});

	let fishElems = waterWorld.querySelectorAll('.backgrounds .fish');
	fishElems.forEach((fishElem) => {
		generateFish(fishElem)
	});

	

	let panSpeed = windowWidth / duration;
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
	tl.fromTo(waterMainSection, { x: windowWidth }, { x: -waterMainSection.clientWidth, duration: waterMainSection.clientWidth / panSpeed + duration }, 'water-pan-left')
	tl.fromTo(contactSection, { x: windowWidth + waterMainSection.clientWidth }, { x: -contactSection.clientWidth + windowWidth, duration: (contactSection.clientWidth + waterMainSection.clientWidth  - windowWidth) / panSpeed + duration }, 'water-pan-left')
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

function generateBubbles(elem, count = 10) {
	let frag = document.createDocumentFragment();
	let bubbles = [];

	for (let i = 0; i < count; i++) {
		
		let bubble = document.createElement('bubble');
		frag.appendChild(bubble);


		gsap.fromTo(bubble,{
			left: "random(0, 95, 1)%",
			y: "100vh",
			width: "random(30, 80, 1)px",
		}, {
			y: "-100%",
			repeat: -1,
			duration: "random(5, 20)",
			ease: 'linear',
			delay: "random(0,5)",
			repeatRefresh: true
		})

		gsap.fromTo(bubble,{
			x: "0",
		}, {
			x: "100%",
			repeat: -1,
			yoyo: true,
			ease: "sine.inOut",
			duration: "random(1, 2)",
		})

		bubbles.push(bubble);
	}
	elem.appendChild(frag);
	return bubbles;

}

function generateFish(elem, count = 5) {
	let frag = document.createDocumentFragment();
	let fishes = [];
	let fishClasses = [
		'fish-1',
		'fish-2',
		'fish-3',
		'fish-4',
	]

	for (let i = 0; i < count; i++) {
		
		let fish = document.createElement('fish');
		fish.classList.add(fishClasses[Math.floor(Math.random() * fishClasses.length)]);
		frag.appendChild(fish);



		gsap.set(fish, {
			width: "random(30, 130, 1)",
			left: "random(5, 95, 1)%",
			top: "random(5, 90)%",
		})

  		randomizeFish()
		function randomizeFish() {

			let left = gsap.utils.random(5, 95) + "%";
			let direction = left > fish.style.left ? 1 : -1;


			gsap.to(fish, {
				scaleX: direction,
			})
			gsap.to(fish, {
				left: left,
				top: "random(5, 95)%",
				duration: "random(5, 20)",
				ease: "sine.inOut",
				onComplete: randomizeFish
			})
		}
		fishes.push(fish);
	}
	elem.appendChild(frag);
	return fishes;

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

function promptAnimation() {
	let promptElem = document.querySelector('.navigation-prompt');
	let arrowTL = gsap.timeline({
		repeat: -1,
		repeatDelay: 1,
		defaults: {
			duration: 2
		}
	})
	arrowTL.fromTo(promptElem.querySelector('.arrow'),{
		autoAlpha:0
	}, {
		autoAlpha:1,
		duration: 0.2
	})
	arrowTL.to(promptElem.querySelector('.arrow'), {
		y:20,
		ease: "elastic.out(1,0.3)",
	}, "0")
	arrowTL.to(promptElem.querySelector('.arrow'), {
		autoAlpha:0,
		duration: 0.5,
	}, "+=1")
}



