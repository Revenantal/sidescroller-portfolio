import { gsap } from "gsap";

export class Player {
	constructor(
		player_elem = document.querySelector('.player'),
        state = "on_ground",
        timeline = 	gsap.timeline({
            paused: false,
            ease: 'none',
            repeat: -1,
            repeatDelay: 0,
        }),
        player_direction = 1,
        scroll_delay_timeout = 500,
        is_moving = false,
	) {
        this.timeline = timeline
		this.player_elem = player_elem
        this._state = state
        this._is_moving = is_moving
        this.scroll_delay_timeout = scroll_delay_timeout
        this.player_direction = player_direction
        this.updateAnimation()
        this.has_scrolled = false


        // Scroll Trigger Event actually fires a bunch without user activity. This holds up the animations till the user actually scrolls.
        addEventListener("scroll", (event) => {
            this.has_scrolled = true
        });
	}

    get state() {
        return this._state
    }

    set state(new_state) {
        this._state = new_state
        this.updateAnimation()
    }

    get is_moving() {
        return this._is_moving
    }

    set is_moving(is_moving) {
        this._is_moving = is_moving
        this.updateAnimation()
    }

    scrollTriggerEvent(scrollTrigger) {
        if (this.has_scrolled) {
            clearTimeout(window.scroll_delay)

            // Change directions
            if (scrollTrigger.direction != this.player_direction ) {
                this.player_direction = scrollTrigger.direction
                this.updateAnimation()
            }
    
            // Update Moving State
            if (!this.is_moving) {
                this.is_moving = true  
            }
    
            window.scroll_delay = setTimeout(() => {
                this.is_moving = false
            }, this.scroll_delay_timeout) // Scrolltrigger only fires an update about once every 200ms, so we need to time a little beyond that.
        }
    }

    updateAnimation() {
        this.timeline.clear()
        this.timeline.resume()

        gsap.set(this.player_elem, { scaleX: this.player_direction}) 

        if (this.is_moving && this.state == 'on_ground') {
            // Walking
            this.timeline.set(this.player_elem, { backgroundPosition: '100% 25%'})
            this.timeline.set(this.player_elem, { backgroundPosition: '100% 50%'}, "<0.2" )
            this.timeline.set( {}, {}, "<0.2" )
        } else if (this.is_moving && this.state == 'on_ladder') {
            // Climbing Ladder
            this.timeline.set(this.player_elem, { backgroundPosition: '100% 75%'})
            this.timeline.set(this.player_elem, { backgroundPosition: '100% 100%'}, "<0.2")
            this.timeline.set( {}, {}, "<0.2" ).addLabel('climb-end')
        } else if (!this.is_moving && this.state == 'on_ladder'){
            // Standing on Ladder 
            this.timeline.pause()
        } else {
            // Standing Still 
            this.timeline.set(this.player_elem, { backgroundPosition: '100% 0%'})
        }
    }  


}