var APP = {
	level : 0,
	bounceDelay : 350,
	sizeW : 100,
	sizeH : 100,	
	uniteW : 0,
	uniteH : 0,
	subdivision : 6,
	offsetX : 0,
	offsetY : 0,
	unikId : 0,
	grille : {},
	busyGride : [],
	plateau : null,
	dragging : false,
	move_count : 0,
	is_touch_device : false,
	oldPosition : {
		x : 0, 
		y : 0
	},
	
	initGame : function(){
		console.log("Init Game");
		
		APP.plateau = $('#plateau');
		$(APP.plateau).css({width: APP.sizeW, height: APP.sizeH});
		
		APP.sizeW = $('#plateau').width();
		APP.sizeH = $('#plateau').height();
	
		APP.uniteW = APP.sizeW / APP.subdivision;
		APP.uniteH = APP.sizeH / APP.subdivision;
		
		APP.offsetX = $(APP.plateau).offset().left;
		APP.offsetY = $(APP.plateau).offset().top;
		
		for(var i in APP.grille){
			delete(APP.grille[i]);
		}
		
		return true;
	},
	
	getLevel : function(level){
		APP.JSONGameBlocks = null;
		APP.level = level;
		/* Warning : test sans serveur impossible avec getJSON
		$.getJSON("json/level1.json?callback=?", function(data){
			APP.JSONGameBlocks = data;
			APP.drawGame();
			$('#bestscore').html(APP.JSONGameBlocks.game.best);
		});
		*/
		APP.JSONGameBlocks = jsonFile;
		$('#bestscore').html(APP.JSONGameBlocks.game[level].best);
		APP.drawGame(level);
		
		return true;
	},
	
	drawGame : function(level){
		var self = this;
		console.log("Draw Game");
		
		// Delete all blocks
		$('.bloc').remove();
		
		for(i in APP.JSONGameBlocks.game[level].blocks){
			var id = self.drawBloc(APP.JSONGameBlocks.game[level].blocks[i]);
			APP.JSONGameBlocks.game[level].blocks[i].elem = $('.monBloc'+id);
			APP.grille[id] = APP.JSONGameBlocks.game[level].blocks[i];
		}
		APP.fillBusyGride();
		
		// On positionne le tableau des résultats
		$('#informations').css({'top': APP.offsetY, 'left' : $('#plateau').offset().left + $('#plateau').width()});
		
		
		return true;
	}, 
	
	drawBloc : function(bloc){
		var className = 'monBloc' + APP.unikId;
		var winner = bloc.winner ? ' winner' : '';
		var monBloc = '<div class="bloc ' + className + winner + '" data-id="' + APP.unikId + '"/>';
		var left = bloc.position.x * APP.uniteW ;//+ APP.offsetX;
		var top = bloc.position.y * APP.uniteH ;//+ APP.offsetY;
		var width = bloc.sens ? bloc.size * APP.uniteW: APP.uniteW;
		var height = !bloc.sens ? bloc.size * APP.uniteH: APP.uniteH;
		$(APP.plateau).append(monBloc);
		$('.' + className).css({left:left, top:top, width:width, height:height});
		return APP.unikId++;
	},
	
	initEvents : function(){
		console.log("Init Events");
		APP.is_touch_device = 'ontouchstart' in document.documentElement;
		console.log("IS TOUCH = " + APP.is_touch_device);
		
		$(document).on({
			'mousedown' : function(evt){
				APP.mouseDown(evt);
			}, 
			'mouseup' : function(evt){
				APP.mouseUp(evt);
			},
			'mousemove' : function (evt){
				APP.mouseMove(evt);
			}
		});
		
		APP.is_touch_device && $('#game').hammer({
            prevent_default: false
	   }).on({
			'dragstart' : function(evt){
				evt.preventDefault();
				APP.mouseDown(evt);
			}, 
			'dragend' : function(evt){
				evt.preventDefault();
				APP.mouseUp(evt);
			},
			'drag' : function (evt){
				evt.preventDefault();
				APP.mouseMove(evt);
			}
		});
		
		$(window).on({
			'resize' : function (evt){
				console.log("resze");
				APP.resizePage(evt);
			}
		})
		
		return true;
	},
	
	mouseDown : function(evt){
		evt = APP.is_touch_device && evt.originalEvent ? evt.originalEvent : evt; 
		if(!$(evt.target).hasClass('bloc')){
			return;
		}
		//APP.drag_elem = evt.target;
		APP.currentMove = {"drag_elem" : evt.target};
		APP.dragging = true;
	    APP.oldPosition.x = evt.pageX;
		APP.oldPosition.y = evt.pageY;
		APP.getMinMaxPosition(APP.currentMove.drag_elem);
	    return false;
	},
	
	mouseUp : function(evt){
		evt = APP.is_touch_device && evt.originalEvent ? evt.originalEvent : evt;  
		console.log("End Drag");
		APP.dragging = false;
		//APP.collision = false;
		APP.currentMove && APP.currentMove.drag_elem && APP.moveToNearPosition(APP.currentMove.drag_elem);
		delete(APP['currentMove']);
	    return false;
	},
	
	mouseMove : function(evt){
		evt = APP.is_touch_device && evt.originalEvent ? evt.originalEvent : evt; 
		if(APP.dragging && APP.currentMove.drag_elem){
			var self = this;
			APP.move(APP.currentMove.drag_elem, evt.pageX, evt.pageY);
		}
		return true;
	},
	
	move : function(elem, posX, posY){
		var deltaX = APP.oldPosition.x - posX;
		var deltaY = APP.oldPosition.y - posY;
		
		// get DOM element
		var id = $(elem).attr('data-id');
		var bloc = APP.grille[id];
		
		if(bloc.sens){							// Move object horizontaly
			var nextPos = ($(elem).offset().left << 0) - deltaX - APP.offsetX;
			
			if(nextPos > APP.currentMove.maxRealX){
				nextPos = APP.currentMove.maxRealX;
			} else if(nextPos < APP.currentMove.minRealX){
				nextPos = APP.currentMove.minRealX;
			}
			$(elem).css('left', nextPos);
		} else {								// Move object vertically
			var nextPos = ($(elem).offset().top << 0) - deltaY - APP.offsetY;
			
			if(nextPos > APP.currentMove.maxRealY){
				nextPos = APP.currentMove.maxRealY;
			} else if(nextPos < APP.currentMove.minRealY){
				nextPos = APP.currentMove.minRealY;
			}
			$(elem).css('top', nextPos);
		}
		
		APP.oldPosition.x = posX
		APP.oldPosition.y = posY;
		
		return true;
	},
	
	getBlocByElem : function(elem){
		var id = $(elem).attr('data-id');
		var bloc = APP.grille[id];
		return bloc;
	},
	
	getElemByBloc : function(bloc){
		return bloc.elem;
	},
	
	getMinMaxPosition : function(elem){
		var block = APP.getBlocByElem(elem);
		return block.sens == 1 ? APP.getHorizontalBounds(elem, block) : APP.getVerticalBounds(elem, block);
	},
	
	getHorizontalBounds : function(elem, block){
		var minX = block.position.x;
		var maxX = block.position.y;
		var newBound = false;
		
		// Limite à droite
		newBound = false;
		for(var i=block.position.x + block.size; i < APP.subdivision; i++ ){
			if(APP.busyGride[i][block.position.y] == 1){
				maxX = i - block.size;
				newBound = true;
				break;
			}
		}
		if(!newBound){
			if(block.winner){
				maxX = APP.subdivision;
			} else {
				maxX = APP.subdivision - block.size;
			}
		}
		
		// Limite à gauche
		newBound = false;
		if(block.position.x > 0 && APP.busyGride[block.position.x - 1][block.position.y] != 1){
			for(var i=block.position.x - 1; i >= 0; i-- ){
				if(APP.busyGride[i][block.position.y] == 1){
					minX = i + 1;
					newBound = true;
					break;
				}
			}
			if(!newBound){
				minX = 0;
			}
		} else {
			minX = block.position.x;
		}
		
		APP.currentMove.minGridX = minX;
		APP.currentMove.maxGridX = maxX;
		APP.currentMove.minRealX = minX * APP.uniteW;
		APP.currentMove.maxRealX = maxX * APP.uniteW;
		return true;
	},
	
	getVerticalBounds : function(elem, block){
		var minY = 0;
		var maxY = APP.subdivision - block.size;
		
		// Limite en bas
		for(var i=block.position.y + block.size; i < APP.subdivision; i++ ){
			if(APP.busyGride[block.position.x][i] == 1){
				maxY = i - block.size;
				break;
			}
		}
		
		// Limite en haut
		newBound = false;
		if(block.position.y > 0 && APP.busyGride[block.position.x][block.position.y - 1] != 1){
			for(var i=block.position.y - 1 ; i >= 0; i-- ){
				if(APP.busyGride[block.position.x][i] == 1){
					minY = i + 1;
					newBound = true;
					break;
				}
			}
			if(!newBound){
				minY = 0;
			}
		} else {
			minY = block.position.y;
		}
		
		APP.currentMove.minGridY = minY;
		APP.currentMove.maxGridY = maxY;
		APP.currentMove.minRealY = minY * APP.uniteH;
		APP.currentMove.maxRealY = maxY * APP.uniteH;
		return true;
	},
	
	getGridPositionX : function(currPosX){
		var minDiff = APP.sizeW;
		var minCur = 0;
		
		for(var i = APP.sizeW ; i >= 0; i-=APP.uniteW){
			if(Math.abs(currPosX - i) < minDiff){
				minDiff = Math.abs(currPosX - i);
				minCur = i;
			}
		}
		var position = { "grid_pos" : minCur / APP.uniteW, "real_pos" : minCur, "delta" : Math.abs(minCur - currPosX) };
		return position;
	},
	
	moveToNearPosition : function(elem){
		var block = APP.getBlocByElem(elem);
		APP.updateMoveCount();
		return block.sens == 1 ? APP.moveToNearXPosition(elem) : APP.moveToNearYPosition(elem);
	},
	
	moveToNearXPosition : function(elem){
		// Move to the near fixed position
		var curr_pos = $(elem).offset().left - APP.offsetX;
		var minDiff = APP.sizeW;
		var minCur = 0;
		var id = $(elem).attr('data-id');
		
		if(curr_pos > APP.uniteW / 2){
			for(var i = APP.sizeW ; i >= 0; i-=APP.uniteW){
				if(Math.abs(curr_pos - i) < minDiff){
					minDiff = Math.abs(curr_pos - i);
					minCur = i;
				}
			}
		} else {
			minCur = 0;
		}
		// Update bloc position on the grid
		APP.grille[id].position.x = Math.round(minCur / APP.uniteW);
		
		/* YOU WIN
		if(APP.grille[id].position.x > APP.uniteW){
			
		}
		*/
		APP.fillBusyGride();
		
		$(elem).stop().animate({
			left: minCur
		}, APP.bounceDelay, "easeOutElastic");
		return true;	},
	
	moveToNearYPosition : function(elem){
		// Move to the near fixed position
		var curr_pos = $(elem).offset().top - APP.offsetY;
		var minDiff = APP.sizeW;
		var minCur = 0;
		var id = $(elem).attr('data-id');
		
		if(curr_pos > APP.uniteH / 2){
			for(var i = APP.sizeH ; i >= 0; i-=APP.uniteH){
				if(Math.abs(curr_pos - i) < minDiff){
					minDiff = Math.abs(curr_pos - i);
					minCur = i;
				}
			}
		} else {
			minCur = 0;
		}
		// Update bloc position on the grid
		APP.grille[id].position.y = Math.round(minCur / APP.uniteH);
		APP.fillBusyGride();
		
		$(elem).stop().animate({
			top: minCur
		}, APP.bounceDelay, "easeOutElastic");
		return true;
	},
	
	fillBusyGride : function(){
		APP.busyGride = new Array(APP.subdivision);
		var isWin = false;
		for(var i = 0 ; i < APP.subdivision; i++){
			APP.busyGride[i] = new Array(APP.subdivision);
		}
		
		for(bl in APP.grille){
			var blockTmp = APP.grille[bl]
			if(blockTmp.sens){
				try{
					for(var i = blockTmp.position.x; i < blockTmp.position.x + blockTmp.size; i++){
						APP.busyGride[i][blockTmp.position.y] = 1;
					}
				} catch(e){
					if(APP.move_count > 0){
						isWin = true;
					}
				}
			} else{
				for(var i = blockTmp.position.y; i < blockTmp.position.y + blockTmp.size; i++){
					APP.busyGride[blockTmp.position.x][i] = 1;
				}
			}
		}
		
		isWin && APP.nextLevel();
		isWin = false;
		
		return true;
	},
	
	nextLevel : function(){
		alert("Le mot de passe du niveau est : " + APP.JSONGameBlocks.game[APP.level].pass);
		
		APP.initGame();
		APP.getLevel(APP.level+1);
	},
	
	resizePage : function (evt){
		console.log("Resize Event ");
		var width = $(window).innerWidth();
		var height = $(window).innerHeight();
		var ratio = width / height;
		
		// Calculs à fare en foncton du ratio de la page
		if(width > height){
			APP.sizeW = height - 10;
			APP.sizeH = height - 10;
		} else {
			APP.sizeW = width - 10;
			APP.sizeH = width - 10;
		}

		APP.initGame();
		APP.drawGame(APP.level);
		
		
	},
	
	updateMoveCount : function(){
		APP.move_count ++;
		$('#move_count').html(APP.move_count);
	}
};


$(document).ready(function() {
	$.event.props.push('dataTransfer');
	APP.initGame();
	APP.getLevel(0);

	APP.initEvents();
	APP.resizePage();
});

