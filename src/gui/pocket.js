/**
 * @preserve
 *
 *                                      .,,,;;,'''..
 *                                  .'','...     ..',,,.
 *                                .,,,,,,',,',;;:;,.  .,l,
 *                               .,',.     ...     ,;,   :l.
 *                              ':;.    .'.:do;;.    .c   ol;'.
 *       ';;'                   ;.;    ', .dkl';,    .c   :; .'.',::,,'''.
 *      ',,;;;,.                ; .,'     .'''.    .'.   .d;''.''''.
 *     .oxddl;::,,.             ',  .'''.   .... .'.   ,:;..
 *      .'cOX0OOkdoc.            .,'.   .. .....     'lc.
 *     .:;,,::co0XOko'              ....''..'.'''''''.
 *     .dxk0KKdc:cdOXKl............. .. ..,c....
 *      .',lxOOxl:'':xkl,',......'....    ,'.
 *           .';:oo:...                        .
 *                .cd,      ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐    .
 *                  .l;     ║╣  │││ │ │ │├┬┘    '
 *                    'l.   ╚═╝─┴┘┴ ┴ └─┘┴└─   '.
 *                     .o.                   ...
 *                      .''''','.;:''.........
 *                           .'  .l
 *                          .:.   l'
 *                         .:.    .l.
 *                        .x:      :k;,.
 *                        cxlc;    cdc,,;;.
 *                       'l :..   .c  ,
 *                       o.
 *                      .,
 *
 *      ╦═╗┌─┐┌─┐┬  ┬┌┬┐┬ ┬  ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐  ╔═╗┬─┐┌─┐ ┬┌─┐┌─┐┌┬┐
 *      ╠╦╝├┤ ├─┤│  │ │ └┬┘  ║╣  │││ │ │ │├┬┘  ╠═╝├┬┘│ │ │├┤ │   │
 *      ╩╚═└─┘┴ ┴┴─┘┴ ┴  ┴   ╚═╝─┴┘┴ ┴ └─┘┴└─  ╩  ┴└─└─┘└┘└─┘└─┘ ┴
 *
 *
 * Created by Valentin on 10/22/14.
 *
 * Copyright (c) 2015 Valentin Heun
 * Modified by Valentin Heun 2014, 2015, 2016, 2017
 * Modified by Benjamin Reynholds 2016, 2017
 * Modified by James Hobin 2016, 2017
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

createNameSpace("realityEditor.gui.pocket");

realityEditor.gui.pocket.pocketButtonAction = function() {

	console.log("state: " + globalStates.pocketButtonState);

	if (globalStates.pocketButtonState === true) {
		console.log("buttonon");
		globalStates.pocketButtonState = false;

		if (globalStates.guiState === 'logic') {
		    realityEditor.gui.crafting.blockMenuVisible();
		}
	}
	else {
		console.log("buttonoff");
		globalStates.pocketButtonState = true;

		if (globalStates.guiState === 'logic') {
			realityEditor.gui.crafting.blockMenuHide();
            realityEditor.gui.menus.off("crafting",["logicPocket"]);
        }
	}

};

/*
realityEditor.gui.pocket.createLogicNodeFromPocket = function() {
    
    pocketItemId = realityEditor.device.utilities.uuidTime();
    console.log(pocketItemId);
    pocketItem["pocket"].frames["pocket"].nodes[pocketItemId] = new Logic();

    var thisItem = pocketItem["pocket"].frames["pocket"].nodes[pocketItemId];

    thisItem.objectId = "pocket";
    thisItem.frameId = "pocket";
    thisItem.uuid = pocketItemId;

    thisItem.x = globalStates.pointerPosition[0] - (globalStates.height / 2);
    thisItem.y = globalStates.pointerPosition[1] - (globalStates.width / 2);

    var closestObjectKey = realityEditor.gui.ar.getClosestObject()[0];
    var closestObject = realityEditor.getObject(closestObjectKey);

    thisItem.scale = closestObject ? closestObject.averageScale : globalStates.defaultScale;
    thisItem.screenZ = 1000;

    // else {
    // var matrixTouch =  screenCoordinatesToMatrixXY(thisItem, [evt.clientX,evt.clientY]);
    // thisItem.x = matrixTouch[0];
    // thisItem.y = matrixTouch[1];
    //}
    thisItem.loaded = false;

    var thisObject = pocketItem["pocket"];
    // this is a work around to set the state of an objects to not being visible.
    thisObject.objectId = "pocket";
    thisObject.name = "pocket";

    var thisFrame = thisObject.frames["pocket"];
    thisFrame.objectId = "pocket";
    thisFrame.name = "pocket";

    // thisObject.objectVisible = false;
    realityEditor.gui.ar.draw.setObjectVisible(thisObject, false); // TODO: should this function encapsulate the following 7 lines too?
    thisObject.screenZ = 1000;
    thisObject.fullScreen = false;
    thisObject.sendMatrix = false;
    thisObject.loaded = false;
    thisObject.integerVersion = 170;

    thisObject.type = 'logic';
    thisObject.matrix = [];
    thisObject.relativeMatrix = [];
    thisObject.nodes = {};
    // realityEditor.gui.ar.positioning.setPositionDataMatrix(thisObject, []);
    // if (thisObject.type === "node") {
    //     thisObject.relativeMatrix = [];
    // }
    // thisObject.matrix = [];
    // thisObject.nodes = {};
    thisObject.protocol = "R1";

    //
    //thisObject.visibleCounter = timeForContentLoaded;

    //addElement("pocket", pocketItemId, "nodes/" + thisItem.type + "/index.html",  pocketItem["pocket"], "logic",globalStates);
    
    var closestFrameKey = realityEditor.gui.ar.getClosestFrame()[1];

    realityEditor.gui.pocket.setPocketNode(thisItem, {pageX: globalStates.pointerPosition[0], pageY: globalStates.pointerPosition[1]}, closestObjectKey, closestFrameKey);

};
*/

realityEditor.gui.pocket.setPocketPosition = function(evt){
    
	if(pocketItem["pocket"].frames["pocket"].nodes[pocketItemId]){

		var thisItem = pocketItem["pocket"].frames["pocket"].nodes[pocketItemId];
		
		var pocketDomElement = globalDOMCache['object' + thisItem.uuid];
		if (!pocketDomElement) return; // wait until DOM element for this pocket item exists before attempting to move it

        var closestObjectKey = realityEditor.gui.ar.getClosestObject()[0];

		if (!closestObjectKey) {
		    
			thisItem.x = evt.clientX - (globalStates.height / 2);
			thisItem.y = evt.clientY - (globalStates.width / 2);
			
		} else {
		    
			if(thisItem.screenZ !== 2 && thisItem.screenZ) {
                
                var centerOffsetX = thisItem.frameSizeX / 2;
                var centerOffsetY = thisItem.frameSizeY / 2;
                
                realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(thisItem, evt.clientX - centerOffsetX, evt.clientY - centerOffsetY, false); // TODO: undo based on marker

			}
		}
		
	}
};

realityEditor.gui.pocket.setPocketFrame = function(frame, positionOnLoad, closestObjectKey) {
    pocketFrame.frame = frame;
    pocketFrame.positionOnLoad = positionOnLoad;
    pocketFrame.closestObjectKey = closestObjectKey;
};

realityEditor.gui.pocket.setPocketNode = function(node, positionOnLoad, closestObjectKey, closestFrameKey) {
    pocketNode.node = node;
    pocketNode.positionOnLoad = positionOnLoad;
    pocketNode.closestObjectKey = closestObjectKey;
    pocketNode.closestFrameKey = closestFrameKey;
};

/**
 * The Pocket button. Turns into a larger version or a delete button when
 * the user is creating memories or when the user is dragging saved
 * memories/programming blocks, respectively.
 */
(function(exports) {

    var pocket;
    var palette;
    var nodeMemoryBar;
    
    var inMemoryDeletion = false;
    // var pocketDestroyTimer = null;

    var realityElements = [
      
        /*{
            name: 'sensor-graph',
            width: 304,
            height: 304,
            nodes: [
                'value'
            ]
        },
        {
            name: 'sensor-linear',
            width: 204,
            height: 52,
            nodes: [
                'value'
            ]
        },
        {
            name: 'sensor-digital',
            width: 100,
            height: 100,
            nodes: [
                'value'
            ]
        },*/
        
        {
            name: 'twoSidedLimiter',
            width: 600,
            height: 600,
            nodes: [
                {name: 'in_out', type: "twoSidedLimiter"}
            ]
        },
        {
            name: 'limiter',
            width: 600,
            height: 600,
            nodes: [
                {name: 'in_out', type: "limiter"}
            ]
        },
        {
            name: 'switch',
            width: 570,
            height: 270,
            nodes: [
                {name: 'value', type: "node"}
            ]
        },
        
        {
            name: 'graphUI',
            width: 690,
            height: 410,
            nodes: [
                {name: 'value', type: "node"}
            ]
        },
        /*  {
            name: 'skyNews',
            width: 660,
            height: 430,
            nodes: [
                {name: 'play', type: "node"}
            ]
        },
        {
             name: 'ptcStockUI',
             width: 600,
             height: 500,
             nodes: [
             ]
         },
        {
             name: 'ptcTwitter',
             width: 400,
             height: 400,
             nodes: [
             ]
         },*/
        {
            name: 'draw',
            width: 600,
            height: 600,
            nodes: [
            ]
        },
          {
            name: 'slider',
            width: 206,
            height: 526,
            nodes: [
                {name: 'value', type: "node"}
            ]
        },
        {
            name: 'slider-2d',
            width: 526,
            height: 526,
            nodes: [
                {name: 'valueX', type: "node"},
                {name: 'valueY', type: "node"}
            ]
        }
    ];

    function pocketInit() {
        pocket = document.querySelector('.pocket');
        palette = document.querySelector('.palette');
        nodeMemoryBar = document.querySelector('.nodeMemoryBar');

        // On touching an element-template, upload to currently visible object
        pocket.addEventListener('pointerdown', function(evt) {
            
            if (!evt.target.classList.contains('element-template')) {
                return;
            }

            // TODO: only attach to closest object when you release - until then store in pocket and render with identity matrix
            // TODO: this would make it easier to drop exactly on the the object you want
            var closestObjectKey = realityEditor.gui.ar.getClosestObject()[0]; 
            var closestObject = realityEditor.getObject(closestObjectKey);
            
            // make sure that the frames only sticks to 2.0 server version
            if (closestObject && closestObject.integerVersion > 165) {

                var frame = new Frame();

                frame.objectId = closestObjectKey;
                
                // name the frame "gauge", "gauge2", "gauge3", etc... 
                frame.name = evt.target.dataset.name;
                var existingFrameSrcs = Object.keys(closestObject.frames).map(function(existingFrameKey){
                    return closestObject.frames[existingFrameKey].src;
                });
                var numberOfSameFrames = existingFrameSrcs.filter(function(src){
                    return src === evt.target.dataset.name;
                }).length;
                if (numberOfSameFrames > 0) {
                    frame.name = evt.target.dataset.name + (numberOfSameFrames+1);
                }
                
                console.log('created frame with name ' + frame.name);
                var frameName = frame.name + realityEditor.device.utilities.uuidTime();
                var frameID = frame.objectId + frameName;
                frame.uuid = frameID;
                frame.name = frameName;
                
                frame.ar.x = 0;
                frame.ar.y = 0;
                frame.ar.scale = globalStates.defaultScale; //closestObject.averageScale;
                frame.frameSizeX = evt.target.dataset.width;
                frame.frameSizeY = evt.target.dataset.height;

                // console.log("closest Frame", closestObject.averageScale);

                frame.location = 'global';
                frame.src = evt.target.dataset.name;

                // set other properties

                frame.animationScale = 0;
                frame.begin = realityEditor.gui.ar.utilities.newIdentityMatrix();
                frame.width = frame.frameSizeX;
                frame.height = frame.frameSizeY;
                console.log('created pocket frame with width/height' + frame.width + '/' + frame.height);
                frame.loaded = false;
                // frame.objectVisible = true;
                frame.screen = {
                    x: frame.ar.x,
                    y: frame.ar.y,
                    scale: frame.ar.scale
                };
                // frame.screenX = 0;
                // frame.screenY = 0;
                frame.screenZ = 1000;
                frame.temp = realityEditor.gui.ar.utilities.newIdentityMatrix();

                // thisFrame.objectVisible = false; // gets set to false in draw.setObjectVisible function
                frame.fullScreen = false;
                frame.sendMatrix = false;
                frame.sendAcceleration = false;
                frame.integerVersion = "3.0.0"; //parseInt(objects[objectKey].version.replace(/\./g, ""));
                // thisFrame.visible = false;

                // add each node with a non-empty name
                
              

                var nodes = JSON.parse(evt.target.dataset.nodes);
                var hasMultipleNodes = nodes.length > 1;
                nodes.forEach(function(node) {
              
                    if(typeof node !== "object") return;
                    var nodeUuid = frameID + node.name;
                    frame.nodes[nodeUuid] = new Node();
                    var addedNode = frame.nodes[nodeUuid];
                    addedNode.objectId = closestObjectKey;
                    addedNode.frameId = frameID;
                    addedNode.name = node.name;
                    addedNode.text = undefined;
                    addedNode.type = node.type;
                    addedNode.x = hasMultipleNodes ? realityEditor.device.utilities.randomIntInc(0, 200) - 100 : 0; // center if only one
                    addedNode.y = hasMultipleNodes ? realityEditor.device.utilities.randomIntInc(0, 200) - 100 : 0; // random otherwise
                    addedNode.frameSizeX = 220;
                    addedNode.frameSizeY = 220;
                    addedNode.scale = closestObject.averageScale;
                    console.log("closest Node", closestObject.averageScale);

                });
                
                frame.positionOnLoad = {
                    pageX: evt.pageX,
                    pageY: evt.pageY
                };

                // // set the eventObject so that the frame can interact with screens as soon as you add it
                realityEditor.device.eventObject.object = closestObjectKey;
                realityEditor.device.eventObject.frame = frameID;
                realityEditor.device.eventObject.node = null;

                closestObject.frames[frameID] = frame;

                console.log(frame);
                // send it to the server
                // realityEditor.network.postNewLogicNode(closestObject.ip, closestObjectKey, closestFrameKey, logicKey, addedLogic);
                realityEditor.network.postNewFrame(closestObject.ip, closestObjectKey, frame);
                
                realityEditor.gui.pocket.setPocketFrame(frame, {pageX: evt.pageX, pageY: evt.pageY}, closestObjectKey);

            } else {
                console.warn('there aren\'t any visible objects to place this frame on!');
            }
            
            pocketHide();
            
        });

        createPocketUIPalette();
		// pocketHide();
    }

    function isPocketWanted() {
        if (pocketShown()) {
            return true;
        }
        if (globalStates.settingsButtonState) {
            return false;
        }
        if (globalStates.editingNode) {
            return false;
        }
        if (inMemoryDeletion) {
            return false;
        }
        return globalStates.guiState === "ui" || globalStates.guiState === "node";
    }

    function onPocketButtonEnter() {
        if (!isPocketWanted()) {
            return;
        }

        if (pocketButtonIsBig()) {
            return;
        }

        if (!globalProgram.objectA) {
            return;
        }

        toggleShown();
    }

    function onPocketButtonUp() {
        if (!isPocketWanted()) {
            return;
        }

        if (pocketButtonIsBig()) {
            return;
        }

        toggleShown();
    }

    function onBigPocketButtonEnter() {
        if (!isPocketWanted()) {
            return;
        }

        if (!pocketButtonIsBig()) {
            return;
        }

        if (realityEditor.gui.memory.memoryCanCreate()) {
            realityEditor.gui.memory.createMemory();
            if (globalStates.guiState === "node") {
                globalStates.drawDotLine = false;
            }
        }

        toggleShown();
    }
    
    function onHalfPocketButtonEnter() {
        // if (!isPocketWanted()) {
        //     return;
        // }
        
        if (!pocketButtonIsHalf()) {
            return;
        }
        
        // TODO: add any side effects here before showing pocket
        var editingVehicle = realityEditor.device.getEditingVehicle();

        if (editingVehicle && editingVehicle.type === 'logic') {
            
            if (editingVehicle) {
                overlayDiv.classList.add('overlayLogicNode');

                var nameText = document.createElement('div');
                nameText.style.position = 'absolute';
                nameText.style.top = '33px';
                nameText.style.width = '100%';
                nameText.style.textAlign = 'center';
                nameText.innerHTML = editingVehicle.name;
                overlayDiv.innerHTML = '';
                overlayDiv.appendChild(nameText);
                
                overlayDiv.storedLogicNode = editingVehicle;
            }
        }
        
        if (pocketShown()) {
            // // TODO(ben): is there a better place to do this?
            overlayDiv.innerHTML = '';
            overlayDiv.classList.remove('overlayLogicNode');
        }
        
        toggleShown();
    }

    function pocketButtonIsBig() {
        return realityEditor.gui.menus.getVisibility('bigPocket');
    }
    
    function pocketButtonIsHalf() {
        return realityEditor.gui.menus.getVisibility('halfPocket');
    }

    function toggleShown() {
        if (pocketShown()) {
            pocketHide();
        } else {
            pocketShow();
        }
    }


    function pocketShow() {
        // console.log('pocketShow()', palette.innerHTML.trim());
        // if (palette.innerHTML.trim() === "") {
        //     createPocketUIPalette();
        //     clearTimeout(pocketDestroyTimer);
        // } else {
        //     clearTimeout(pocketDestroyTimer);
        // }
        
        pocket.classList.add('pocketShown');
        realityEditor.gui.menus.buttonOn('main', ['pocket']);
        if (globalStates.guiState === "node") {
            palette.style.display = 'none';
            nodeMemoryBar.style.display = 'block';
        } else {
            palette.style.display = 'block';
            nodeMemoryBar.style.display = 'none';
        }
        setPaletteElementDemo(true);
        realityEditor.gui.memory.nodeMemories.resetEventHandlers();
    }

    function setPaletteElementDemo(value) {
        // var paletteElements = document.querySelectorAll('.palette-element');
        // for (var i = 0; i < paletteElements.length; i++) {
        //     var elt = paletteElements[i];
        //     // TODO(hobinjk): stringify is not required except for legacy reasons
        //     elt.contentWindow.postMessage(JSON.stringify({demo: value}), '*');
        //     // elt.contentWindow.postMessage({demo: value}, '*');
        //
        // }
    }

    function pocketHide() {
        // palette.style.display = 'none';
        // pocketDestroyTimer = setTimeout(function() {
        //     palette.innerHTML = "";
        //     // remove touch event from dragged frame if needed
        //     if (globalStates.pocketEditingMode) {
        //         var fakeEvent = { currentTarget: document.getElementById(globalStates.editingFrame) };
        //         realityEditor.device.onTrueTouchUp(fakeEvent);
        //     }
        // }, 5000);
        pocket.classList.remove('pocketShown');
        realityEditor.gui.menus.buttonOff('main', ['pocket']);
        setPaletteElementDemo(false);
    }

    function pocketShown() {
        return pocket.classList.contains('pocketShown');
    }

    function createPocketUIPalette() {
        palette = document.querySelector('.palette');
        for (var i = 0; i<realityElements.length; i++){
            var element = realityElements[i];
            var container = document.createElement('div');
            container.classList.add('element-template');
            container.id = 'pocket-element';
            // container.position = 'relative';
            var thisUrl = 'frames/' + element.name + '.html';
            var gifUrl = 'frames/pocketAnimations/' + element.name + '.gif';
            container.dataset.src = thisUrl;

            container.dataset.name = element.name;
            container.dataset.width = element.width;
            container.dataset.height = element.height;
            container.dataset.nodes = JSON.stringify(element.nodes);
            
            var elt = document.createElement('img');
            elt.classList.add('palette-element');
            // elt.style.width = element.width + 'px';
            // elt.style.height = element.height + 'px';
            // elt.style.width = '100%'; //container.offsetWidth + 'px'; // paletteElementSize + 'px'; //container.offsetWidth; //'100%';
            // elt.style.height = '100%'; container.offsetHeight + 'px'; // paletteElementSize + 'px'; // container.offsetHeight; //'100%';
            elt.src = gifUrl;

            container.appendChild(elt);
            palette.appendChild(container);

            var paletteElementSize = Math.floor(parseFloat(window.getComputedStyle(container).width)) - 6;

            // var scale = Math.min(
            //     paletteElementSize / (element.width),
            //     paletteElementSize / (element.height),
            //     1
            // );

            // var scale = Math.min(
            //     paletteElementSize / (elt.naturalWidth),
            //     paletteElementSize / (elt.naturalHeight),
            //     1
            // );
            
            var ICON_SIZE = 204;
            // var scale = paletteElementSize / elt.naturalWidth;
            var scale = paletteElementSize / ICON_SIZE;

            elt.style.transform = 'scale(' + scale + ')';

            // var offsetX = (paletteElementSize - element.width * scale) / 2;
            // var offsetY = (paletteElementSize - element.height * scale) / 2;

            // elt.style.marginTop = offsetY + 'px';
            // elt.style.marginLeft = offsetX + 'px';
        }
    }

    exports.pocketInit = pocketInit;
    exports.pocketShown = pocketShown;
    exports.pocketShow = pocketShow;
    exports.pocketHide = pocketHide;
    
    exports.onPocketButtonEnter = onPocketButtonEnter;
    exports.onPocketButtonUp = onPocketButtonUp;
    exports.onBigPocketButtonEnter = onBigPocketButtonEnter;
    exports.onHalfPocketButtonEnter = onHalfPocketButtonEnter;

}(realityEditor.gui.pocket));
