# Catchmind Game Clone
## 1. What is Catchmind?
It's a game where one player draws something about a given word which then the other players try to guess right to earn points.

## 2. Todo LIst
1. Game Lobby
    - some design

2. In Game
    - ~~show random words from database~~
	  - no duplicates
    - ~~first player starts the game with START button~~
	  - can choose language(eng, kor) -> this looks hard.. maybe keep 2 individual databases for each lang
	- ~~add code to move onto next round~~
    - ~~add timer~~
	  - add event when timer runs out
	- ~~popup to show answers players submit~~
	  - add arrow to popups
    - add point system
	  - ~~faster => higher score for answerer and drawer~~
	  - drawer loses points when no answer within time limit
	- drawer can skip word
	- chat system
	- add collapsable scoreboard popup
	- ~~game end~~
	  - ~~show winner and points~~
	  - ~~show scoreboard at end of game~~
	  - ~~sort by score (try using table)~~
	  - ~~add restart button~~

3. Canvas
    - ~~drawing feature with various colors~~
    - ~~fill option fills with opacity~~
    - ~~show non-drawers what the drawer draws real-time~~
 
4. Fix Bugs
    - all player names disappear when one logs out 
	- 8th player's submitted answer is covered by a color button
	- dupe entries
	
5. Deploy on Heroku

## #References
timer: https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/