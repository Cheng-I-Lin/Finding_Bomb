var scale=(window.outerHeight/824);
const text=document.getElementsByClassName("textContainer");
for(t of text){
    t.style.fontSize=scale*1.5+"em";
}
const text2=document.getElementsByClassName("bigText");
for(t of text2){
    t.style.fontSize=scale*1.8+"em";
}
const text3=document.getElementsByClassName("pageText");
for(t of text3){
    t.style.fontSize=scale*1.75+"em";
}
document.getElementById("grid").style.fontSize=scale*2+"em";
var gameMap=[];
            var coverMap=[];
            const grid=document.getElementById("grid");
            var gameTime=20;
            var pause=true;
            var blockSize=50;
            var discoverBomb=false;
            var bombNum=1;
            var restarting=false;
            var timed=false;
            var limitedTime=100;
            var medTimed=false;
            var hardTimed=false;
            var vanish=false;
            var hidden=false;
            var limitMove=false;
            var multi=false;
            //Used to see how many moves the player gets
            var numMoves=1;
            //Use this to draw the grid for the selection
            var mouseX=0;
            var mouseY=0;
            //Used for hidden mode to give up
            var failedHidden=false;
            function drawCover(){
                let canvas=document.getElementById("coverCanvas");
                let ds=canvas.getContext("2d");
                let gridX=Math.floor(Math.floor(mouseX+window.scrollX-grid.offsetLeft)/blockSize);
                let gridY=Math.floor(Math.floor(mouseY+window.scrollY-grid.offsetTop)/blockSize);
                canvas.style.left=grid.offsetLeft+"px";
                canvas.style.top=grid.offsetTop+"px";
                canvas.width = grid.offsetWidth;
                canvas.height = grid.offsetHeight;
                ds.clearRect(canvas.left,canvas.top,canvas.width,canvas.height);
                for(let i=0;i<coverMap.length;i++){
                    for(let j=0;j<coverMap[0].length;j++){
                        let blockX=j*blockSize;
                        let blockY=i*blockSize;
                        switch(coverMap[i][j]){
                            //Fill in nothing for blank tiles
                            case "":
                                ds.fillStyle="rgba(0,0,0,0)";
                                break;
                            default:
                                ds.fillStyle="black";
                                break;
                        }
                        ds.fillRect(blockX,blockY,blockSize,blockSize);
                        if(coverMap[i][j]=="flag"){
                            ds.beginPath();
                            ds.moveTo(blockX+20,blockY+10);
                            ds.lineTo(blockX+35,blockY+20);
                            ds.lineTo(blockX+20,blockY+30);
                            ds.lineWidth=1;
                            ds.strokeStyle="white";
                            ds.fillStyle="red";
                            ds.fill();
                            ds.stroke();
                            ds.beginPath();
                            ds.moveTo(blockX+20,blockY+10);
                            ds.lineTo(blockX+20,blockY+blockSize-10);
                            ds.closePath();
                            ds.stroke();                
                        }
                        //Draws the selection grid in the cover map
                        if(!pause&&selectionGrid&&(gridX>=0&&gridX<gameMap.length)&&(gridY>=0&&gridY<gameMap.length)){
                            ds.beginPath();
                            ds.moveTo(gridX*blockSize,gridY*blockSize);
                            ds.lineTo(gridX*blockSize+blockSize,gridY*blockSize);
                            ds.lineTo(gridX*blockSize+blockSize,gridY*blockSize+blockSize);
                            ds.lineTo(gridX*blockSize,gridY*blockSize+blockSize);
                            ds.closePath();
                            ds.lineWidth=3;
                            if(coverMap[gridY][gridX]=="flag"){
                                ds.strokeStyle="yellow";
                            } else if(coverMap[gridY][gridX]==""){
                                ds.strokeStyle="green";
                            } else{
                                ds.strokeStyle="red";
                            }
                            ds.stroke();
                        }
                    }
                }
            }
            function drawGame(){
                let canvas=document.getElementById("tileCanvas");
                let ds=canvas.getContext("2d");
                canvas.style.left=grid.offsetLeft+"px";
                canvas.style.top=grid.offsetTop+"px";
                canvas.width = grid.offsetWidth;
                canvas.height = grid.offsetHeight;
                ds.clearRect(canvas.left,canvas.top,canvas.width,canvas.height);
                for(let i=0;i<gameMap.length;i++){
                    for(let j=0;j<gameMap[i].length;j++){
                        let blockX=j*blockSize;
                        let blockY=i*blockSize;
                        ds.fillStyle="rgb(198, 199, 199)";
                        ds.fillRect(blockX,blockY,blockSize,blockSize);
                        //Draws each number/distance away from bomb, use pythagorean for diagonals, use include for each number
                        ds.fillStyle="black";
                        ds.font="30px Arial";
                        if(parseInt(gameMap[i][j])>=10){
                            ds.fillText(gameMap[i][j],blockX+blockSize/2-18,blockY+blockSize/2+10);
                        } else if(gameMap[i][j]!="bomb"){
                            ds.fillText(gameMap[i][j],blockX+blockSize/2-8,blockY+blockSize/2+10);
                        }
                        if(gameMap[i][j]=="bomb"){
                            ds.beginPath();
                            ds.moveTo(blockX+5, blockY+5);
                            ds.lineTo(blockSize+blockX-5,blockY+blockSize-5);
                            ds.moveTo(blockX+blockSize-5,blockY+5);
                            ds.lineTo(blockX+5,blockY+blockSize-5);
                            ds.lineWidth=5;
                            ds.closePath();
                            ds.strokeStyle="red";
                            ds.stroke();
                        }
                    }
                }
            }
            //Shows and hides button when mouse over/leave hidden sheet
            document.getElementById("hiddenSheet").addEventListener("mouseover", function(){
                document.getElementById("failButton").style.opacity=1;
            });
            document.getElementById("hiddenSheet").addEventListener("mouseleave", function(){
                document.getElementById("failButton").style.opacity=0;
            });
            //Sets to negative so vanish mode won't run for the first click
            var clickX=-1;
            var clickY=-1;
            //Use this to randomize the location of coversheet
            var sheetLocation=Math.floor(Math.random()*4);
            //Use mouse location to identify which block is clicked
            document.getElementById("coverCanvas").addEventListener("click", function(mouse){
                if(!pause&&numMoves>0){
                    if(clickX>=0&&clickY>=0&&coverMap[clickY][clickX]==""){
                        coverMap[clickY][clickX]="block";
                    }
                    switch(gameMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]){
                        case "bomb":
                            if(coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]=="flag"){
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="block";
                            } else{
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="";
                                discoverBomb=true;
                            }
                            break;
                            //document.getElementById("hi").innerHTML=discoverBomb;
                        default:
                            if(coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]=="flag"){
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="block";
                            } else{
                                if(coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]!=""){
                                    sheetLocation=Math.floor(Math.random()*4);
                                    if(limitMove){
                                        numMoves--;
                                    }
                                }
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="";
                            }
                            break;
                    }
                    if(vanish){
                        clickX=Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize);
                        clickY=Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize);
                    }
                }
            });
            document.getElementById("timeNotification").addEventListener("click", function(mouse){
                if(!pause){
                    switch(gameMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]){
                        case "bomb":
                            if(coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]=="flag"){
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="block";
                            } else{
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="";
                                discoverBomb=true;
                            }
                            break;
                            //document.getElementById("hi").innerHTML=discoverBomb;
                        default:
                            if(coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]=="flag"){
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="block";
                            } else{
                                coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="";
                            }
                            break;
                    }
                }
            });
            var spaceClicked=false;
            var vanishPoint=0;
            var selectionGrid=false;
            document.addEventListener("keyup",function(key){
                let control=key.code;
                switch(control){
                    case "KeyT":
                        showTime();
                        break;
                    case "Space":
                        if(vanish||(numMoves>=0&&limitMove)){
                           spaceClicked=true; 
                        }
                        break;
                    case "KeyG":
                        //Shows the selection grid
                        if(selectionGrid){
                            selectionGrid=false;
                        } else{
                            selectionGrid=true;
                        }
                        break;
                    default:
                        break;
                }
            });
            //This is for the last deciding choice of where the bomb is
            document.addEventListener("mousemove", function(mouse){
                mouseX=mouse.x;
                mouseY=mouse.y;
                if(!pause&&spaceClicked){
                    if(gameMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]=="bomb"){
                        vanishPoint++;
                        spaceClicked=false;
                        coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="";
                    } else{
                        coverMap[Math.floor(Math.floor(mouse.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(mouse.x+window.scrollX-grid.offsetLeft)/blockSize)]="";
                        discoverBomb=true;
                    }
                }
            });
            function showTime(){
                let timePage=document.getElementById("timeNotification");
                if((timed||medTimed||hardTimed)&&!pause){
                    if(timePage.style.bottom=="45%"){
                        timePage.style.bottom="100%";
                    } else{
                        timePage.style.bottom="45%";
                    }
                }
            }
            function redFlagged(event){
                //document.getElementById("hi").innerHTML=event.button;
                if(!pause&&event.button==2&&coverMap[Math.floor(Math.floor(event.y-grid.offsetTop)/blockSize)][Math.floor(Math.floor(event.x-grid.offsetLeft)/blockSize)]!=""){
                    if(coverMap[Math.floor(Math.floor(event.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(event.x+window.scrollX-grid.offsetLeft)/blockSize)]!="flag"){
                        coverMap[Math.floor(Math.floor(event.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(event.x+window.scrollX-grid.offsetLeft)/blockSize)]="flag";
                    } else{
                        coverMap[Math.floor(Math.floor(event.y+window.scrollY-grid.offsetTop)/blockSize)][Math.floor(Math.floor(event.x+window.scrollX-grid.offsetLeft)/blockSize)]="block";
                    }
                }
            }
            function nextGame(){
                document.getElementById("gameSetUp").style.bottom="0%";
            }
            var bombLocationX=[];
            var bombLocationY=[];
            function startGame(){
                document.getElementById("timeNotification").style.bottom="100%";
                //Distance from bomb to tile
                let shortestDistance=0;
                let distance=0;
                //Add bombs to the tiles
                for(let n=0;n<bombNum;n++){
                    //Randomize a location for the bomb
                    let x=Math.floor(Math.random()*gameMap.length);
                    let y=Math.floor(Math.random()*gameMap[0].length);
                    if(gameMap[x][y]!="bomb"){
                        gameMap[x][y]="bomb";
                        bombLocationX.push(x);
                        bombLocationY.push(y);
                    }
                }
                //Assign values to each tile
                for(let i=0;i<gameMap.length;i++){
                    for(let j=0;j<gameMap[0].length;j++){
                        //push array to gamemap
                        if(gameMap[i][j]!="bomb"){
                            shortestDistance=Math.ceil(Math.sqrt(Math.pow(bombLocationX[0]-i,2)+Math.pow(bombLocationY[0]-j,2)));
                            for(let k=1;k<bombLocationX.length;k++){
                                distance=Math.ceil(Math.sqrt(Math.pow(bombLocationX[k]-i,2)+Math.pow(bombLocationY[k]-j,2)));
                                //Compare which distance is shortest
                                if(shortestDistance>distance){
                                    shortestDistance=distance;
                                }
                            }
                            gameMap[i][j]=shortestDistance;
                            //document.getElementById("hi").innerHTML+=shortestDistance+"<br>";
                        }
                    }
                }
                if(timed){
                    //plus one for the transition bit
                    limitedTime=(gameMap.length*gameMap.length)*2+1;
                } else if(medTimed){
                    limitedTime=gameMap.length*gameMap.length+1;
                } else if(hardTimed){
                    limitedTime=Math.floor((gameMap.length*gameMap.length)/2)+1;
                }
                //Gets moves num as half of the number of tiles
                numMoves=Math.floor((gameMap.length*gameMap.length)/2);
                document.getElementById("intro").style.bottom="100%";
                document.getElementById("gameSetUp").style.bottom="100%";
                pause=false;
                restarting=false;
                //document.getElementById("hi").innerHTML+="<br>"+gameMap;
            }
            var difficulty=document.getElementById("difficulty");
            function submitMapSize(){
                //Use push to add maybe
                let arr=[];
                //reset maps
                gameMap=[];
                coverMap=[];
                let value=document.getElementById("selectSize").value;
                for(let i=0;i<value;i++){
                    //reset array
                    arr=[];
                    for(let j=0;j<value;j++){
                        arr.push("1");
                    }
                    //push array to gamemap
                    gameMap.push(arr);
                }
                //Make covermap the same as gamemap
                for(let k=0;k<gameMap.length;k++){
                    coverMap.push([]);
                    for(let l=0;l<gameMap[0].length;l++){
                        coverMap[k].push("block");
                    }
                }
                document.getElementById("selection2").style.display="block";
                document.getElementById("selectBomb").setAttribute("max",Math.floor((gameMap.length*gameMap.length)/2));
                if(bombNum<=Math.floor(gameMap.length/2)){
                    difficulty.innerHTML="Easy";
                } else if(bombNum<=Math.floor(gameMap.length)){
                    difficulty.innerHTML="Medium";
                } else if(bombNum<=Math.floor((gameMap.length*gameMap.length)/4)){
                    difficulty.innerHTML="Difficult";
                } else{
                    difficulty.innerHTML="Extreme";
                }
            }
            function submitBombNum(){
                bombNum=document.getElementById("selectBomb").value;
                document.getElementById("selection4").style.display="block";
                if(bombNum<=Math.floor(gameMap.length/2)){
                    difficulty.innerHTML="Easy";
                } else if(bombNum<=Math.floor(gameMap.length)){
                    difficulty.innerHTML="Medium";
                } else if(bombNum<=Math.floor((gameMap.length*gameMap.length)/4)){
                    difficulty.innerHTML="Difficult";
                } else{
                    difficulty.innerHTML="Extreme";
                }
                //can do an impossible level
            }
            function failed(){
                failedHidden=true;
            }
            function restart(){
                document.getElementById("timeNotification").style.bottom="100%";
                restarting=true;
                bombLocationX=[];
                bombLocationY=[];
                discoverBomb=false;
                failedHidden=false;
                bombNum=1;
                timed=false;
                spaceClicked=false;
                vanishPoint=0;
                selectionGrid=false;
                numMoves=1;
                sheetLocation=Math.floor(Math.random()*4);
                regularMode();
                limitedTime=100;
                difficulty.innerHTML="Easy";
                document.getElementById("gameSetUp").style.bottom="0%";
                document.getElementById("losePage").style.bottom="100%";
                document.getElementById("winPage").style.bottom="100%";
                document.getElementById("selection2").style.display="none";
                document.getElementById("selection3").style.display="none";
                document.getElementById("selection4").style.display="none";
                document.getElementById("selectSize").value=5;
                document.getElementById("selectBomb").value=1;
                document.getElementById("background").style.backgroundColor="rgba(0,0,0,0)";
            }
            //Times the player, limited time to complete game
            function timeMode(){
                timed=true;
                medTimed=false;
                hardTimed=false;
                vanish=false;
                hidden=false;
                limitMove=false;
                multi=false;
                document.getElementById("timingMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("regularMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("hideMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("limitMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("multiMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("selection3").style.display="block";
            }
            function regularMode(){
                timed=false;
                medTimed=false;
                hardTimed=false;
                vanish=false;
                hidden=false;
                limitMove=false;
                multi=false;
                document.getElementById("regularMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("timingMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("hideMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("limitMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("multiMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("selection3").style.display="block";
            }
            function timeMedMode(){
                timed=false;
                medTimed=true;
                hardTimed=false;
                vanish=false;
                hidden=false;
                limitMove=false;
                multi=false;
                document.getElementById("timingMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("regularMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("hideMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("limitMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("multiMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("selection3").style.display="block";
            }
            function timeHardMode(){
                timed=false;
                medTimed=false;
                hardTimed=true;
                vanish=false;
                hidden=false;
                limitMove=false;
                multi=false;
                document.getElementById("timingMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("regularMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("hideMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("limitMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("multiMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("selection3").style.display="block";
            }
            //Makes the selected tiles dissapear once selected
            function rememberMode(){
                timed=false;
                medTimed=false;
                hardTimed=false;
                vanish=true;
                hidden=false;
                limitMove=false;
                multi=false;
                document.getElementById("timingMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("regularMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("hideMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("limitMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("multiMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("selection3").style.display="block";
            }
            //Hides a side(or a tile) so user can't select them
            function hiddenMode(){
                timed=false;
                medTimed=false;
                hardTimed=false;
                vanish=false;
                hidden=true;
                limitMove=false;
                multi=false;
                document.getElementById("timingMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("regularMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("hideMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("limitMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("multiMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("selection3").style.display="block";
            }
            function limitedMode(){
                timed=false;
                medTimed=false;
                hardTimed=false;
                vanish=false;
                hidden=false;
                limitMove=true;
                multi=false;
                document.getElementById("timingMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("regularMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("hideMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("limitMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("multiMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("selection3").style.display="block";
            }
            function multiplayerMode(){
                timed=false;
                medTimed=false;
                hardTimed=false;
                vanish=false;
                hidden=false;
                limitMove=false;
                multi=true;
                document.getElementById("timingMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingMedMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("timingHardMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("regularMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("rememberMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("hideMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("limitMode").style.backgroundColor="rgb(241, 183, 94)";
                document.getElementById("multiMode").style.backgroundColor="rgb(255, 153, 0)";
                document.getElementById("selection3").style.display="block";
            }
            document.addEventListener("mousemove", function(mouse){
                let showMove=document.getElementById("movesLeft");
                showMove.style.left=mouse.x+10+"px";
                showMove.style.top=mouse.y-10+"px";
            });
            setInterval(function(){
                if((timed||medTimed||hardTimed)&&!pause){
                    limitedTime--;
                    document.getElementById("time").innerHTML=limitedTime;
                }
            },1000);
            setInterval(function(){
                let winPoint=0;
                grid.style.width=gameMap[0].length*blockSize+"px";
                grid.style.height=gameMap.length*blockSize+"px";
                grid.style.left=window.innerWidth/2-grid.offsetWidth/2+"px";
                grid.style.top=window.innerHeight/2-grid.offsetHeight/2+"px";
                for(let i=0;i<coverMap.length;i++){
                    for(let j=0;j<coverMap[0].length;j++){
                        if(coverMap[i][j]=="block"||coverMap[i][j]=="flag"){
                            winPoint++;
                        }
                    }
                }
                if((winPoint==bombNum||vanishPoint==bombNum)&&!restarting){
                    pause=true;
                    document.getElementById("winPage").style.bottom="0%";
                    document.getElementById("background").style.backgroundColor="green";
                }
                if(discoverBomb||limitedTime==0||failedHidden){
                    pause=true;
                    document.getElementById("losePage").style.bottom="0%";
                    document.getElementById("background").style.backgroundColor="red";
                }
                let hiddenSheet=document.getElementById("hiddenSheet");
                let failButton=document.getElementById("failButton");
                if(hidden&&!pause){
                    if(sheetLocation==0){
                        hiddenSheet.style.top=window.scrollY+"px";
                        hiddenSheet.style.left=window.scrollX+"px";
                        hiddenSheet.style.width="50%";
                        hiddenSheet.style.height="100%";
                        failButton.style.width="20%";
                        failButton.style.height="12.5%";
                        failButton.style.left="40%";
                        failButton.style.top="43.75%";
                    } else if(sheetLocation==1){
                        hiddenSheet.style.top=window.innerHeight/2+window.scrollY+"px";
                        hiddenSheet.style.left=window.scrollX+"px";
                        hiddenSheet.style.width="100%";
                        hiddenSheet.style.height="50%";
                        failButton.style.width="12.5%";
                        failButton.style.height="20%";
                        failButton.style.left="43.75%";
                        failButton.style.top="40%";
                    } else if(sheetLocation==2){
                        hiddenSheet.style.top=window.scrollY+"px";
                        hiddenSheet.style.left=window.innerWidth/2+window.scrollX+"px";
                        hiddenSheet.style.width="50%";
                        hiddenSheet.style.height="100%";
                        failButton.style.width="20%";
                        failButton.style.height="12.5%";
                        failButton.style.left="40%";
                        failButton.style.top="43.75%";
                    } else if(sheetLocation==3){
                        hiddenSheet.style.top=window.scrollY+"px";
                        hiddenSheet.style.left=window.scrollX+"px";
                        hiddenSheet.style.width="100%";
                        hiddenSheet.style.height="50%";
                        failButton.style.width="12.5%";
                        failButton.style.height="20%";
                        failButton.style.left="43.75%";
                        failButton.style.top="40%";
                    }
                    hiddenSheet.style.display="block";
                } else{
                    hiddenSheet.style.display="none";
                }
                if(!pause&&limitMove){
                    document.getElementById("movesLeft").style.display="block";
                    document.getElementById("moves").innerHTML=numMoves;
                } else{
                    document.getElementById("movesLeft").style.display="none";
                }
                //document.getElementById("hi").innerHTML+=sheetLocation+", ";
                drawCover();
                drawGame();
            },gameTime);
            //Use timer, slider for difficulty, each tile can be 1 sec, 0.5 sec, 5 sec, etc
            //Do red flag, and see if window.innerheight/width can help when screen is scolled down
            //Bug: can first use high tile size for more bomb, but then decrease tile size(maybe use setinterval to control max bombnum)
            //use explosives, press space bar to clear up 9 squares at once(maybe idea)
            //Can see if want to customize the location of the timenotification(fixed by clicking on timer working too)
            //can do minesweeper mode, use how many bombs in an area, not distance

            //Figure out how to make click on bomb again when discover with spacebar not work
            //Make grid mode so it's easier for the players to see each tile and where they are clicking

            //Cover mode randomly covers one side(left, right, top, bottom), so the user can't click on them(click space to manually change sheet position, three tries???)
            //Limited moves, shown on screen, move-bombnum, after moves run out, need to decided where the bombs are with spacebar
        
            //Multiplayer mode where there are two grids, each take turn, use hiddensheet to cover, flip coin)random) to decide who goes first
            //Can use space bar to decide multiplayer winner, see who gets bomb fastest