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

createNameSpace("realityEditor.device");

/**
 * @fileOverview realityEditor.device.index.js
 * Implements the touch event handlers for all major AR user interactions,
 * keeping track of the editingState and modifying state of Objects, Frames, and Nodes as necessary.
 */

/**
 * @typedef {Object} TouchEditingTimer
 * @desc All the necessary state to track a tap-and-hold gesture that triggers a timeout callback.
 * @property {number} startX
 * @property {number} startY
 * @property {number} moveTolerance
 * @property {Function} timeoutFunction 
 */

/**
 * @type {TouchEditingTimer|null}
 */
realityEditor.device.touchEditingTimer = null;

/**
 * @type {number} How long in ms you need to tap and hold on a frame to start moving it.
 */
realityEditor.device.defaultMoveDelay = 400;

/**
 * @type {Array.<string>} List of each current touch on the screen, using the id of the touch event target.
 */
realityEditor.device.currentScreenTouches = [];

/**
 * @typedef {Object} EditingState
 * @desc All the necessary state about what's currently being repositioned. Everything else can be calculated from these.
 * @property {string|null} object - objectId of the selected vehicle
 * @property {string|null} frame - frameId of the selected vehicle
 * @property {string|null} node - nodeIf of the selected node (null if vehicle is a frame, not a node)
 * @property {{x: number, y: number}|null} touchOffset - relative position of the touch to the vehicle when you start repositioning
 * @property {boolean} unconstrained - iff the current reposition is temporarily unconstrained (globalStates.unconstrainedEditing is used for permanent unconstrained repositioning)
 * @property {number|null} unconstrainedOffset - initial z distance to the repositioned vehicle, used for calculating popping into unconstrained
 * @property {Array.<number>|null} startingMatrix - stores the previous vehicle matrix while unconstrained editing, so that it can be returned to its original position if dropped in an invalid location
 * @property {boolean} unconstrainedDisabled - iff unconstrained is temporarily disabled (e.g. if changing distance threshold)
 * @property {boolean} preDisabledUnconstrained - the unconstrained state before we disabled, so that we can go back to that when we're done
 * @property {boolean} pinchToScaleDisabled - iff pinch to scale is temporarily disabled (e.g. if changing distance threshold)
 */

/**
 * @type {EditingState}
 */
realityEditor.device.editingState = {
    object: null,
    frame: null,
    node: null,
    touchOffset: null,
    unconstrained: false,
    unconstrainedOffset: null,
    startingMatrix: null,
    unconstrainedDisabled: false
};

/**
 * @type {CallbackHandler}
 */
realityEditor.device.callbackHandler = new realityEditor.moduleCallbacks.CallbackHandler('device/index');

/**
 * Adds a callback function that will be invoked when the specified function is called
 * @param {string} functionName
 * @param {function} callback
 */
realityEditor.device.registerCallback = function(functionName, callback) {
    if (!this.callbackHandler) {
        this.callbackHandler = new realityEditor.moduleCallbacks.CallbackHandler('device/index');
    }
    this.callbackHandler.registerCallback(functionName, callback);
};

/**
 * Initialize the device module by registering callbacks to other modules
 */
realityEditor.device.initFeature = function() {

    realityEditor.gui.buttons.registerCallbackForButton('gui', resetEditingOnButtonUp);
    realityEditor.gui.buttons.registerCallbackForButton('logic', resetEditingOnButtonUp);
    realityEditor.gui.buttons.registerCallbackForButton('setting', resetEditingOnButtonUp);
    
    function resetEditingOnButtonUp(params) {
        if (params.newButtonState === 'up') {
            realityEditor.device.resetEditingState();
        }
    }
    
};

/**
 * Sets the global editingMode and updates the svg overlay visibility for frames and nodes.
 * @param {boolean} newEditingMode
 */
realityEditor.device.setEditingMode = function(newEditingMode) {
    globalStates.editingMode = newEditingMode;
    
    // also turn off unconstrained
    if (!newEditingMode) {
        globalStates.unconstrainedPositioning = false;
    }
    
    // TODO: how will svg overlays update when toggle between frames and nodes?
    
    // var newDisplay = newEditingMode ? 'inline' : 'none';
    realityEditor.forEachFrameInAllObjects(function(objectKey, frameKey) {
        var svg = document.getElementById('svg' + frameKey);
        if (svg && globalStates.guiState === "ui") {  // don't show green outline for frames if in node view
            // svg.style.display = newDisplay;
            if (newEditingMode) {
                svg.classList.add('visibleEditingSVG');
            } else {
                svg.classList.remove('visibleEditingSVG');
            }
        }
        realityEditor.forEachNodeInFrame(objectKey, frameKey, function(objectKey, frameKey, nodeKey) {
            svg = document.getElementById('svg' + nodeKey);
            if (svg) {
                // svg.style.display = newDisplay;
                if (newEditingMode) {
                    svg.classList.add('visibleEditingSVG');
                } else {
                    svg.classList.remove('visibleEditingSVG');
                }
            }
        });
    });
    
};

/**
 * Returns the frame or node that is currently being edited, if one exists.
 * @return {Frame|Node|null}
 */
realityEditor.device.getEditingVehicle = function() {
    return realityEditor.getVehicle(this.editingState.object, this.editingState.frame, this.editingState.node);
};

/**
 * Returns true iff the vehicle is the active editing vehicle, and being unconstrained edited
 * @param {Frame|Node} vehicle
 * @return {boolean}
 */
realityEditor.device.isEditingUnconstrained = function(vehicle) {
    if (vehicle === this.getEditingVehicle() && (realityEditor.device.editingState.unconstrained || globalStates.unconstrainedPositioning) && !realityEditor.device.editingState.unconstrainedDisabled) {
        // staticCopy frames cannot be unconstrained edited
        if (typeof vehicle.staticCopy !== 'undefined') {
            if (vehicle.staticCopy) {
                return false;
            }
        }
        // only frames and logic nodes can be unconstrained edited
        return realityEditor.gui.ar.positioning.isVehicleUnconstrainedEditable(vehicle);
    }
    return false;
};

/**
 * Finds the closest frame to the camera and moves the pocket node from the pocketItem storage to that frame.
 * @param {Logic} pocketNode
 */
realityEditor.device.addPocketNodeToClosestFrame = function(pocketNode) {

    // find the closest frame
    var closestKeys = realityEditor.gui.ar.getClosestFrame();
    var closestObjectKey = closestKeys[0];
    var closestFrameKey = closestKeys[1];

    // TODO: look up why it can't equal 2... it might not be correct anymore
    if (closestFrameKey && pocketNode.screenZ && pocketNode.screenZ !== 2) {
        
        // update the pocket node with values from its new parent frame
        pocketNode.objectId = closestObjectKey;
        pocketNode.frameId = closestFrameKey;

        // set the name of the node by counting how many logic nodes the frame already has
        var closestFrame = realityEditor.getFrame(closestObjectKey, closestFrameKey);
        var logicCount = Object.values(closestFrame.nodes).filter(function (node) {
            return node.type === 'logic'
        }).length;
        pocketNode.name = "LOGIC" + logicCount;
        
        // make sure that logic nodes only stick to 2.0 server version
        if (realityEditor.network.testVersion(closestObjectKey) > 165) {

            // add the node to that frame
            closestFrame.nodes[pocketItemId] = pocketNode;

            // post the new object/frame/node keys into the existing iframe
            var pocketNodeIframe = document.getElementById("iframe" + pocketItemId);
            if (pocketNodeIframe && pocketNodeIframe.loaded) {
                realityEditor.network.onElementLoad(closestObjectKey, closestFrameKey, pocketItemId);
            }

            globalDOMCache[pocketItemId].objectId = closestObjectKey;
            globalDOMCache[pocketItemId].frameId = closestFrameKey;

            globalDOMCache['iframe' + pocketItemId].setAttribute("data-object-key", closestObjectKey);
            globalDOMCache['iframe' + pocketItemId].setAttribute("data-frame-key", closestFrameKey);
            globalDOMCache['iframe' + pocketItemId].setAttribute("onload", 'realityEditor.network.onElementLoad("' + closestObjectKey + '","' + closestFrameKey + '","' + pocketItemId + '")');

            // post new object, frame, node, name into the logicNode iframe
            realityEditor.network.onElementLoad(closestObjectKey, closestFrameKey, pocketItemId);
            
            // upload it to the server
            realityEditor.network.postNewLogicNode(objects[closestObjectKey].ip, closestObjectKey, closestFrameKey, pocketItemId, pocketNode);

            // realityEditor.network.postNewNodeName(objects[closestObjectKey].ip, closestObjectKey, closestFrameKey, pocketItemId, pocketNode.name);
        }

    }

    realityEditor.gui.ar.draw.hideTransformed(pocketItemId, pocketNode, globalDOMCache, cout);
    delete pocketItem["pocket"].frames["pocket"].nodes[pocketItemId];
};

/**
 * Don't post touches into the iframe if any are true:
 * 1. we're in editing mode
 * 2. we're dragging the current vehicle around, or
 * 3. we're waiting for the touchEditing timer to either finish or be cleared by moving/releasing
 * @return {boolean}
 */
realityEditor.device.shouldPostEventsIntoIframe = function() {
    var editingVehicle = this.getEditingVehicle();
    return !(globalStates.editingMode || editingVehicle /*|| this.touchEditingTimer */); // TODO: pointerup never gets posted if this last isnt commented out... was it doing anything?
};

/**
 * Post a fake PointerEvent into the provided frame or node's iframe.
 * @param {PointerEvent} event
 * @param {string} frameKey
 * @param {string|undefined} nodeKey
 */
realityEditor.device.postEventIntoIframe = function(event, frameKey, nodeKey) {
    var iframe = document.getElementById('iframe' + (nodeKey || frameKey));
    var newCoords = webkitConvertPointFromPageToNode(iframe, new WebKitPoint(event.pageX, event.pageY));
    iframe.contentWindow.postMessage(JSON.stringify({
        event: {
            type: event.type,
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            x: newCoords.x,
            y: newCoords.y
        }
    }), '*');
};

/**
 * Stop and reset the touchEditingTimer if it's in progress.
 */
realityEditor.device.clearTouchTimer = function() {
    if (this.touchEditingTimer) {
        clearTimeout(this.touchEditingTimer.timeoutFunction);
        this.touchEditingTimer = null;
    }
};

/**
 * Reset all state related to the link being created.
 */
realityEditor.device.resetGlobalProgram = function() {
    globalProgram.objectA = false;
    globalProgram.frameA = false;
    globalProgram.nodeA = false;
    globalProgram.logicA = false;
    globalProgram.objectB = false;
    globalProgram.frameB = false;
    globalProgram.nodeB = false;
    globalProgram.logicB = false;
    globalProgram.logicSelector = 4;
};

/**
 * Reset full editing state so that no object is set as being edited.
 */
realityEditor.device.resetEditingState = function() {
    this.sendEditingStateToFrameContents(this.editingState.frame, false); // TODO: move to a callback

    // gets triggered before state gets reset, so that subscribed modules can respond based on what is about to be reset
    this.callbackHandler.triggerCallbacks('resetEditingState');

    this.editingState.object = null;
    this.editingState.frame = null;
    this.editingState.node = null;
    this.editingState.touchOffset = null;
    this.editingState.unconstrained = false;
    this.editingState.unconstrainedOffset = null;
    this.editingState.startingMatrix = null;
    
};

/**
 * Sets up the PointerEvent and TouchEvent listeners for the entire document.
 * (now includes events that used to take effect on the background canvas)
 */
realityEditor.device.addDocumentTouchListeners = function() {
    document.addEventListener('pointerdown', this.onDocumentPointerDown.bind(this));
    document.addEventListener('pointermove', this.onDocumentPointerMove.bind(this));
    document.addEventListener('pointerup', this.onDocumentPointerUp.bind(this));
    
    if (realityEditor.device.utilities.isDesktop()) {
        document.addEventListener('mousedown', this.onDocumentMultiTouchStart.bind(this));
        document.addEventListener('mousemove', this.onDocumentMultiTouchMove.bind(this));
        document.addEventListener('mouseup', this.onDocumentMultiTouchEnd.bind(this));
        // document.addEventListener('touchcancel', this.onDocumentMultiTouchEnd.bind(this));
    } else {
        document.addEventListener('touchstart', this.onDocumentMultiTouchStart.bind(this));
        document.addEventListener('touchmove', this.onDocumentMultiTouchMove.bind(this));
        document.addEventListener('touchend', this.onDocumentMultiTouchEnd.bind(this));
        document.addEventListener('touchcancel', this.onDocumentMultiTouchEnd.bind(this));
    }
};

/**
 * Sets up PointerEvent and TouchEvent listeners for the provided frame or node's DOM element.
 * @param {HTMLElement} overlayDomElement
 * @param {Frame|Node} activeVehicle
 */
realityEditor.device.addTouchListenersForElement = function(overlayDomElement, activeVehicle) {

    // use PointerEvents for movement events except for dragging
    overlayDomElement.addEventListener('pointerdown', this.onElementTouchDown.bind(this));
    overlayDomElement.addEventListener('pointermove', this.onElementTouchMove.bind(this));
    overlayDomElement.addEventListener('pointerup', this.onElementTouchUp.bind(this));

    if (realityEditor.device.utilities.isDesktop()) {
        // use TouchEvents for dragging because it keeps its original target even if you leave the bounds of the target
        overlayDomElement.addEventListener('mouseup', this.onElementMultiTouchEnd.bind(this));
        // overlayDomElement.addEventListener('touchcancel', this.onElementMultiTouchEnd.bind(this));
    } else {
        // use TouchEvents for dragging because it keeps its original target even if you leave the bounds of the target
        overlayDomElement.addEventListener('touchend', this.onElementMultiTouchEnd.bind(this));
        overlayDomElement.addEventListener('touchcancel', this.onElementMultiTouchEnd.bind(this));
    }
    
    // give enter and leave events to nodes for when you draw links between them
    if (activeVehicle.type !== 'ui') {
        overlayDomElement.addEventListener('pointerenter', this.onElementTouchEnter.bind(this));
        overlayDomElement.addEventListener('pointerout', this.onElementTouchOut.bind(this));
    }
};

/**
 * Set the specified frame or node as the editingMode target and update the UI.
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string|undefined} nodeKey
 */
realityEditor.device.beginTouchEditing = function(objectKey, frameKey, nodeKey) {
    
    var activeVehicle = realityEditor.getVehicle(objectKey, frameKey, nodeKey);

    // if you're already editing another object (or can't find this one) don't let you start editing this one
    if (this.editingState.object || !activeVehicle) { return; }

    this.editingState.object = objectKey;
    this.editingState.frame = frameKey;

    if (globalStates.guiState === "node") {
        this.editingState.node = nodeKey;
        
        realityEditor.gui.ar.draw.pushEditedNodeToFront(nodeKey);
        
        // reset link creation state
        this.resetGlobalProgram();

        // show the trash and pocket
        if (activeVehicle.type === "logic") {
            realityEditor.gui.menus.switchToMenu("trashOrSave"); // TODO: use this to enable logic node pocket again
            // realityEditor.gui.menus.switchToMenu("bigTrash");

        }

    } else if (globalStates.guiState === "ui") {

        realityEditor.gui.ar.draw.pushEditedFrameToFront(frameKey);

        if (activeVehicle.location === "global") {
            // show the trash if this is a reusable frame
            realityEditor.gui.menus.switchToMenu("bigTrash");            
        }

    }

    // move element to front of nodes or frames so that touches don't get blocked by other nodes
    // var element = document.getElementById('object' + (nodeKey || frameKey));
    // if (element) {
    //     while(element.nextElementSibling && element.nextElementSibling.id !== 'craftingBoard') {
    //         element.parentNode.insertBefore(element.nextElementSibling, element); // TODO: this doesn't actually work with 3d transforms involved
    //     }
    // }
    
    realityEditor.gui.ar.draw.matrix.copyStillFromMatrixSwitch = true;

    realityEditor.device.editingState.startingMatrix = realityEditor.gui.ar.utilities.copyMatrix(realityEditor.gui.ar.positioning.getPositionData(activeVehicle).matrix);

    // document.getElementById('svg' + (nodeKey || frameKey)).style.display = 'inline';
    document.getElementById('svg' + (nodeKey || frameKey)).classList.add('visibleEditingSVG');
    
    this.sendEditingStateToFrameContents(frameKey, true);

    this.callbackHandler.triggerCallbacks('beginTouchEditing');
};

// post beginTouchEditing and endTouchEditing event into frame so that 3d object can highlight to show move-ability
realityEditor.device.sendEditingStateToFrameContents = function(frameKey, frameIsMoving) {
    if (!frameKey) return;
    var iframe = document.getElementById('iframe' + frameKey);
    if (!iframe) return;
    
    iframe.contentWindow.postMessage(JSON.stringify({
        frameIsMoving: frameIsMoving
    }), '*');
};

realityEditor.device.enableUnconstrained = function() {
    
    // only do this once, otherwise it will undo the effects of saving the previous value
    if (this.editingState.unconstrainedDisabled) {
        if (typeof this.editingState.preDisabledUnconstrained !== "undefined") {
            this.editingState.unconstrained = this.editingState.preDisabledUnconstrained;
            delete this.editingState.preDisabledUnconstrained; // get only works once per set
        } else {
            this.editingState.unconstrained = false;
        }
    }
    this.editingState.unconstrainedDisabled = false;
    this.editingState.unconstrainedOffset = null;
};

realityEditor.device.disableUnconstrained = function() {
    this.editingState.unconstrainedDisabled = true;
    this.editingState.preDisabledUnconstrained = this.editingState.unconstrained;
    this.editingState.unconstrained = false;
};

realityEditor.device.enablePinchToScale = function() {
    this.editingState.pinchToScaleDisabled = false;
};

realityEditor.device.disablePinchToScale = function() {
    this.editingState.pinchToScaleDisabled = true;
};

/**
 * Begin the touchTimer to enable editing mode if the user doesn't move too much before it finishes.
 * Also set point A of the globalProgram so we can start creating a link if this is a node.
 * @param {PointerEvent} event
 */
realityEditor.device.onElementTouchDown = function(event) {
    var target = event.currentTarget;
    var activeVehicle = realityEditor.getVehicle(target.objectId, target.frameId, target.nodeId);
    
    // how long it takes to move the element:
    // instant if editing mode on, 400ms if not (or touchMoveDelay if specially configured for that element)
    var moveDelay = this.defaultMoveDelay;
    // take a lot longer to move nodes, otherwise it's hard to draw links
    if (globalStates.guiState === "node") {
        moveDelay = this.defaultMoveDelay * 3;
    }
    if (globalStates.editingMode) {
        moveDelay = 0;
    } else if (activeVehicle.moveDelay) {
        moveDelay = activeVehicle.moveDelay; // This gets set from the JavaScript API
    }
    
    // set point A of the link you are starting to create
    if (globalStates.guiState === "node" && !globalProgram.objectA) {
        globalProgram.objectA = target.objectId;
        globalProgram.frameA = target.frameId;
        globalProgram.nodeA = target.nodeId;
        globalProgram.logicA = activeVehicle.type === "logic" ? 0 : false;
    }

    // Post event into iframe
    if (this.shouldPostEventsIntoIframe()) {
        this.postEventIntoIframe(event, target.frameId, target.nodeId);
    }
    
    // after a certain amount of time, start editing this element
    if (moveDelay >= 0) {
        var timeoutFunction = setTimeout(function () {
            realityEditor.device.beginTouchEditing(target.objectId, target.frameId, target.nodeId);
        }, moveDelay);
    }
    
    this.touchEditingTimer = {
        startX: event.pageX,
        startY: event.pageY,
        moveTolerance: 100,
        timeoutFunction: timeoutFunction
    };
    
    cout("onElementTouchDown");
};

/**
 * When touch move that originated on a frame or node, do any of the following:
 * 1. show visual feedback if you move over the trash
 * 2. if move more than a certain threshold, cancel touchTimer
 * @param {PointerEvent} event
 */
realityEditor.device.onElementTouchMove = function(event) {
    var target = event.currentTarget;
    
    // cancel the touch hold timer if you move more than a negligible amount
    if (this.touchEditingTimer) {
        
        var dx = event.pageX - this.touchEditingTimer.startX;
        var dy = event.pageY - this.touchEditingTimer.startY;
        if (dx * dx + dy * dy > this.touchEditingTimer.moveTolerance) {
            this.clearTouchTimer();
        }
    
    }
    
    if (this.shouldPostEventsIntoIframe()) {
        this.postEventIntoIframe(event, target.frameId, target.nodeId);
    }

    cout("onElementTouchMove");
};


/**
 * When touch enters a node that didn't originate in it,
 * Show visual feedback based on whether you are allowed to create a link to this new node
 * @param {PointerEvent} event
 */
realityEditor.device.onElementTouchEnter = function(event) {
    var target = event.currentTarget;
    
    // show visual feedback for nodes unless you are dragging something around
    if (target.type !== "ui" && !this.getEditingVehicle()) {
        var contentForFeedback;

        if (globalProgram.nodeA === target.nodeId || globalProgram.nodeA === false) {
            contentForFeedback = 3; // TODO: replace ints with a human-readable enum/encoding
            overlayDiv.classList.add('overlayAction');

        } else if (realityEditor.network.checkForNetworkLoop(globalProgram.objectA, globalProgram.frameA, globalProgram.nodeA, globalProgram.logicA, target.objectId, target.frameId, target.nodeId, 0)) {
            contentForFeedback = 2;
            overlayDiv.classList.add('overlayPositive');

        } else {
            contentForFeedback = 0;
            overlayDiv.classList.add('overlayNegative');
        }

        if (globalDOMCache["iframe" + target.nodeId]) {
            globalDOMCache["iframe" + target.nodeId].contentWindow.postMessage(
                JSON.stringify( { uiActionFeedback: contentForFeedback }) , "*");
        }
    }

    cout("onElementTouchEnter");
};

/**
 * When touch leaves a node,
 * Stop the touchTimer and reset the visual feedback for that node
 * @param {PointerEvent} event
 */
realityEditor.device.onElementTouchOut = function(event) {
    var target = event.currentTarget;
    if (target.type !== "ui") {

        // stop node hold timer // TODO: handle node move same as frame by calculating dist^2 > threshold
        this.clearTouchTimer();

        // if (this.editingState.node) {
        //     realityEditor.gui.menus.buttonOn([]); // endTrash // TODO: need a new method to end trash programmatically ??? 
        // }

        globalProgram.logicSelector = 4; // 4 means default link (not one of the colored ports)

        // reset touch overlay
        overlayDiv.classList.remove('overlayPositive');
        overlayDiv.classList.remove('overlayNegative');
        overlayDiv.classList.remove('overlayAction');

        if (globalDOMCache["iframe" + target.nodeId]) {
            globalDOMCache["iframe" + target.nodeId].contentWindow.postMessage(
                JSON.stringify( { uiActionFeedback: 1 }) , "*");
        }
    }

    cout("onElementTouchOut");
};

/**
 * When touch up on a frame or node, do any of the following if necessary:
 * 1. Open the crafting board
 * 2. Create and upload a new link
 * 3. Reset various editingMode state
 * 4. Delete logic node dragged into trash
 * 5. delete resuable frame dragged onto trash
 * @param {PointerEvent} event
 */
realityEditor.device.onElementTouchUp = function(event) {
    var target = event.currentTarget;
    var activeVehicle = this.getEditingVehicle();

    if (this.shouldPostEventsIntoIframe()) {
        this.postEventIntoIframe(event, target.frameId, target.nodeId);
    }

    var didDisplayCrafting = false;
    if (globalStates.guiState === "node") {

        if (globalProgram.objectA) {

            // open the crafting board if you tapped on a logic node
            if (target.nodeId === globalProgram.nodeA && target.type === "logic" && !globalStates.editingMode && !this.getEditingVehicle()) {
                realityEditor.gui.crafting.craftingBoardVisible(target.objectId, target.frameId, target.nodeId);
                didDisplayCrafting = true;
            }

            globalProgram.objectB = target.objectId;
            globalProgram.frameB = target.frameId;
            globalProgram.nodeB = target.nodeId;
            
            if (target.type !== "logic") {
                globalProgram.logicB = false;
            }

            realityEditor.network.postLinkToServer(globalProgram);

            this.resetGlobalProgram();

        }

    }

    // touch up over the trash
    if (event.pageX >= this.layout.getTrashThresholdX()) {

        this.callbackHandler.triggerCallbacks('vehicleDeleted', {objectKey: this.editingState.object, frameKey: this.editingState.frame, nodeKey: this.editingState.node});
        
        // delete logic node
        if (target.type === "logic") {

            // delete links to and from the node
            realityEditor.forEachFrameInAllObjects(function(objectKey, frameKey) {
                var thisFrame = realityEditor.getFrame(objectKey, frameKey);
                Object.keys(thisFrame.links).forEach(function(linkKey) {
                    var thisLink = thisFrame.links[linkKey];
                    if (((thisLink.objectA === target.objectId) && (thisLink.frameA === target.frameId) && (thisLink.nodeA === target.nodeId)) ||
                        ((thisLink.objectB === target.objectId) && (thisLink.frameB === target.frameId) && (thisLink.nodeB === target.nodeId))) {
                        delete thisFrame.links[linkKey];
                        realityEditor.network.deleteLinkFromObject(objects[objectKey].ip, objectKey, frameKey, linkKey);
                    }
                });
            });

            // remove it from the DOM
            realityEditor.gui.ar.draw.deleteNode(target.objectId, target.frameId, target.nodeId);
            realityEditor.gui.ar.draw.removeFromEditedNodesList(target.nodeId);
            // delete it from the server
            realityEditor.network.deleteNodeFromObject(objects[target.objectId].ip, target.objectId, target.frameId, target.nodeId);


            // delete frame
        } else if (globalStates.guiState === "ui" && activeVehicle && activeVehicle.location === "global") {
            
            realityEditor.device.deleteFrame(activeVehicle, this.editingState.object, this.editingState.frame);

        }
    }

    // force the canvas to re-render
    globalCanvas.hasContent = true;
    
    // hide the trash menu
    // realityEditor.gui.menus.buttonOn("main");
    // if (!didDisplayCrafting) {
    //     realityEditor.gui.menus.switchToMenu("main");
    // }

    cout("onElementTouchUp");
};

/**
 * Once a frame has been decided to be deleted, this fully deletes it
 * removing links to and from it, removing it from the DOM and objects data structure, and clearing related state 
 * @param {Frame} frameToDelete
 * @param {string} objectKeyToDelete
 * @param {string} frameKeyToDelete
 */
realityEditor.device.deleteFrame = function(frameToDelete, objectKeyToDelete, frameKeyToDelete) {
        
    // delete links to and from the frame
    realityEditor.forEachFrameInAllObjects(function(objectKey, frameKey) {
        var thisFrame = realityEditor.getFrame(objectKey, frameKey);
        Object.keys(thisFrame.links).forEach(function(linkKey) {
            var thisLink = thisFrame.links[linkKey];
            if (((thisLink.objectA === objectKeyToDelete) && (thisLink.frameA === frameKeyToDelete)) ||
                ((thisLink.objectB === objectKeyToDelete) && (thisLink.frameB === frameKeyToDelete))) {
                delete thisFrame.links[linkKey];
                realityEditor.network.deleteLinkFromObject(objects[objectKey].ip, objectKey, frameKey, linkKey);
            }
        });
    });

    // remove it from the DOM
    realityEditor.gui.ar.draw.killElement(frameKeyToDelete, frameToDelete, globalDOMCache);
    realityEditor.gui.ar.draw.removeFromEditedFramesList(frameKeyToDelete);
    // delete it from the server
    realityEditor.network.deleteFrameFromObject(objects[objectKeyToDelete].ip, objectKeyToDelete, frameKeyToDelete);

    globalStates.inTransitionObject = null;
    globalStates.inTransitionFrame = null;

    delete objects[objectKeyToDelete].frames[frameKeyToDelete];
};

/**
 * 1. update the counter to keep track of how many touches are on the screen right now
 * 2. upload new position data to server
 * 3. drop inTransition frame onto closest object
 * @param {TouchEvent} event
 */
realityEditor.device.onElementMultiTouchEnd = function(event) {
    
    var activeVehicle = this.getEditingVehicle();
    
    var isOverTrash = false;
    if (event.pageX >= this.layout.getTrashThresholdX()) {
        if (globalStates.guiState === "ui" && activeVehicle && activeVehicle.location === "global") {
            isOverTrash = true;
        } else if (activeVehicle && activeVehicle.type === "logic") {
            isOverTrash = true;
        }
    }
    
    if (isOverTrash) return;
    
    if (activeVehicle && !isOverTrash) {
        var positionData = realityEditor.gui.ar.positioning.getPositionData(activeVehicle);
        var content = {};
        content.x = positionData.x;
        content.y = positionData.y;
        content.scale = positionData.scale;
        if (this.editingState.unconstrained || globalStates.unconstrainedPositioning) {
            content.matrix = positionData.matrix;
        }
        content.lastEditor = globalStates.tempUuid;
        
        var routeSuffix = (this.editingState.node) ? "/nodeSize/" : "/size/";
        var urlEndpoint = 'http://' + objects[this.editingState.object].ip + ':' + httpPort + '/object/' + this.editingState.object + "/frame/" + this.editingState.frame + "/node/" + this.editingState.node + routeSuffix;
        realityEditor.network.postData(urlEndpoint, content);
    }
    
    // drop frame onto closest object if we have pulled one away from a previous object
    if (globalStates.inTransitionObject && globalStates.inTransitionFrame) {

        // allow scaling with multiple fingers without dropping the frame in motion
        var touchesOnActiveVehicle = this.currentScreenTouches.map(function(elt){ return elt.targetId; }).filter(function(touchTarget) {
            return (touchTarget === this.editingState.frame || touchTarget === this.editingState.node || touchTarget === "pocket-element");
        }.bind(this));
        if (touchesOnActiveVehicle.length > 1) {
            return;
        }

        var closestObjectKey = realityEditor.gui.ar.getClosestObject()[0];

        if (closestObjectKey) {

            console.log('there is an object to drop this frame onto');

            var frameBeingMoved = realityEditor.getFrame(globalStates.inTransitionObject, globalStates.inTransitionFrame);
            var newFrameKey = closestObjectKey + frameBeingMoved.name;

            var screenX = event.pageX;
            var screenY = event.pageY;
            var projectedCoordinates = realityEditor.gui.ar.utilities.screenCoordinatesToMarkerXY(closestObjectKey, screenX, screenY);

            realityEditor.gui.ar.draw.moveTransitionFrameToObject(globalStates.inTransitionObject, globalStates.inTransitionFrame, closestObjectKey, newFrameKey, projectedCoordinates);

            // var newObject = realityEditor.getObject(closestObjectKey);
            var newFrame = realityEditor.getFrame(closestObjectKey, newFrameKey);

            // update position on server
            urlEndpoint = 'http://' + objects[closestObjectKey].ip + ':' + httpPort + '/object/' + closestObjectKey + "/frame/" + newFrameKey + "/node/" + null + "/size/";
            var content = newFrame.ar;
            content.lastEditor = globalStates.tempUuid;
            realityEditor.network.postData(urlEndpoint, content);

        } else {

            console.log('there are no visible objects - return this frame to its previous object');
            realityEditor.gui.ar.draw.returnTransitionFrameBackToSource();

        }
    }

};

/**
 * Show the touch overlay, and start drawing the dot line to cut links (in node guiState)
 * @param {PointerEvent} event
 */
realityEditor.device.onDocumentPointerDown = function(event) {
    
    globalStates.pointerPosition = [event.clientX, event.clientY];

    overlayDiv.style.display = "inline";
    // Translate up 6px to be above pocket layer
    overlayDiv.style.transform = 'translate3d(' + event.clientX + 'px,' + event.clientY + 'px, 1200px)';
    
    var activeVehicle = this.getEditingVehicle();
    
    // If the event is hitting the background and it isn't the multi-touch to scale an object
    if (realityEditor.device.utilities.isEventHittingBackground(event)) {

        if (globalStates.guiState === "node" && !globalStates.editingMode) {

            if (!globalProgram.objectA) {
                globalStates.drawDotLine = true;
                globalStates.drawDotLineX = event.clientX;
                globalStates.drawDotLineY = event.clientY;
            }
        }

    }

    cout("onDocumentPointerDown");
};

// TODO: add in functionality from onMultiTouchCanvasMove to onDocumentPointerMove
// TODO: 1. reposition frame that was just pulled out of a screen

// TODO: position the pocket nodes the same way that we position pocket frames?
/**
 * Move the touch overlay and move the pocket node if one is being dragged in.
 * @param {PointerEvent} event
 */
realityEditor.device.onDocumentPointerMove = function(event) {
    event.preventDefault(); //TODO: why is this here but not in other document events?

    globalStates.pointerPosition = [event.clientX, event.clientY];

    // Translate up 6px to be above pocket layer
    overlayDiv.style.transform = 'translate3d(' + event.clientX + 'px,' + event.clientY + 'px, 1200px)';

    // if we are dragging a node in using the pocket, moves that element to this position
    realityEditor.gui.pocket.setPocketPosition(event);

    cout("onDocumentPointerMove");
};

/**
 * When touch up anywhere, do any of the following if necessary:
 * 1. Add the pocket node to the closest frame
 * 2. Stop drawing link
 * 3. Delete links crossed by dot line
 * 4. Hide touch overlay, reset menu, and clear memory
 * @param {PointerEvent} event
 */
realityEditor.device.onDocumentPointerUp = function(event) {
    
    // add the pocket node to the closest frame
    if (realityEditor.gui.buttons.getButtonState('pocket') === 'down') {

        // hide the pocket node
        realityEditor.gui.ar.draw.setObjectVisible(pocketItem["pocket"], false);
        
        var pocketNode = pocketItem["pocket"].frames["pocket"].nodes[pocketItemId];
        if (pocketNode) {
            this.addPocketNodeToClosestFrame(pocketNode);
        }
    }
    
    if (globalStates.guiState === "node") {

        // stop drawing current link
        this.resetGlobalProgram();

        // delete links
        if (globalStates.drawDotLine) {
            realityEditor.gui.ar.lines.deleteLines(globalStates.drawDotLineX, globalStates.drawDotLineY, event.clientX, event.clientY);
            globalStates.drawDotLine = false;
        }
    }

    // clear state that may have been set during a touchdown or touchmove event
    this.clearTouchTimer();
    realityEditor.gui.ar.positioning.initialScaleData = null;
    
    // force redraw the background canvas to remove links
    globalCanvas.hasContent = true;

    // hide and reset the overlay div
    overlayDiv.style.display = "none";
    overlayDiv.classList.remove('overlayMemory');
    overlayDiv.classList.remove('overlayLogicNode');
    overlayDiv.classList.remove('overlayAction');
    overlayDiv.classList.remove('overlayPositive');
    overlayDiv.classList.remove('overlayNegative');
    overlayDiv.classList.remove('overlayScreenFrame');
    overlayDiv.innerHTML = '';
    
    // if not in crafting board, reset menu back to main
    if (globalStates.guiState !== "logic" && this.currentScreenTouches.length === 1) {
        realityEditor.gui.menus.switchToMenu("main");
    }

    // clear the memory being saved in the touch overlay
    if (overlayDiv.style.backgroundImage !== '' && overlayDiv.style.backgroundImage !== 'none') {
        overlayDiv.style.backgroundImage = 'none';
        realityEditor.app.appFunctionCall("clearMemory");
    }
    
    cout("onDocumentPointerUp");
};

/**
 * Converts MouseEvents from a desktop screen to one touch in a multi-touch data structure (TouchEvents),
 * so that they can be handled by the same functions that expect multi-touch
 * @param {MouseEvent} event
 */
function modifyTouchEventIfDesktop(event) {
    if (realityEditor.device.utilities.isDesktop()) {
        event.touches = [];
        event.touches[0] = {
            altitudeAngle: 0,
            azimuthAngle: 0,
            clientX: event.clientX,
            clientY: event.clientY,
            force: 0,
            identifier: event.timeStamp,
            pageX: event.pageX,
            pageY: event.pageY,
            radiusX: 20,
            radiusY: 20,
            rotationAngle: 0,
            screenX: event.screenX,
            screenY: event.screenY,
            target: event.target,
            touchType: 'direct'
        };
    }
}

/**
 * Exposes all touchstart events to the touchInputs module for additional functionality (e.g. screens).
 * Also keeps track of how many touches are down on the screen right now.
 * if its down on the background create a memory (in ui guiState)
 * @param {TouchEvent} event
 */
realityEditor.device.onDocumentMultiTouchStart = function (event) {
    modifyTouchEventIfDesktop(event);

    realityEditor.device.touchEventObject(event, "touchstart", realityEditor.device.touchInputs.screenTouchStart);
    cout("onDocumentMultiTouchStart");
    
    [].slice.call(event.touches).forEach(function(touch) {
        if (realityEditor.device.currentScreenTouches.map(function(elt) { return elt.identifier; }).indexOf(touch.identifier) === -1) {
            realityEditor.device.currentScreenTouches.push({
                targetId: touch.target.id.replace(/^(svg)/,""),
                identifier: touch.identifier,
                position: {
                    x: touch.pageX,
                    y: touch.pageY
                }
            });
        }
    });

    var activeVehicle = this.getEditingVehicle();

    // If the event is hitting the background and it isn't the multi-touch to scale an object
    if (realityEditor.device.utilities.isEventHittingBackground(event)) {
        if (event.touches.length < 2) {
            var didTouchScreen = this.checkIfTouchWithinScreenBounds(event.pageX, event.pageY);

            if (!didTouchScreen && realityEditor.gui.memory.memoryCanCreate()) { // && window.innerWidth - event.clientX > 65) {
                // realityEditor.gui.menus.switchToMenu("bigPocket");
                // realityEditor.gui.memory.createMemory(); // TODO: implement memories and re-enable then

            }
        }
    }

    this.callbackHandler.triggerCallbacks('onDocumentMultiTouchStart', {event: event});
};

/**
 * 1. Exposes all touchmove events to the touchInputs module for additional functionality (e.g. screens).
 * 2. If there is an active editingMode target, drag it when one finger moves on canvas, or scale when two fingers.
 * @param {TouchEvent} event
 */
realityEditor.device.onDocumentMultiTouchMove = function (event) {
    modifyTouchEventIfDesktop(event);

    realityEditor.device.touchEventObject(event, "touchmove", realityEditor.device.touchInputs.screenTouchMove);
    cout("onDocumentMultiTouchMove");
    
    [].slice.call(event.touches).forEach(function(touch) {
        realityEditor.device.currentScreenTouches.filter(function(currentScreenTouch) {
            return touch.identifier === currentScreenTouch.identifier;
        }).forEach(function(currentScreenTouch) {
            currentScreenTouch.position.x = touch.pageX;
            currentScreenTouch.position.y = touch.pageY;
        });
    });
    
    var activeVehicle = this.getEditingVehicle();
    
    if (activeVehicle) {

        // scale the element if you make a pinch gesture
        if (event.touches.length === 2 && !realityEditor.device.editingState.pinchToScaleDisabled) {

            // consider a touch on 'object__frameKey__' and 'svgobject__frameKey__' to be on the same target
            var touchTargets = [].slice.call(event.touches).map(function(touch){return touch.target.id.replace(/^(svg)/,"")});
            var areBothOnElement = touchTargets[0] === touchTargets[1];

            var centerTouch;
            var outerTouch;

            if (areBothOnElement) {

                // if you do a pinch gesture with both fingers on the frame
                // center the scale event around the first touch the user made
                centerTouch = {
                    x: event.touches[0].pageX,
                    y: event.touches[0].pageY
                };

                outerTouch = {
                    x: event.touches[1].pageX,
                    y: event.touches[1].pageY
                };

            } else {

                // if you have two fingers on the screen (one on the frame, one on the canvas)
                // make sure the scale event is centered around the frame
                [].slice.call(event.touches).forEach(function(touch){

                    var didTouchOnFrame = touch.target.id.replace(/^(svg)/,"") === activeVehicle.uuid;
                    var didTouchOnNode = touch.target.id.replace(/^(svg)/,"") === activeVehicle.frameId + activeVehicle.name;
                    var didTouchOnPocketContainer = touch.target.className === "element-template";
                    if (didTouchOnFrame || didTouchOnNode || didTouchOnPocketContainer) {
                        centerTouch = {
                            x: touch.pageX,
                            y: touch.pageY
                        };
                    } else {
                        outerTouch = {
                            x: touch.pageX,
                            y: touch.pageY
                        };
                    }
                });

            }

            realityEditor.gui.ar.positioning.scaleVehicle(activeVehicle, centerTouch, outerTouch);


        // otherwise, if you just have one finger on the screen, move the frame you're on if you can
        } else if (event.touches.length === 1) {
            
            // cannot move static copy frames
            if (activeVehicle.staticCopy) {
                return;
            }
            
            // cannot move nodes inside static copy frames
            if (typeof activeVehicle.objectId !== "undefined" && typeof activeVehicle.frameId !== "undefined") {
                var parentFrame = realityEditor.getFrame(activeVehicle.objectId, activeVehicle.frameId);
                if (parentFrame && parentFrame.staticCopy) {
                    return;
                }
            }
            
            realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(activeVehicle, event.touches[0].pageX, event.touches[0].pageY, true);
            
            var isDeletableVehicle = activeVehicle.type === 'logic' || (globalStates.guiState === "ui" && activeVehicle && activeVehicle.location === "global");
            
            // visual feedback if you move over the trash
            if (event.pageX >= this.layout.getTrashThresholdX() && isDeletableVehicle) {
                overlayDiv.classList.add('overlayNegative');
            } else {
                overlayDiv.classList.remove('overlayNegative');
            }
            
        }
    }

    this.callbackHandler.triggerCallbacks('onDocumentMultiTouchMove', {event: event});
};

realityEditor.device.checkIfTouchWithinScreenBounds = function(screenX, screenY) {

    var isWithinBounds = false;
    
    // for every visible screen, calculate this touch's exact x,y coordinate within that screen plane
    for (var frameKey in realityEditor.gui.screenExtension.visibleScreenObjects) {
        if (!realityEditor.gui.screenExtension.visibleScreenObjects.hasOwnProperty(frameKey)) continue;
        var visibleScreenObject = realityEditor.gui.screenExtension.visibleScreenObjects[frameKey];
        var point = realityEditor.gui.ar.utilities.screenCoordinatesToMarkerXY(visibleScreenObject.object, screenX, screenY);
        // visibleScreenObject.x = point.x;
        // visibleScreenObject.y = point.y;
        
        var object = realityEditor.getObject(visibleScreenObject.object);
        
        var isWithinWidth = Math.abs(point.x) < (object.targetSize.width * 1000)/2;
        var isWithinHeight = Math.abs(point.y) < (object.targetSize.height * 1000)/2;

        console.log(point, isWithinWidth, isWithinHeight);
        
        if (isWithinWidth && isWithinHeight) {
            isWithinBounds = true;
        }

    }
    
    return isWithinBounds;

};

/**
 * pop into unconstrained mode if pull out z > threshold
 * @param {Frame|Node} activeVehicle
 */
realityEditor.device.checkIfFramePulledIntoUnconstrained = function(activeVehicle) {

    // many conditions to check to see if it has this feature enabled
    var ableToBePulled = !(this.editingState.unconstrained || globalStates.unconstrainedPositioning) && 
                            (!globalStates.freezeButtonState || realityEditor.device.utilities.isDesktop()) &&
                            realityEditor.gui.ar.positioning.isVehicleUnconstrainedEditable(activeVehicle);
    
    if (ableToBePulled) {

        // var screenFrameMatrix = realityEditor.gui.ar.utilities.repositionedMatrix(realityEditor.gui.ar.draw.visibleObjects[activeVehicle.objectId], activeVehicle);
        // var distanceToFrame = screenFrameMatrix[14];
        
        // TODO: this doesn't work for 
        //var distanceToObject = realityEditor.gui.ar.utilities.distance(realityEditor.gui.ar.draw.visibleObjects[activeVehicle.objectId]);
        var distanceToObject = activeVehicle.screenZ; // TODO: needs to factor in dot product of x,y translation // TODO: or directly look at camera matrix vs this frame matrix

        // the first time, detect how far you are from the element and use that as a baseline
        if (!this.editingState.unconstrainedOffset) {
            this.editingState.unconstrainedOffset = distanceToObject;

        } else {

            // after that, if you pull out more than 100 in the z direction, turn on unconstrained
            // var zPullThreshold = 50;
            var amountPulled = Math.abs(distanceToObject - this.editingState.unconstrainedOffset);
            // console.log(amountPulled);
            if (amountPulled > globalStates.framePullThreshold) {
                console.log('pop into unconstrained editing mode');

                realityEditor.app.tap();

                // create copy of static frame when it gets pulled out
                if (activeVehicle.staticCopy) {
                    realityEditor.network.createCopyOfFrame(objects[this.editingState.object].ip, this.editingState.object, this.editingState.frame);
                    activeVehicle.staticCopy = false;
                }
                
                this.editingState.unconstrained = true;
                this.editingState.unconstrainedOffset = null;

                // tell the renderer to freeze the current matrix as the unconstrained position on the screen
                realityEditor.gui.ar.draw.matrix.copyStillFromMatrixSwitch = true;
                realityEditor.device.editingState.startingMatrix = realityEditor.gui.ar.utilities.copyMatrix(realityEditor.gui.ar.positioning.getPositionData(activeVehicle).matrix);

                this.callbackHandler.triggerCallbacks('onFramePulledIntoUnconstrained', {activeVehicle: activeVehicle});
            }
        }
    }
};

/**
 * Exposes all touchend events to the touchInputs module for additional functionality (e.g. screens).
 * Keeps track of how many touches are currently on the screen.
 * If this touch was the last one on the editingMode element, stop editing it.
 * @param {TouchEvent} event
 */
realityEditor.device.onDocumentMultiTouchEnd = function (event) {
    modifyTouchEventIfDesktop(event);

    realityEditor.device.touchEventObject(event, "touchend", realityEditor.device.touchInputs.screenTouchEnd);
    cout("onDocumentMultiTouchEnd");
    
    // if you started editing with beginTouchEditing instead of touchevent on element, programmatically trigger onElementMultiTouchEnd
    var editingVehicleTouchIndex = this.currentScreenTouches.map(function(elt) { return elt.targetId; }).indexOf((this.editingState.node || this.editingState.frame));
    if (editingVehicleTouchIndex === -1) {
        realityEditor.device.onElementMultiTouchEnd(event);
    }

    // if multitouch, stop tracking the touches that were removed but keep tracking the ones still there
    if (event.touches.length > 0) {
        // find which touch to remove from the currentScreenTouches
        var remainingTouches = [].slice.call(event.touches).map(function(touch) {
            return touch.identifier; //touch.target.id.replace(/^(svg)/,"")
        });
        
        var indicesToRemove = [];
        this.currentScreenTouches.forEach(function(elt, index) {
            // this touch isn't here anymore
            if (remainingTouches.indexOf(elt.identifier) === -1) {
                indicesToRemove.push(index);
            }
        });
        
        // remove them in a separate loop because it can cause problems to remove elements from the same loop you're iterating over
        indicesToRemove.forEach(function(index) {
            realityEditor.device.currentScreenTouches.splice(index, 1);
        });
    } else {
        this.currentScreenTouches = [];

        // realityEditor.gui.menus.buttonOn([]);
        var didDisplayCrafting = globalStates.currentLogic; // proxy to determine if crafting board is open / we shouldn't reset the menu
        if (!didDisplayCrafting) {
            realityEditor.gui.menus.switchToMenu("main");
        }
    }
    
    // stop editing the active frame or node if there are no more touches on it
    if (this.editingState.object) {
        // TODO: touchesOnActiveVehicle returns 0 if you tapped through a fullscreen frame, because the touch targetId doesnt update to be the thing behind it
        var touchesOnActiveVehicle = this.currentScreenTouches.map(function(elt) { return elt.targetId; }).filter(function(touchTarget) {
            return (touchTarget === this.editingState.frame || touchTarget === this.editingState.node || touchTarget === "pocket-element");
        }.bind(this));

        var activeVehicle = this.getEditingVehicle();

        if (touchesOnActiveVehicle.length === 0) {
            console.log('this is the last touch - hide editing overlay');
            
            // TODO: if pocketNode.node === activeVehicle, move node to closestFrameToScreenPosition upon dropping it
            // if (activeVehicle === pocketNode.node) {
            //
            //     var closest = realityEditor.gui.ar.getClosestFrameToScreenCoordinates(event.pageX, event.pageY);
            //
            //     // set the name of the node by counting how many logic nodes the frame already has
            //     var closestFrame = realityEditor.getFrame(closest[0], closest[1]);
            //     var logicCount = Object.values(closestFrame.nodes).filter(function (node) {
            //         return node.type === 'logic'
            //     }).length;
            //     pocketNode.name = "LOGIC" + logicCount;
            //
            // }

            if (activeVehicle && !globalStates.editingMode) {
                // document.getElementById('svg' + (this.editingState.node || this.editingState.frame)).style.display = 'none';
                document.getElementById('svg' + (this.editingState.node || this.editingState.frame)).classList.remove('visibleEditingSVG');
            }

            this.resetEditingState();

        } else {
            // if there's still a touch on it (it was being scaled), reset touch offset so vehicle doesn't jump
            this.editingState.touchOffset = null;
            realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(activeVehicle, event.touches[0].pageX, event.touches[0].pageY, true);

        }
    }
    
    // if tap on background when no visible objects, auto-focus camera
    // if (event.target.id === 'canvas') {
    //     if (Object.keys(realityEditor.gui.ar.draw.visibleObjects).length === 0) {
    //         realityEditor.app.focusCamera();
    //     }
    // }
    
    this.callbackHandler.triggerCallbacks('onDocumentMultiTouchEnd', {event: event});
};

/**
 * @typedef {Object} ScreenEventObject
 * @desc Data structure to hold touch events to be sent to screens
 * @property {number|null} version
 * @property {string|null} object 
 * @property {string|null} frame
 * @property {string|null} node
 * @property {number} x
 * @property {number} y
 * @property {number} type
 * @property {Array.<{screenX: number, screenY: number, type: string}>} touches
 */

/**
 * @type {ScreenEventObject}
 */
realityEditor.device.eventObject = {
    version : null,
    object: null,
    frame : null,
    node : null,
    x: 0,
    y: 0,
    type: null,
    touches:[
        {
            screenX: 0,
            screenY: 0,
            type:null
        },
        {
            screenX: 0,
            screenY: 0,
            type:null
        }
    ]
};

/**
 * Parses a TouchEvent into a useful format for the screenExtension module and sends it via the callback
 * @param {TouchEvent} evt
 * @param {string} type
 * @param {Function} cb
 */
realityEditor.device.touchEventObject = function (evt, type, cb) {
    if(!evt.touches) return;
    if (evt.touches.length >= 1) {
        realityEditor.device.eventObject.x = evt.touches[0].screenX;
        realityEditor.device.eventObject.y = evt.touches[0].screenY;
        realityEditor.device.eventObject.type = type;
        realityEditor.device.eventObject.touches[0].screenX = evt.touches[0].screenX;
        realityEditor.device.eventObject.touches[0].screenY = evt.touches[0].screenY;
        realityEditor.device.eventObject.touches[0].type = type;

        if (type === 'touchstart') {
            
            var didJustAddPocket = false;
            if (realityEditor.device.eventObject.object && realityEditor.device.eventObject.frame) {
                var existingEventFrame = realityEditor.getFrame(realityEditor.device.eventObject.object, realityEditor.device.eventObject.frame);
                didJustAddPocket = (existingEventFrame && existingEventFrame === pocketFrame.vehicle && pocketFrame.waitingToRender);
            }
            
            if (!didJustAddPocket) {
                realityEditor.device.eventObject.object = null;
                realityEditor.device.eventObject.frame = null;
                var ele = evt.target;
                while (ele && ele.tagName !== "BODY" && ele.tagName !== "HTML") {
                    if (ele.objectId && ele.frameId) {
                        realityEditor.device.eventObject.object = ele.objectId;
                        realityEditor.device.eventObject.frame = ele.frameId;
                        break;
                    }
                    ele = ele.parentElement;
                }
            }
        }
    }
    if (evt.touches.length >= 2) {
        realityEditor.device.eventObject.touches[1].screenX = evt.touches[1].screenX;
        realityEditor.device.eventObject.touches[1].screenY = evt.touches[1].screenY;
        realityEditor.device.eventObject.touches[1].type = type;
    } else if (type === 'touchend') {
        realityEditor.device.eventObject.x = evt.pageX;
        realityEditor.device.eventObject.y = evt.pageY;
        realityEditor.device.eventObject.type = type;
        realityEditor.device.eventObject.touches[0].screenX = evt.pageX;
        realityEditor.device.eventObject.touches[0].screenY = evt.pageY;
        realityEditor.device.eventObject.touches[0].type = type;
    } else {
        realityEditor.device.eventObject.touches[1] = {};
    }
    cb(realityEditor.device.eventObject);
};

// // // // MISC. Device Functionality // // // //

/**
 * Sets the global device name to the internal hardware string of the iOS device
 * @param {string} deviceName phone or tablet identifier
 * e.g. iPhone 6s is "iPhone8,1", iPhone 6s Plus is "iPhone8,2", iPhoneX is "iPhone10,3"
 * see: https://gist.github.com/adamawolf/3048717#file-ios_device_types-txt
 * or:  https://support.hockeyapp.net/kb/client-integration-ios-mac-os-x-tvos/ios-device-types
 */
realityEditor.device.setDeviceName = function(deviceName) {
    globalStates.device = deviceName;
    console.log("The Reality Editor is loaded on a " + globalStates.device);
    cout("setDeviceName");
};

/**
 * Sets the persistent global settings of the Reality Editor based on the state saved in iOS storage.
 * @param {boolean} developerState - sets editingMode on
 * @param {boolean} extendedTrackingState - enables vuforia extended tracking
 * @param {boolean} clearSkyState - hides menu buttons for clean appearance
 * @param {boolean} instantState - enables instant connection mode when connected to enabled capacitive touch hardware
 * @param {boolean} speechState - enables Siri speech API to connect this to that
 // TODO: add native app storage for this setting * @param {boolean} videoRecordingEnabled - enables video recording API to create frames from camera video stream
 // TODO: add native app storage for this setting * @param {boolean} matrixBroadcastEnabled
 * @param {string} externalState - the IP address of a userinterface directory that should be loaded in instead of default
 * @param {string} discoveryState - the IP address of a discovery server to be used instead of UDP
 * @param {boolean} realityState - sets retail mode on, showing a different menu for those use cases
 * @param {string} zoneText - the current zone that object discovery is limited to
 * @param {boolean} zoneState - whether to use zones or not
 */
realityEditor.device.setStates = function (developerState, extendedTrackingState, clearSkyState, instantState, speechState, /*videoRecordingEnabled, matrixBroadcastEnabled,*/ externalState, discoveryState, realityState, zoneText, zoneState) {

    globalStates.extendedTrackingState = extendedTrackingState;
    globalStates.developerState = developerState;
    globalStates.clearSkyState = clearSkyState;
    globalStates.instantState = instantState;
    globalStates.speechState = speechState;
    // globalStates.videoRecordingEnabled = videoRecordingEnabled;
    // globalStates.matrixBroadcastEnabled = matrixBroadcastEnabled;
    globalStates.externalState = externalState;
    globalStates.discoveryState = discoveryState;
    globalStates.realityState = realityState;
    globalStates.zoneText = zoneText;
    globalStates.zoneState = zoneState;

    if (globalStates.clearSkyState) {
        document.getElementById("UIButtons").classList.add('clearSky');
    } else {
        document.getElementById("UIButtons").classList.remove('clearSky');
    }

    if (globalStates.realityState) {
        realityEditor.gui.menus.switchToMenu("realityInfo", ["realityGui"], null);
        globalStates.realityState = true;
    } else {
        realityEditor.gui.menus.switchToMenu("main", ["gui"], ["reset","unconstrained"]);
        globalStates.realityState = false;
    }

    if (developerState) {
        realityEditor.device.setEditingMode(true);
    }

    if (extendedTrackingState) {
        globalStates.extendedTracking = true;
    }

    if (globalStates.editingMode) {
        realityEditor.gui.menus.switchToMenu("editing");
    }
    
    cout("setStates");
};

