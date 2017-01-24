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

createNameSpace("realityEditor.network");
 
realityEditor.network.addHeartbeatObject = function (beat) {
    /*
     if (globalStates.platform) {
     window.location.href = "of://gotbeat_" + beat.id;
     }
     */
    var _this = this;
    if (beat.id) {
        if (!objects[beat.id]) {
            this.getData('http://' + beat.ip + ':' + httpPort + '/object/' + beat.id, beat.id, function (req, thisKey) {
                if (req && thisKey) {
                    objects[thisKey] = req;
                    var thisObject = objects[thisKey];
                    // this is a work around to set the state of an objects to not being visible.
                    thisObject.objectVisible = false;
                    thisObject.screenZ = 1000;
                    thisObject.fullScreen = false;
                    thisObject.sendMatrix = false;
                    thisObject.sendAcceleration = false;
                    thisObject.integerVersion = parseInt(objects[thisKey].version.replace(/\./g, ""));

                    if (thisObject.matrix === null || typeof thisObject.matrix !== "object") {
                        thisObject.matrix = [];
                    }

                    for (var nodeKey in objects[thisKey].nodes) {
                        thisObject = objects[thisKey].nodes[nodeKey];
                        if (thisObject.matrix === null || typeof thisObject.matrix !== "object") {
                            thisObject.matrix = [];
                        }
                        thisObject.loaded = false;
                        thisObject.visible = false;

                        if(thisObject.type === "logic") {
                            thisObject.guiState = new LogicGUIState();
                            var container = document.getElementById('craftingBoard');
                            thisObject.grid = new _this.realityEditor.gui.crafting.grid.Grid(container.clientWidth - menuBarWidth, container.clientHeight);
                            _this.realityEditor.gui.crafting.utilities.convertLinksFromServer(thisObject);
                        }
                    }

                    if (!thisObject.protocol) {
                        thisObject.protocol = "R0";
                    }

                    if (thisObject.integerVersion < 170) {

                        _this.utilities.rename(thisObject, "folder", "name");
                        _this.utilities.rename(thisObject, "objectValues", "nodes");
                        _this.utilities.rename(thisObject, "objectLinks", "links");
                        delete thisObject["matrix3dMemory"];

                        for (var linkKey in objects[thisKey].links) {
                            thisObject = objects[thisKey].links[linkKey];

                            _this.utilities.rename(thisObject, "ObjectA", "objectA");
                            _this.utilities.rename(thisObject, "locationInA", "nodeA");
                            _this.utilities.rename(thisObject, "ObjectNameA", "nameA");

                            _this.utilities.rename(thisObject, "ObjectB", "objectB");
                            _this.utilities.rename(thisObject, "locationInB", "nodeB");
                            _this.utilities.rename(thisObject, "ObjectNameB", "nameB");
                            _this.utilities.rename(thisObject, "endlessLoop", "loop");
                            _this.utilities.rename(thisObject, "countLinkExistance", "health");
                        }

                        for (var nodeKey in objects[thisKey].nodes) {
                            thisObject = objects[thisKey].nodes[nodeKey];
                            _this.utilities.rename(thisObject, "plugin", "type");
                            _this.utilities.rename(thisObject, "appearance", "type");
                            thisObject.data = {
                                value: thisObject.value,
                                mode: thisObject.mode,
                                unit: "",
                                unitMin: 0,
                                unitMax: 1
                            };
                            delete thisObject.value;
                            delete thisObject.mode;

                        }

                    }

                    objects[thisKey].uuid = thisKey;

                    for (var nodeKey in objects[thisKey].nodes) {
                         objects[thisKey].nodes[nodeKey].uuid = nodeKey;
                    }

                    for (var linkKey in objects[thisKey].links) {
                        objects[thisKey].links[linkKey].uuid = linkKey;
                    }

                    _this.cout(JSON.stringify(objects[thisKey]));

                    _this.realityEditor.gui.memory.addObjectMemory(objects[thisKey]);

                    _this.realityEditor.gui.preferences.addElementInPreferences();
                }
            });
        }
    }
};

realityEditor.network.updateObject = function (origin, remote, thisKey) {

    origin.x = remote.x;
    origin.y = remote.y;
    origin.scale = remote.scale;
    origin.developer = remote.developer;

    if(remote.matrix) {
       origin.matrix = remote.matrix;
    }

    for (var nodeKey in remote.nodes) {
        if(!origin.nodes[nodeKey]) {
            origin.nodes[nodeKey] = remote.nodes[nodeKey];
        } else {

            origin.nodes[nodeKey].x =  remote.nodes[nodeKey].x;
            origin.nodes[nodeKey].y =  remote.nodes[nodeKey].y;
            origin.nodes[nodeKey].scale =  remote.nodes[nodeKey].scale;

            origin.nodes[nodeKey].name =  remote.nodes[nodeKey].name;
            if(remote.nodes[nodeKey].text)
                origin.nodes[nodeKey].text =  remote.nodes[nodeKey].text;
            if(remote.nodes[nodeKey].matrix)
            origin.nodes[nodeKey].matrix =  remote.nodes[nodeKey].matrix;
        }

        if(globalDOMCach["iframe" + nodeKey]) {
            if(globalDOMCach["iframe" + nodeKey]._loaded)
                realityEditor.network.onElementLoad(thisKey, nodeKey);
        }
    }


    var missingFrames = {};
    for (var frameKey in origin.frames) {
        missingFrames[frameKey] = true;
    }

    for (var frameKey in remote.frames) {
        if(!origin.frames[frameKey]) {
            origin.frames[frameKey] = remote.frames[frameKey];
            continue;
        }
        missingFrames[frameKey] = false;
        var oFrame = origin.frames[frameKey];
        var rFrame = remote.frames[frameKey];
        oFrame.x = rFrame.x;
        oFrame.y = rFrame.y;
        oFrame.scale = rFrame.scale;

        oFrame.name = rFrame.name;
        if(rFrame.matrix) {
            oFrame.matrix = rFrame.matrix;
        }

        if (globalDOMCach["iframe" + frameKey] && globalDOMCach["iframe" + frameKey]._loaded) {
            realityEditor.network.onElementLoad(thisKey, frameKey);
        }

    }

    for (var frameKey in missingFrames) {
        if (!missingFrames[frameKey]) {
            continue;
        }
        // Frame was deleted on remote, let's delete it here
        realityEditor.gui.frame.deleteLocally(origin.objectId, frameKey);
    }
};


realityEditor.network.updateNode = function (origin, remote, thisKey, nodeKey) {

    console.log(remote.links, origin.links, remote.blocks, origin.blocks);
    
    if(!origin) {
        
        origin = remote;
        
    } else {
    
        origin.x =  remote.x;
        origin.y =  remote.y;
        origin.scale =  remote.scale;
        origin.name =  remote.name;
        if(remote.text) {
            origin.text =  remote.text;
        }
        if(remote.matrix) {
            origin.matrix =  remote.matrix;
        }
        
    }
    
    if (remote.blocks) {
        syncBlocksWithRemote(origin, remote.blocks);
    }
    
    
    if (remote.links) {
        syncLinksWithRemote(origin, remote.links);
    }
    
    
    //if (remote.blocks) {
    //    
    //    for (var x in remote.blocks) {
    //        
    //        // add
    //        if (!origin.blocks[x]) {
    //            origin.blocks[x] = new Block();
    //            for (var y in remote.blocks[x]){
    //                origin.blocks[x][y] = remote.blocks[x][y];
    //            }
    //
    //        // update
    //        } else {
    //            for (var y in remote.blocks[x]){
    //                origin.blocks[x][y] = remote.blocks[x][y];
    //            }
    //        }
    //        
    //        
    //    }
    //
    //    // remove
    //    for (var x in origin.blocks) {
    //        if (!remote.blocks[x] && realityEditor.gui.crafting.eventHelper.shouldUploadBlock(origin.blocks[x])) {
    //            delete origin.guiState.blockDomElements[x];
    //            delete origin.blocks[x];
    //        }
    //    }
    //}
    //
    //if (remote.links) {
    //    var realRemoteLinks = this.getRealLinks(remote);
    //
    //    for (var x in remote.links) {
    //
    //        // add
    //        if (!origin.links[x]) {
    //            origin.links[x] = new BlockLink();
    //            for (var y in realRemoteLinks[x]){
    //                origin.links[x][y] = realRemoteLinks[x][y];
    //            }
    //
    //            // update
    //        } else {
    //            for (var y in realRemoteLinks[x]){
    //                origin.links[x][y] = realRemoteLinks[x][y];
    //            }
    //        }
    //
    //    }
    //
    //    // remove
    //    for (var x in origin.links) {
    //        if (!realRemoteLinks[x] && realityEditor.gui.crafting.eventHelper.shouldUploadBlockLink(origin.links[x])) {
    //            delete origin.links[x];
    //        }
    //    }
    //}

    if(globalStates.currentLogic) {
        
        if(globalStates.currentLogic.uuid === nodeKey) {
            console.log("YES");
            realityEditor.gui.crafting.forceRedraw(globalStates.currentLogic);
        }
        
    } else {
        console.log("NO");
        
        if(globalDOMCach["iframe" + nodeKey]) {
            if(globalDOMCach["iframe" + nodeKey]._loaded)
                realityEditor.network.onElementLoad(thisKey, nodeKey);
        }
    }
};

function syncBlocksWithRemote(origin, remoteBlocks) {

    console.log("blocks before = ");
    console.log(origin.blocks);

    // delete old blocks

    for (var blockKey in origin.blocks) {
        if (!origin.blocks.hasOwnProperty(blockKey)) continue;
        
        if (shouldSyncBlock(origin, blockKey, "delete")) {
            console.log("delete block " + blockKey);
            
            var domElement = origin.guiState.blockDomElements[blockKey];
            if (domElement) {
                domElement.parentNode.removeChild(domElement);
                delete origin.guiState.blockDomElements[blockKey];
            }
            delete origin.blocks[blockKey];
            
        }
    }

    // add missing blocks (updates existing ones too)

    for (blockKey in remoteBlocks) {
        if (!remoteBlocks.hasOwnProperty(blockKey)) continue;
        
        if (shouldSyncBlock(origin, blockKey, "create")) {
            console.log("add block " + blockKey);
            
            origin.blocks[blockKey] = new Block();
            for (var key in remoteBlocks[blockKey]){
                origin.blocks[blockKey][key] = remoteBlocks[blockKey][key];
            }
            
        }
    }
    
    console.log("blocks after = ");
    console.log(origin.blocks);
    
}

function shouldSyncBlock(origin, blockKey, mode) {

    if (mode === "create") {
        if (!origin.blocks[blockKey]) return true;

    } else if (mode === "delete") {

        if (!origin.blocks[blockKey]) return false;

    }

    return realityEditor.gui.crafting.eventHelper.shouldUploadBlock(origin.blocks[blockKey]); // && (origin.blocks[blockKey].x !== -1)
}

function syncLinksWithRemote(origin, remoteLinks) {
    
    var convertedRemoteLinks = getEditorLinks(origin, remoteLinks);
    
    // delete old links
    
    for (var linkKey in origin.links) {
        if (!origin.links.hasOwnProperty(linkKey)) continue;

        if (shouldSyncLink(origin, linkKey, "delete")) {
            console.log("delete link " + linkKey);

            delete origin.links[linkKey];
        }
    }
    
    // add missing links (update existing links too)
    
    for (linkKey in convertedRemoteLinks) {
        if (!convertedRemoteLinks.hasOwnProperty(linkKey)) continue;

        if (shouldSyncLink(origin, linkKey, "create")) {
            console.log("add link " + linkKey);

            origin.links[linkKey] = new BlockLink();
            for (var key in convertedRemoteLinks[linkKey]){
                origin.links[linkKey][key] = convertedRemoteLinks[linkKey][key];
            }
        }
    }

    // add missing links
    // update existing links
    // delete old links
    
}

function shouldSyncLink(origin, linkKey, mode) {

    if (mode === "create") {
        if (!origin.links[linkKey]) return true;

    } else if (mode === "delete") {
        
    }
    
    return realityEditor.gui.crafting.eventHelper.shouldUploadBlockLink(origin.links[linkKey])

}

function getEditorLinks(origin, remoteLinks) {

    // add block/link methods haven't been generalized to work on any logic,
    // it currently relies on currentLogic, so we need to set/reset that around this method // todo: generalize these logic methods so this hack isn't necessary

    var realLinks = {};

    for (var linkKey in remoteLinks) {
        if (!remoteLinks.hasOwnProperty(linkKey)) continue;
        var link = remoteLinks[linkKey];
        
        var linkParts = linkKey.split("-"); // ["blockLink", "in0", "0", "out0", "0"]
        if (linkParts.length !== 5) {
            realLinks[linkKey] = link;

        } else {
            
            //var x = link.nodeA.slice(-1);
            
            //var blockLink1 = new BlockLink();
            //blockLink1.nodeA = link.nodeA;
            //blockLink1.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, x);
            //blockLink1.logicA = link.logicA;
            //blockLink1.logicB = link.logicB;
            //realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink1)] = blockLink1;

            var linkKey = linkParts[0];
            
            var nodeA = linkParts[1];
            var logicA = parseInt(linkParts[2]);
            
            var nodeB = linkParts[3];
            var logicB = parseInt(linkParts[4]);

            var inX = nodeA.slice(-1);
            var outX = nodeB.slice(-1);
            
            
            /*
            if (nodeA.startsWith("in")) {
                var l1 = new BlockLink();
                l1.nodeA = nodeA;
                l1.logicA = logicA;
                l1.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, inX);
                l1.logicB = logicA;
                var l1Key = "blockLink1" + realityEditor.device.utilities.uuidTime();
                realLinks[l1Key] = l1;
            }

            if (nodeB.startsWith("out")) {

                var l2 = new BlockLink();
                l2.nodeA = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(false, outX);
                l2.logicA = logicB;
                l2.nodeB = nodeB;
                l2.logicB = logicB;
                var l2Key = "blockLink2" + realityEditor.device.utilities.uuidTime();
                realLinks[l2Key] = l2;

            }
            
            if (nodeA.startsWith("in") && nodeB.startsWith("out")) {

                var l3 = new BlockLink();
                l3.nodeA = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, inX);
                l3.logicA = logicA;
                l3.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(false, outX);
                l3.logicB = logicB;
                var l3Key = "blockLink3" + realityEditor.device.utilities.uuidTime();
                realLinks[l3Key] = l3;
            }
            */

            var l = new BlockLink();
            l.logicA = logicA;
            l.logicB = logicB;
            
            if (nodeA.startsWith("in")) {
                l.nodeA = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, inX);
            } else {
                l.nodeA = nodeA;
            }
            
            if (nodeB.startsWith("out")) {
                l.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(false, outX);
            } else {
                l.nodeB = nodeB;
                
            }
            
            //var lKey = "blockLink" + realityEditor.device.utilities.uuidTime();
            realLinks[linkKey] = l;
        }
        
    }

    return realLinks;

}

//function getEditorLinks_old(origin, remoteLinks) {
//
//    // add block/link methods haven't been generalized to work on any logic,
//    // it currently relies on currentLogic, so we need to set/reset that around this method // todo: generalize these logic methods so this hack isn't necessary
//
//    var realLinks = {};
//
//    for (var linkKey in remoteLinks) {
//        if (!remoteLinks.hasOwnProperty(linkKey)) continue;
//        var link = remoteLinks[linkKey];
//
//        if (realityEditor.gui.crafting.grid.isInOutBlock(link.nodeA) && origin.blocks[link.nodeB] && origin.blocks[link.nodeB].y !== 0) {
//            // create separate links from in->edge and edge->block
//            var x = link.nodeA.slice(-1);
//
//            // add first link
//            var blockLink1 = new BlockLink();
//            blockLink1.nodeA = link.nodeA;
//            blockLink1.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, x);
//            blockLink1.logicA = link.logicA;
//            blockLink1.logicB = link.logicB;
//            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink1)] = blockLink1;
//
//            // add second link
//            var blockLink2 = new BlockLink();
//            blockLink2.nodeA = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, x);
//            blockLink2.nodeB = link.nodeB;
//            blockLink2.logicA = link.logicA;
//            blockLink2.logicB = link.logicB;
//            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink2)] = blockLink2;
//
//        } else if (realityEditor.gui.crafting.grid.isInOutBlock(link.nodeB) && origin.blocks[link.nodeA] && origin.blocks[link.nodeA].y !== 3) {
//
//            // create separate links from block->edge and edge->out
//            var x = link.nodeB.slice(-1);
//
//            // add first link
//            var blockLink1 = new BlockLink();
//            blockLink1.nodeA = link.nodeA;
//            blockLink1.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(false, x);
//            blockLink1.logicA = link.logicA;
//            blockLink1.logicB = link.logicB;
//            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink1)] = blockLink1;
//
//            // add second link
//            var blockLink2 = new BlockLink();
//            blockLink2.nodeA = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(false, x);
//            blockLink2.nodeB = link.nodeB;
//            blockLink2.logicA = link.logicA;
//            blockLink2.logicB = link.logicB;
//            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink2)] = blockLink2;
//
//
//        } else {
//
//            realLinks[linkKey] = link;
//
//        }
//    }
//
//    return realLinks;
//    
//}




//realityEditor.network.updateNode = function (origin, remote, thisKey, nodeKey) {
//        if(!origin) {
//            origin = remote;
//        } else {
//
//            origin.x =  remote.x;
//            origin.y =  remote.y;
//            origin.scale =  remote.scale;
//
//            origin.name =  remote.name;
//            if(remote.text)
//                origin.text =  remote.text;
//            if(remote.matrix)
//                origin.matrix =  remote.matrix;
//        }
//
//    if (remote.blocks) {
//        if (!origin.blocks) origin.blocks = {};
//        for(var x in origin.blocks){
//            if (!origin.blocks[x]) origin.blocks[x] = {};
//            for (var y in remote.blocks[x]){
//                origin.blocks[x][y] = remote.blocks[x][y];
//            }
//        }
//        for(var remoteBlockKey in remote.blocks){
//            var remoteBlock = remote.blocks[remoteBlockKey];
//            if (!origin.blocks[remoteBlockKey]) {
//                origin.blocks[remoteBlockKey] = remoteBlock;
//            }
//        }
//    }
//    
//    if (remote.links) {
//        //realityEditor.gui.crafting.utilities.convertLinksFromServer(remote);
//        
//        console.log(remote.links, origin.links, remote.blocks, origin.blocks);
//        
//        var realRemoteLinks = this.getRealLinks(remote);
//        console.log(realRemoteLinks);
//
//        //var originRealLinks = this.getRealLinks(origin);
//        //console.log(originRealLinks);
//
//        /*
//        if (!origin.links) origin.links = {};
//		for(var x in origin.links){
//            if (!origin.links[x]) origin.links[x] = {};
//            for (var y in remote.links[x]){
//                origin.links[x][y] = remote.links[x][y];
//            }
//        }
//        */
//
//        if (!origin.links) origin.links = {};
//        for(var x in origin.links){
//            if (!origin.links[x]) origin.links[x] = {};
//            for (var y in realRemoteLinks[x]){
//                origin.links[x][y] = realRemoteLinks[x][y];
//            }
//        }
//        for(var remoteLinkKey in realRemoteLinks){
//            var remoteLink = realRemoteLinks[remoteLinkKey];
//            if (!origin.links[remoteLinkKey]) {
//                origin.links[remoteLinkKey] = remoteLink;
//            }
//        }
//        
//    }
//
//    if(globalStates.currentLogic){
//        if(globalStates.currentLogic.uuid === nodeKey) {
//            console.log("YES");
//            realityEditor.gui.crafting.forceRedraw(globalStates.currentLogic);
//        }
//    } else {
//        console.log("NO");
//    
//    
//        if(globalDOMCach["iframe" + nodeKey]) {
//            if(globalDOMCach["iframe" + nodeKey]._loaded)
//                realityEditor.network.onElementLoad(thisKey, nodeKey);
//        }
//    }
//};

/*
// todo hasOwnProperty
// convert links from in/out -> block not in edge row into 2 links, one from in/out->edge and another from edge->block
// this puts the data in a format that is convenient for the UI while keeping the server data efficient
realityEditor.network.getRealLinks = function(logic) {

    // add block/link methods haven't been generalized to work on any logic,
    // it currently relies on currentLogic, so we need to set/reset that around this method // todo: generalize these logic methods so this hack isn't necessary

    var realLinks = {};
    
    for (var linkKey in logic.links) {
        if (!logic.links.hasOwnProperty(linkKey)) continue;
        var link = logic.links[linkKey];

        if (realityEditor.gui.crafting.grid.isInOutBlock(link.nodeA) && logic.blocks[link.nodeB] && logic.blocks[link.nodeB].y !== 0) {
            // create separate links from in->edge and edge->block
            var x = link.nodeA.slice(-1);

            // add first link
            var blockLink1 = new BlockLink();
            blockLink1.nodeA = link.nodeA;
            blockLink1.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, x);
            blockLink1.logicA = link.logicA;
            blockLink1.logicB = link.logicB;
            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink1)] = blockLink1;

            // add second link
            var blockLink2 = new BlockLink();
            blockLink2.nodeA = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(true, x);
            blockLink2.nodeB = link.nodeB;
            blockLink2.logicA = link.logicA;
            blockLink2.logicB = link.logicB;
            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink2)] = blockLink2;
            
        } else if (realityEditor.gui.crafting.grid.isInOutBlock(link.nodeB) && logic.blocks[link.nodeA] && logic.blocks[link.nodeA].y !== 3) {

            // create separate links from block->edge and edge->out
            var x = link.nodeB.slice(-1);

            // add first link
            var blockLink1 = new BlockLink();
            blockLink1.nodeA = link.nodeA;
            blockLink1.nodeB = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(false, x);
            blockLink1.logicA = link.logicA;
            blockLink1.logicB = link.logicB;
            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink1)] = blockLink1;
            
            // add second link
            var blockLink2 = new BlockLink();
            blockLink2.nodeA = realityEditor.gui.crafting.eventHelper.edgePlaceholderName(false, x);
            blockLink2.nodeB = link.nodeB;
            blockLink2.logicA = link.logicA;
            blockLink2.logicB = link.logicB;
            realLinks[realityEditor.gui.crafting.grid.edgeBlockLinkKey(blockLink2)] = blockLink2;
            

        } else {
            
            realLinks[linkKey] = link;
            
        }
    }
    
    return realLinks;
};
*/




/*
    for (var nodeKey in remote) {
        if(typeof remote[nodeKey] === "object"){
            if(typeof origin[nodeKey] === "undefined" && typeof remote[nodeKey] !== "undefined"){
                origin[nodeKey] ={};
            } else continue;
            origin[nodeKey].uuid = nodeKey;
            this.updateKey(origin[nodeKey], remote[nodeKey])
        } else {
            if(typeof remote[nodeKey] !== "undefined") {
                origin[nodeKey] = remote[nodeKey];
            }
        }
    }*/


realityEditor.network.onAction = function (action) {
    var _this = this;
    var thisAction;
    if(typeof action === "object")
    {
        thisAction = action;
    } else {
        thisAction = JSON.parse(action);
    }

    if(thisAction.lastEditor === globalStates.tempUuid) {
		console.log(thisAction.lastEditor);
		console.log(globalStates.tempUuid);
		console.log("------------------------------------- its my self");
		return;
	}

    // reload links for a specific object.

    if (typeof thisAction.reloadLink !== "undefined") {

        if(thisAction.reloadLink.object in objects) {
            this.getData('http://' + objects[thisAction.reloadLink.object].ip + ':' + httpPort + '/object/' + thisAction.reloadLink.object, thisAction.reloadLink.object, function (req, thisKey) {

                if (objects[thisKey].integerVersion < 170) {
                    objects[thisKey].links = req.links;
                    for (var linkKey in objects[thisKey].links) {
                        var thisObject = objects[thisKey].links[linkKey];

                        _this.utilities.rename(thisObject, "ObjectA", "objectA");
                        _this.utilities.rename(thisObject, "locationInA", "nodeA");
                        _this.utilities.rename(thisObject, "ObjectNameA", "nameA");

                        _this.utilities.rename(thisObject, "ObjectB", "objectB");
                        _this.utilities.rename(thisObject, "locationInB", "nodeB");
                        _this.utilities.rename(thisObject, "ObjectNameB", "nameB");
                        _this.utilities.rename(thisObject, "endlessLoop", "loop");
                        _this.utilities.rename(thisObject, "countLinkExistance", "health");
                    }
                }
                else {
                    objects[thisKey].links = req.links;
                }

				objects[thisKey].uuid = thisKey;

				for (var nodeKey in objects[thisKey].nodes) {
					objects[thisKey].nodes[nodeKey].uuid = nodeKey;
				}

				for (var linkKey in objects[thisKey].links) {
					objects[thisKey].links[linkKey].uuid = linkKey;
				}

                // cout(objects[thisKey]);

                _this.cout("got links");
            });
        }
    }

    if (typeof thisAction.reloadObject !== "undefined") {
console.log("gotdata");
        if(thisAction.reloadObject.object in objects) {
            this.getData('http://' + objects[thisAction.reloadObject.object].ip + ':' + httpPort + '/object/' + thisAction.reloadObject.object, thisAction.reloadObject.object, function (req, thisKey) {

                if (objects[thisKey].integerVersion < 170) {
                    if(typeof req.objectValues !== "undefined")
                        req.nodes = req.objectValues;
                }

                realityEditor.network.updateObject(objects[thisKey], req, thisKey);

                _this.cout("got object");


            });
        }
    }

    if (typeof thisAction.reloadNode !== "undefined") {
        console.log("gotdata: "+thisAction.reloadNode.object +" "+thisAction.reloadNode.node);
        console.log('http://' + objects[thisAction.reloadNode.object].ip + ':' + httpPort + '/object/' + thisAction.reloadNode.object + "/node/" + thisAction.reloadNode.node+"/");
        if(thisAction.reloadNode.object in objects) {
                this.getData(
                    'http://' + objects[thisAction.reloadNode.object].ip + ':' + httpPort + '/object/' + thisAction.reloadNode.object + "/node/" + thisAction.reloadNode.node+"/", thisAction.reloadNode.object, function (req, thisKey, thisNode) {

                    console.log("------------------------------");
                    console.log(thisKey+"  "+thisNode);
                        console.log(req);

                        if(!objects[thisKey].nodes[thisNode]){
                            objects[thisKey].nodes[thisNode] = req;
                        } else {
                            realityEditor.network.updateNode(objects[thisKey].nodes[thisNode], req, thisKey, thisNode);
                        }


                    _this.cout("got object");

                }, thisAction.reloadNode.node);
            }
        }


    if (typeof thisAction.advertiseConnection !== "undefined") {
        this.realityEditor.advertisement.logic(thisAction.advertiseConnection);
    }


    if (thisAction.loadMemory) {
        var id = thisAction.loadMemory.object;
        var url = 'http://' + thisAction.loadMemory.ip + ':' + httpPort + '/object/' + id;

        this.getData(url, id, function (req, thisKey) {
            _this.cout('received memory', req.memory);
            objects[thisKey].memory = req.memory;
            _this.realityEditor.gui.memory.addObjectMemory(objects[thisKey]);
        });
    }

    for(var key in thisAction) {
        this.cout("found action: " + JSON.stringify(key));
    }
};

realityEditor.network.onInternalPostMessage = function(e) {
    var msgContent = {};
    if (e.data) {
        msgContent = JSON.parse(e.data);

    } else {
        msgContent = JSON.parse(e);
    }

    if (msgContent.resendOnElementLoad) {
        var elt = document.getElementById('iframe' + msgContent.nodeKey);
        if (elt) {
            var data = elt.dataset;
            realityEditor.network.onElementLoad(data.objectKey, data.nodeKey);
        }
    }

    var tempThisObject = {};
    var thisVersionNumber;

    if (!msgContent.version) {
        thisVersionNumber = 0;
    }
    else {
        thisVersionNumber = msgContent.version;
    }

    if (thisVersionNumber >= 170) {
        if ((!msgContent.object) || (!msgContent.object)) return;
    } else {
        if ((!msgContent.obj) || (!msgContent.pos)) return;
        msgContent.object = msgContent.obj;
        msgContent.node = msgContent.pos;
    }

    if (msgContent.object in objects) {
        if (msgContent.node === msgContent.object) {
            tempThisObject = objects[msgContent.object];
        } else if (msgContent.node in objects[msgContent.object].nodes) {
            tempThisObject = objects[msgContent.object].nodes[msgContent.node];
        } else if (msgContent.node in objects[msgContent.object].frames) {
            tempThisObject = objects[msgContent.object].frames[msgContent.node];
        } else return;

    } else if (msgContent.object in pocketItem) {
        if (msgContent.node === msgContent.object) {
            tempThisObject = pocketItem[msgContent.object];
        } else {
            if (msgContent.node in pocketItem[msgContent.object].nodes) {
                tempThisObject = pocketItem[msgContent.object].nodes[msgContent.node];
            } else return;
        }

    } else return;

    if (msgContent.width && msgContent.height) {
        var thisMsgNode = document.getElementById(msgContent.node);
        thisMsgNode.style.width = msgContent.width;
        thisMsgNode.style.height = msgContent.height;
        thisMsgNode.style.top = ((globalStates.width - msgContent.height) / 2);
        thisMsgNode.style.left = ((globalStates.height - msgContent.width) / 2);

        thisMsgNode = document.getElementById("iframe" + msgContent.node);
        thisMsgNode.style.width = msgContent.width;
        thisMsgNode.style.height = msgContent.height;
        thisMsgNode.style.top = ((globalStates.width - msgContent.height) / 2);
        thisMsgNode.style.left = ((globalStates.height - msgContent.width) / 2);

    }

    if (typeof msgContent.sendMatrix !== "undefined") {

        if (msgContent.sendMatrix === true) {

            if (tempThisObject.integerVersion >= 32) {

                tempThisObject.sendMatrix = true;
                document.getElementById("iframe" + msgContent.node).contentWindow.postMessage(
                    '{"projectionMatrix":' + JSON.stringify(globalStates.realProjectionMatrix) + "}", '*');
            }
        }
    }


    if (typeof msgContent.sendAcceleration !== "undefined") {
        console.log(msgContent.sendAcceleration);
        if (msgContent.sendAcceleration === true) {

            if (tempThisObject.integerVersion >= 32) {

                tempThisObject.sendAcceleration = true;

                if (globalStates.sendAcceleration === false) {
                    globalStates.sendAcceleration = true;
                    if (window.DeviceMotionEvent) {
                        console.log("motion activated");

                        window.addEventListener("deviceorientation", function () {

                        });

                        window.addEventListener("devicemotion", function () {

                            var thisState = globalStates.acceleration;

                            thisState.x = event.acceleration.x;
                            thisState.y = event.acceleration.y;
                            thisState.z = event.acceleration.z;

                            thisState.alpha = event.rotationRate.alpha;
                            thisState.beta = event.rotationRate.beta;
                            thisState.gamma = event.rotationRate.gamma;

                            // Manhattan Distance :-D
                            thisState.motion =
                                Math.abs(thisState.x) +
                                Math.abs(thisState.y) +
                                Math.abs(thisState.z) +
                                Math.abs(thisState.alpha) +
                                Math.abs(thisState.beta) +
                                Math.abs(thisState.gamma);

                        }, false);
                    } else {
                        console.log("DeviceMotionEvent is not supported");
                    }
                }
            }
        }
    }

    if (msgContent.globalMessage) {
        var iframes = document.getElementsByTagName('iframe');
        for (var i = 0; i < iframes.length; i++) {

            if (iframes[i].id !== "iframe" + msgContent.node && iframes[i].style.visibility !== "hidden") {
                var receivingObject = objects[iframes[i].id.substr(6)];
                if (receivingObject.integerVersion >= 32) {
                    var msg = {};
                    if (receivingObject.integerVersion >= 170) {
                        msg = {globalMessage: msgContent.globalMessage};
                    } else {
                        msg = {ohGlobalMessage: msgContent.ohGlobalMessage};
                    }
                    iframes[i].contentWindow.postMessage(JSON.stringify(msg), "*");
                }
            }
        }
    }

    if (typeof msgContent.fullScreen === "boolean") {
        // console.log("gotfullscreenmessage");
        if (msgContent.fullScreen === true) {
            tempThisObject.fullScreen = true;
            console.log("fullscreen: " + tempThisObject.fullScreen);
            document.getElementById("thisObject" + msgContent.node).style.webkitTransform =
                'matrix3d(1, 0, 0, 0,' +
                '0, 1, 0, 0,' +
                '0, 0, 1, 0,' +
                '0, 0, 0, 1)';

        }
        if (msgContent.fullScreen === false) {

            tempThisObject.fullScreen = false;
        }

    }

    if (typeof msgContent.createNode !== "undefined") {
        var node = new Node();
        node.name = msgContent.createNode.name;
        node.frame = msgContent.node;
        node.x = (tempThisObject.x || 0) + (Math.random() - 0.5) * 160;
        node.y = (tempThisObject.y || 0) + (Math.random() - 0.5) * 160;
        var nodeKey = node.frame + msgContent.createNode.name;
        objects[msgContent.object].nodes[nodeKey] = node;
        realityEditor.network.postNewNode(objects[msgContent.object].ip, msgContent.object, nodeKey, node);
    }

    if (typeof msgContent.beginTouchEditing !== "undefined") {
        var element = document.getElementById(msgContent.node);
        realityEditor.device.beginTouchEditing(element);
    }

    if (typeof msgContent.touchEvent !== "undefined") {
        var event = msgContent.touchEvent;
        var target = document.getElementById(msgContent.node);
        if (!target) {
            return;
        }
        var fakeEvent = {
            currentTarget: target,
            clientX: event.x,
            clientY: event.y,
            pageX: event.x,
            pageY: event.y,
            preventDefault: function(){}
        };
        if (event.type === 'touchmove') {
            if (overlayDiv.style.display !== 'inline') {
                realityEditor.device.onDocumentPointerDown(fakeEvent);
            }
            realityEditor.device.onDocumentPointerMove(fakeEvent);
            realityEditor.device.onTouchMove(fakeEvent);
        } else if (event.type === 'touchend') {
            realityEditor.device.onDocumentPointerUp(fakeEvent);
            realityEditor.device.onMultiTouchEnd(fakeEvent);
            var frame = document.getElementById('iframe' + msgContent.node);
            if (frame) {
                frame.contentWindow.postMessage(JSON.stringify({
                    stopTouchEditing: true
                }), "*");
            }
        }
    }
};

realityEditor.network.deleteData = function(url, content) {
    var request = new XMLHttpRequest();
    request.open('DELETE', url, true);
    var _this = this;
    request.onreadystatechange = function () {
        if (request.readyState == 4) _this.cout("It deleted!");
    };
    request.setRequestHeader("Content-type", "application/json");
    //request.setRequestHeader("Content-length", params.length);
    // request.setRequestHeader("Connection", "close");
    if (content) {
        request.send(JSON.stringify(content));
    } else {
        request.send();
    }
    this.cout("deleteData");
};

realityEditor.network.deleteLinkFromObject = function(ip, thisObjectKey, thisKey) {
    // generate action for all links to be reloaded after upload
    this.cout("I am deleting a link: " + ip);
    this.deleteData('http://' + ip + ':' + httpPort + '/object/' + thisObjectKey + "/link/" + thisKey+"/lastEditor/"+globalStates.tempUuid);
};

realityEditor.network.deleteNodeFromObject = function(ip, thisObjectKey, thisKey) {
    // generate action for all links to be reloaded after upload
    this.cout("I am deleting a link: " + ip);
    this.deleteData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisKey+"/node/lastEditor/"+globalStates.tempUuid);
};

realityEditor.network.deleteBlockFromObject = function(ip, thisObjectKey, thisLogicKey, thisBlockKey) {
    // generate action for all links to be reloaded after upload
    this.cout("I am deleting a block: " + ip);
    // /logic/*/*/block/*/
    this.deleteData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/block/" + thisBlockKey+"/lastEditor/"+globalStates.tempUuid);
};

realityEditor.network.deleteBlockLinkFromObject = function(ip, thisObjectKey, thisLogicKey, thisBlockLinkKey) {
    // generate action for all links to be reloaded after upload
    this.cout("I am deleting a block link: " + ip);
    // /logic/*/*/link/*/
    this.deleteData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/link/" + thisBlockLinkKey+"/lastEditor/"+globalStates.tempUuid);
};

realityEditor.network.getData = function(url, thisKey, callback, thisNode) {
    if(!thisNode) thisNode = null;
    var _this = this;
    var req = new XMLHttpRequest();
    try {
        req.open('GET', url, true);
        // Just like regular ol' XHR
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    // JSON.parse(req.responseText) etc.
                    if(req.responseText)
                        callback(JSON.parse(req.responseText), thisKey, thisNode);
                } else {
                    // Handle error case
                    console.log("could not load content")
                    _this.cout("could not load content");
                }
            }
        };
        req.send();

    }
    catch (e) {
        this.cout("could not connect to" + url);
    }
};

/**
 * POST data as json to url, calling callback with the
 * JSON-encoded response data when finished
 * @param {String} url
 * @param {Object} body
 * @param {Function<Error, Object>} callback
 */
realityEditor.network.postData = function(url, body, callback) {
    var request = new XMLHttpRequest();
    var params = JSON.stringify(body);
    request.open('POST', url, true);
    request.onreadystatechange = function () {
        if (request.readyState !== 4) {
            return;
        }
        if (!callback) {
            return;
        }

        if (request.status === 200) {
            try {
                callback(null, JSON.parse(request.responseText));
            } catch(e) {
                callback({status: request.status, error: e, failure: true}, null);
            }
            return;
        }

        callback({status: request.status, failure: true}, null);
    };

    request.setRequestHeader("Content-type", "application/json");
    //request.setRequestHeader("Content-length", params.length);
    // request.setRequestHeader("Connection", "close");
    request.send(params);
};

realityEditor.network.postLinkToServer = function(linkObject, objects){
    var thisTempObject = objects[linkObject.objectA];
    var thisTempObjectLinks = thisTempObject.links;
    var thisOtherTempObject = objects[linkObject.objectB];

    var okForNewLink = this.checkForNetworkLoop(linkObject.objectA, linkObject.nodeA, linkObject.logicA, linkObject.objectB, linkObject.nodeB, linkObject.logicB);

    //  window.location.href = "of://event_" + objects[globalProgram.objectA].visible;

    if (okForNewLink) {
        var thisKeyId = this.realityEditor.device.utilities.uuidTimeShort();

        var namesA, namesB;

        if(linkObject.logicA !== false){

            var color;

            if(linkObject.logicA === 0) color = "BLUE";
            if(linkObject.logicA === 1) color = "GREEN";
            if(linkObject.logicA === 2) color = "YELLOW";
            if(linkObject.logicA === 3) color = "RED";

            namesA = [thisTempObject.name, thisTempObject.nodes[linkObject.nodeA].name +":"+color];
        } else {
            namesA =  [thisTempObject.name, thisTempObject.nodes[linkObject.nodeA].name];
        }

        if(linkObject.logicB !== false){

            var color;

            if(linkObject.logicB === 0) color = "BLUE";
            if(linkObject.logicB === 1) color = "GREEN";
            if(linkObject.logicB === 2) color = "YELLOW";
            if(linkObject.logicB === 3) color = "RED";

            namesB = [thisOtherTempObject.name, thisOtherTempObject.nodes[linkObject.nodeB].name +":"+color];
        } else {
            namesB =  [thisOtherTempObject.name, thisOtherTempObject.nodes[linkObject.nodeB].name];
        }
        
        thisTempObjectLinks[thisKeyId] = {
            objectA: linkObject.objectA,
            objectB: linkObject.objectB,
            nodeA: linkObject.nodeA,
            nodeB: linkObject.nodeB,
            logicA: linkObject.logicA,
            logicB: linkObject.logicB,
            namesA: namesA,
            namesB: namesB
        };

        // push new connection to objectA
        //todo this is a work around to not crash the server. only temporarly for testing
        //  if(globalProgram.logicA === false && globalProgram.logicB === false) {
        this.postNewLink(thisTempObject.ip, linkObject.objectA, thisKeyId, thisTempObjectLinks[thisKeyId]);
        //  }
    }
};

realityEditor.network.postNewLink = function(ip, thisObjectKey, thisKey, content) {
    // generate action for all links to be reloaded after upload
    content.lastEditor = globalStates.tempUuid;
        this.cout("sending Link");
    this.postData('http://' + ip + ':' + httpPort + '/object/' + thisObjectKey + "/link/" + thisKey, content);
};

realityEditor.network.postNewNode = function(ip, objectKey, nodeKey, node) {
    node.lastEditor = globalStates.tempUuid;
    this.postData('http://' + ip + ':' + httpPort + '/object/' + objectKey + '/node/' + nodeKey, node, function(err) {
        if (err) {
            console.log('postNewNode error:', err);
        }
    });

};

realityEditor.network.postNewBlockLink = function(ip, thisObjectKey, thisLogicKey, thisBlockLinkKey, blockLink) {
    this.cout("sending Block Link");
    var simpleBlockLink = this.realityEditor.gui.crafting.utilities.convertBlockLinkToServerFormat(blockLink);
    simpleBlockLink.lastEditor = globalStates.tempUuid;
    // /logic/*/*/link/*/
    this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/link/" + thisBlockLinkKey, simpleBlockLink);
};

realityEditor.network.postNewLogicNode = function(ip, thisObjectKey, thisLogicKey, logic) {
    this.cout("sending Logic Node");
    // /logic/*/*/node/

    var simpleLogic = this.realityEditor.gui.crafting.utilities.convertLogicToServerFormat(logic);
    simpleLogic.lastEditor = globalStates.tempUuid;
    this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/node/", simpleLogic);
};

realityEditor.network.postNewBlockPosition = function(ip, thisObjectKey, thisLogicKey, thisBlockKey, content) {
    // generate action for all links to be reloaded after upload
    this.cout("I am moving a block: " + ip);
    // /logic/*/*/block/*/
    content.lastEditor = globalStates.tempUuid;
    if (typeof content.x === "number" && typeof content.y === "number") {
        this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey +"/blockPosition/" + thisBlockKey, content);
    }
};

realityEditor.network.postNewBlock = function(ip, thisObjectKey, thisLogicKey, thisBlockKey, block) {
    this.cout("sending Block");
    // /logic/*/*/block/*/
    block.lastEditor = globalStates.tempUuid;
    this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/block/" + thisBlockKey, block);
};

realityEditor.network.checkForNetworkLoop = function(globalObjectA, globalLocationInA, globalLogicA, globalObjectB, globalLocationInB,globalLogicB) {
    var signalIsOk = true;
    var thisTempObject = objects[globalObjectA];
    var thisTempObjectLinks = thisTempObject.links;

    // check if connection is with it self
    if (globalObjectA === globalObjectB && globalLocationInA === globalLocationInB) {
        signalIsOk = false;
    }

    // todo check that objects are making these checks as well for not producing overlapeses.
    // check if this connection already exists?
    if (signalIsOk) {
        for (var thisSubKey in thisTempObjectLinks) {
            if (thisTempObjectLinks[thisSubKey].objectA === globalObjectA &&
                thisTempObjectLinks[thisSubKey].objectB === globalObjectB &&
                thisTempObjectLinks[thisSubKey].nodeA === globalLocationInA &&
                thisTempObjectLinks[thisSubKey].nodeB === globalLocationInB) {
                signalIsOk = false;
            }
        }
    }
    // check that there is no endless loops through it self or any other connections
    if (signalIsOk) {
        searchL(globalLocationInB, globalObjectB, globalLocationInA, globalObjectA);

        function searchL(nodeB, objectB, nodeA, objectA) {
            for (var key in objects[objectB].links) {
                this.cout(objectB);
                var Bn = objects[objectB].links[key];
                if (nodeB === Bn.nodeA) {
                    if (nodeA === Bn.nodeB && objectA === Bn.objectB) {
                        signalIsOk = false;
                        break;
                    } else {
                        searchL(Bn.nodeB, Bn.objectB, nodeA, objectA);
                    }
                }
            }
        }
    }

    return signalIsOk;
};


realityEditor.network.sendResetContent = function(object, node, type) {
// generate action for all links to be reloaded after upload

    var tempThisObject = {};
    if (type === "node") {
        tempThisObject = objects[object].nodes[node];
    } else if(type === "logic"){
        // todo might result in error??
        tempThisObject = objects[object].nodes[node];
    }
    else if (type === "ui"){
        if (object === node) {
            tempThisObject = objects[object];
        } else {
            console.warn('Refusing to reset content of frame');
            return;
        }
    }
    var content = {};
    content.x = tempThisObject.x;
    content.y = tempThisObject.y;
    content.scale = tempThisObject.scale;

    if (typeof tempThisObject.matrix === "object") {
        content.matrix = tempThisObject.matrix;
    }

    content.lastEditor = globalStates.tempUuid;
    if (typeof content.x === "number" && typeof content.y === "number" && typeof content.scale === "number") {
        this.postData('http://' + objects[object].ip + ':' + httpPort + '/object/' + object + "/size/" + node, content);
    }

};

/**
 * @desc
 * @param objectKey
 * @param nodeKey
 * @return
 **/


realityEditor.network.onElementLoad = function(objectKey, nodeKey) {

    globalStates.notLoading = false;
    // window.location.href = "of://event_test_"+nodeKey;

    // cout("posting Msg");
    var nodes;
    var version = 170;
    if (!objects[objectKey]) {
        nodes = {};
    } else {
        nodes = objects[objectKey].nodes;
        version = objects[objectKey].integerVersion;
    }

    var oldStyle = {
        obj: objectKey,
        pos: nodeKey,
        objectValues: nodes
    };

    var newStyle = {
        object: objectKey,
        objectData: objects[objectKey],
        node: nodeKey,
        nodes: nodes
    };

    if (version < 170) {
        newStyle = oldStyle;
    }
    globalDOMCach["iframe" + nodeKey]._loaded = true;
    globalDOMCach["iframe" + nodeKey].contentWindow.postMessage(
        JSON.stringify(newStyle), '*');
    this.cout("on_load");
};
