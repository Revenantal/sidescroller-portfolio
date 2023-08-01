import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


let globalDuration = 3;
let windowWidth = document.documentElement.clientWidth;
let windowHeight = document.documentElement.clientHeight;

export function animations() {
	let masterTL = gsap.timeline()
	masterTL.add(overworldTL())
	masterTL.add(skyworldTL())
	masterTL.add(castleWorldTL())



}

function overworldTL() {
	let tl = gsap.timeline({
		defaults: {
			duration: globalDuration,
			ease: 'linear'
		}
	});

	let overworld = document.querySelector('.overworld');
	let player = overworld.querySelector('.player');
	let ground = overworld.querySelector('.ground');
	let cloudsElem = overworld.querySelector('.backgrounds > .clouds');

	// add animations and labels to the timeline
	tl.to(ground, {
		x:() => windowWidth - ground.clientWidth, 
	});

	overworld.querySelectorAll('.backgrounds > *').forEach((background) => {
		tl.add(parallaxBackground(background), "0");
	});

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

	let scrollRatePerSecond = windowHeight / globalDuration;
	let skyWorldDuration = skyworld.clientHeight / scrollRatePerSecond;

	tl.to(overworld, {y: windowHeight})
	tl.fromTo(skyworld, {
		y:() => window.scrollY - skyworld.clientHeight, 
	}, {
		y: 0,
		duration: skyWorldDuration
	}, '<')

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
	let castleFrame = document.querySelector('.castleFrame')
	let frame = castleFrame.querySelector('.frame')
	let castleWorld = document.querySelector('.castleWorld')

	let panSpeed = windowWidth / globalDuration;
	let castleWorldDuration = castleWorld.clientWidth / panSpeed;

	tl.addLabel('show-castle')
	tl.to(skyworld, { scale: () => frame.clientWidth / windowWidth })
	tl.to(skyworld, { y:() => windowHeight/2 - frame.clientHeight/2, transformOrigin: 'top' }, 'show-castle')
	tl.from(castleFrame, { scale: () => windowWidth / frame.clientWidth }, 'show-castle')
	tl.addLabel('pan-left')
	tl.to(castleFrame, { x: -windowWidth })
	tl.to(skyworld, { x: -windowWidth }, "pan-left")
	tl.fromTo(castleWorld, { x: windowWidth }, {x: windowWidth - castleWorld.clientWidth , duration: castleWorldDuration }, "pan-left")


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

