
//----------------------------------------------------------------------//
// CS 4143 GAME ENGINE BASE
// Author: David Cline 
//----------------------------------------------------------------------//

/*
Description:
	Game Engine Base.
	For use by students in CS 4143 at Oklahoma State University, Fall 2017.
	Provides basic code for loading scenes, loading assets, a game loop, 
	input, and scripting.

Scenes:
	Scene files are typically written in JSON.  The exact format of the
	scenes is specified by the parser. These set up an initial static
	configuration of a game level.

Cross-Origin File Requests
	When testing locally, some of the browsers block 
	"Cross origin" requests that come though the "File" protocol.
	If this is blocked, requests that happen after the page loads will
	not work. For the following browsers, use the following:

	Firefox 
		should allow these requests by default
	Safari 
		has a "Develop" option to disable cross-origin restrictions
	Chrome
		use SimpleHTTPServer to serve files using the http protocol
		instead.  In fact, all of the browswers could be tested
		this way. See description below:

		Python provides a simple http server that can be used to test files
		on the local machine (since the file server will likely not work.
		From the directory that you want to be the root of localhost, 
		run python with the command:
			python -m SimpleHTTPServer
		It should respond with
			Serving HTTP on 0.0.0.0 port 8000 ...
		At this point, in your browser, you should be able to access files
		using the URL
			http://localhost:8000/
*/

//----------------------------------------------------------------------//
// GLOBALS
//----------------------------------------------------------------------//

//--------------- SOME CONSTANTS

var constants = {
	// AXIS CONSTANTS
	XAXIS: new THREE.Vector3(1,0,0),
	YAXIS: new THREE.Vector3(0,1,0),
	ZAXIS: new THREE.Vector3(0,0,1)
}

//--------------- GAME ENGINE SPECIFIC VARIABLES

var engine = {
	DEBUG: false, 		// Whether to run in debug mode
	debugText: "",
	startTime: 0, 		// When the scene was loaded (in seconds)

	rendererContainer: undefined,   // A div element that will hold the renderer
	canvas: undefined,				// The game canvas
	loadingManager: undefined,		// loading manager for loading assets

	mouseX: 0,			// Current position of mouse
	mouseY: 0,			
	mousePrevX: 0,		// Previous position of mouse
	mousePrevY: 0, 
	mouseDown: 0,       // Which mouse button currently down   
	mouseScroll: 0,	    // How much the mouse wheel has scrolled  
	mousePrevScroll: 0, 

	pressedKeys: {},    // Which keys are currently depressed

	touchX: 0,          // The latest touch position 
	touchY: 0,			// (Multitouch not supported)
	touchPrevX: 0,
	touchPrevY: 0,

	accelX: 0,      // accelerometer data including gravity
	accelY: 0,
	accelZ: 0,

	compassHeading: 0   // compass heading (0 = north)
};

//--------------- THE CURRENT GAME STATE

var gameState = {
	scene: undefined,     
	camera: undefined,
	renderer: undefined,
	lost: false
};

//----------------------------------------------------------------------//
// PERFORM GENERAL INITIALIZATION. CREATE THE RENDERER AND LOADING
// MANAGER, AND START LISTENING TO GUI EVENTS.
//----------------------------------------------------------------------//

var initEngineFullScreen = function()
{
	debug("initEngineFullScreen()\n");

	// Create a div element and the canvas
	var container = document.createElement("div");
	var canvas = document.createElement("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	engine.fullScreen = true;
	document.body.appendChild(container);
	container.appendChild(canvas);

	initEngine(canvas);
}

//----------------------------------------------------------------------//

var initEngine = function(canvas) 
{
	debug("initEngine\n");

	// prevent scrolling
	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only

	engine.startTime = (new Date()).getTime() * 0.001; // reset start time
	engine.canvas = canvas;

	// Make the loading manager for Three.js.
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function (item, loaded, total) { };

	// Create renderer and add it to the container (div element)
	var renderer = new THREE.WebGLRenderer( {antialias:true, canvas:canvas, devicePixelRatio: 1} );
	renderer.setPixelRatio(window.devicePixelRatio/2);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
	
	renderer.setSize(canvas.width, canvas.height );
	gameState.renderer = renderer;

	// Add event listeners so we can respond to events
	window.addEventListener( 'resize', gOnWindowResize );
	//
	document.addEventListener( "click", gOnClick );
	document.addEventListener( "mouseup", gOnMouseUp );
	document.addEventListener( "mousedown", gOnMouseDown );
	document.addEventListener( "mousemove", gOnMouseMove );
	document.addEventListener( "mousewheel", gOnMouseWheel );
	document.addEventListener( "DOMMouseScroll", gOnMouseWheel ); // firefox
	//
    window.addEventListener( "keydown", gOnKeyDown );
    window.addEventListener( "keyup", gOnKeyUp );
    //
    // mobile events
    engine.touchDevice = ("ontouchstart" in document.documentElement)
    if (engine.touchDevice)
    {
        canvas.addEventListener( "touchstart", gOnTouchStart );
        canvas.addEventListener( "touchmove", gOnTouchMove );
        window.addEventListener( "devicemotion", gOnMotion );
        //
        var dor = "deviceorientation";
        if (window.chrome) dor = "deviceorientationabsolute";
        window.addEventListener( dor, gOnOrientation );
    }
}

//------------------------------------------------------------------//
// WINDOW RESIZE LISTENER
//------------------------------------------------------------------//

var gOnWindowResize = function(event) 
{
	debug("onWindowResize\n");

	if (engine.fullScreen)
	{
		engine.canvas.width = window.innerWidth;
		engine.canvas.height = window.innerHeight;
	}

	var width = engine.canvas.width;
	var height = engine.canvas.height;

	if (gameState.camera)
	{
		gameState.camera.aspect = width / height;
		gameState.camera.updateProjectionMatrix();
		gameState.renderer.setSize(width, height);
	}
}

//------------------------------------------------------------------//
// MOUSE LISTENERS
//------------------------------------------------------------------//

var gOnClick = function(event)
{
	debug("onClick\n");
	if (gameState.onClick) gameState.onClick(event);
}

var gOnMouseUp = function(event) 
{
	debug("onMouseUp\n");
	engine.mouseDown = 0;
	if (gameState.onMouseUp) gameState.onMouseUp(event);
}	

var gOnMouseDown = function(event) 
{
	debug("onMouseDown " + event.which + "\n");
	engine.mouseDown = event.which;
	if (gameState.onMouseDown) gameState.onMouseDown(event);
}	

var gOnMouseMove = function(event) 
{
	//debug("onMouseMove " + event.clientX + "," + event.clientY + "\n");
	
	// don't update previous position yet because asynchronous
	//mousePrevX = mouseX;  
	//mousePrevY = mouseY;

	var rect = engine.canvas.getBoundingClientRect();
	engine.mouseX = event.clientX - rect.left;
	engine.mouseY = event.clientY - rect.top;
	if (gameState.onMouseMove) gameState.onMouseMove(event);
}

var gOnMouseWheel = function(event)
{
	debug("onMouseWheel " + engine.mouseScroll + "\n");

	if (event.detail > 0 || event.detail < 0) {
		engine.mouseScroll += event.detail/120.0;
	}
	if (event.wheelDelta > 0 || event.wheelDelta < 0) {
		engine.mouseScroll += event.wheelDelta/120.0;
	}

	if (gameState.onMouseWheel) gameState.onMouseWheel(event);
}

//------------------------------------------------------------------//
// KEY LISTENERS
//------------------------------------------------------------------//

var gOnKeyDown = function(event) 
{
	var key = event.keyCode ? event.keyCode : event.which;
	engine.pressedKeys[key] = true;
	debug("onKeyDown " + key + "\n");

	if (gameState.onKeyDown) gameState.onKeyDown(event);
}

var gOnKeyUp = function(event)
{
	var key = event.keyCode ? event.keyCode : event.which;
	delete engine.pressedKeys[key];
	debug("onKeyUp " + key + "\n");

	if (gameState.onKeyUp) gameState.onKeyUp(event);
}

//------------------------------------------------------------------//
// TOUCH EVENTS
//------------------------------------------------------------------//

var gOnTouchStart = function(event)
{
	debug("onTouchStart\n");

	// handle a single touch event
    var rect = canvas.getBoundingClientRect();
    var touchObj = event.changedTouches[0]; // first event
    var touchX = touchObj.clientX - rect.left;
    var touchY = touchObj.clientY - rect.top;

    engine.touchX = touchX;
    engine.touchY = touchY;

    if (gameState.onTouchStart) gameState.onTouchStart(event);
	event.preventDefault();
}

var gOnTouchMove = function(event)
{
	debug("onTouchMove\n");

	// handle a single touch event
    var rect = canvas.getBoundingClientRect();
    var touchObj = event.changedTouches[0]; // first event
    var touchX = touchObj.clientX - rect.left;
    var touchY = touchObj.clientY - rect.top;

    engine.touchX = touchX;
    engine.touchY = touchY;

    if (gameState.onTouchMove) gameState.onTouchMove(event);
	event.preventDefault();
}

var gOnTouchEnd = function(event)
{
	debug("onTouchEnd\n");
	engine.touchX = undefined;
	engine.touchY = undefined;
	if (gameState.onTouchEnd) gameState.onTouchEnd(event);
	event.preventDefault();
}

//------------------------------------------------------------------//
// ORIENTATION (compass) AND ACCELERATION
//------------------------------------------------------------------//

var gOnOrientation = function(event)
{
	debug("onOrientation\n");
    var w = engine.canvas.width;
    var h = engine.canvas.height;

    var compassHeading = event.webkitCompassHeading;
    var alpha = event.alpha || 0;
    
    var angle = (-90-alpha) * Math.PI / 180.0;
    if (compassHeading) angle = (alpha-90) * Math.PI / 180.0;

    engine.angle = angle;
    if (gameState.onOrientation) gameState.onOrientation(event);

}

var gOnMotion = function(event)
{
	debug("onMotion\n");

	var dx = event.accelerationIncludingGravity.x || 0;
    var dy = event.accelerationIncludingGravity.y || 0;
    var dz = event.accelerationIncludingGravity.z || 0;
    
    // If not chrome, assume safari
    if (window.chrome === undefined) 
    {
    	dx = -dx;
    	dy = -dy;
    	dz = -dz;
    }

    engine.accelX = dx;
    engine.accelY = dy;
    engine.accelZ = dz;

    if (gameState.onMotion) gameState.onMotion(event);
}

//----------------------------------------------------------------------//
// PRINT A DEBUG MESSAGE
//----------------------------------------------------------------------//

var debug = function(message)
{
	console.log(message);
	if (engine.DEBUG)
	{
		var element = document.getElementById("debug");
		if (element === undefined) return;

		engine.debugText += message;
		var n = engine.debugText.length;
		if (n > 250) 
		{
			engine.debugText = engine.debugText.substring(n-250);
		}
		element.innerHTML = engine.debugText;
	}
}

//----------------------------------------------------------------------//
// GET THE ELAPSED TIME (SINCE THE PAGE LOADED) IN SECONDS
//----------------------------------------------------------------------//

var getElapsedTime = function()
{
	var d = new Date();
	var t = d.getTime() * 0.001 - engine.startTime;
	return t;
}

//----------------------------------------------------------------------//
// LOAD A SCENE (ASYNCHRONOUSLY)
// THE SCENE IS LOADED FROM THE SPECIFIED URL AS A STRING, AND THEN
// PARSED AS A JSON OBJECT.  AT THAT POINT parseScene IS CALLED ON
// IT, WHICH RECURSIVELY WALKS THE parseTree CREATING A Three.js scene.
//----------------------------------------------------------------------//

function loadScene(sceneURL)
{
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", sceneURL, true);
	httpRequest.send(null);
	httpRequest.onload = 
		function() {
			debug("loading " + sceneURL + " ...\n");
            var jsonParseTree = JSON.parse(httpRequest.responseText);
            debug("parsing\n");
            parseScene(jsonParseTree);
            debug("done.\n");
        }
}

//----------------------------------------------------------------------//
// ENTRY POINT TO RECURSIVE FUNCTION THAT TRAVERSES THE JSON PARSE
// TREE AND MAKES A SCENE. 
//----------------------------------------------------------------------//

function parseScene(jsonParseTree)
{
	debug("parseScene\n");

	var scene = new THREE.Scene();
	parseSceneNode(jsonParseTree, scene);
	gameState.scene = scene;
}

//----------------------------------------------------------------------//
// THE MAIN RECURSIVE FUNCTION OF THE PARSER.  
// THE JOB OF parseSceneNode IS TO TRAVERSE THE JSON OBJECT jsonNode 
// AND POPULATE A CORRESPONDING Three.js SceneNode
//----------------------------------------------------------------------//

function parseSceneNode(jsonNode, sceneNode)
{
	debug("parseSceneNode " + jsonNode["name"] + ":" + jsonNode["type"] + "\n");
	if (jsonNode === undefined || sceneNode === undefined) return;

	// Handle the transform of the node (translation, rotation, etc.)
	parseTransform(jsonNode, sceneNode);

	// Load any script files (note that these are not scripts attached
	// to the current node, just files that contain code.)
	if ("scriptFiles" in jsonNode) {
		var scriptList = jsonNode["scriptFiles"];
		for (var i=0; i<scriptList.length; i++) {
			var scriptURL = scriptList[i];
			loadScript(scriptURL);
		}
	}

	// User data that will be placed in the node. Can be arbitrary.
	// Includes the names of any scripts attached to the node.
	if ("userData" in jsonNode) {
		sceneNode["userData"] = jsonNode["userData"];
	} else {
		sceneNode["userData"] = {};
	}

	// Load and play background music
	if ("backgroundMusic" in jsonNode) {
		var audio = new Audio(jsonNode["backgroundMusic"]);
		debug("playing " + jsonNode["backgroundMusic"] + "\n");
		audio.play();
	}

	// The name of the node (useful to look up later in a script)
	if ("name" in jsonNode) {
		sceneNode["name"] = jsonNode["name"];
	}

	// Whether the node starts out as visible.
	if ("visible" in jsonNode) {
		sceneNode.setVisible(jsonNode["visible"]);
	}

	// Traverse all the child nodes. The typical code pattern here is:
	//   1. call a special routine that creates the child based on its type.  
	//      This routine also deals with attributes specific to that node type. 
	//   2. Make a recursive call to parseSceneNode, which handles general
	//      properties that any node can include. 

	if ("children" in jsonNode) {
        var children = jsonNode["children"];
        for (var i = 0; i < children.length; i++) {
            var childJsonNode = children[i];
            var childType = childJsonNode["type"];

            if (childType == "node") { // empty object to hold a transform
                var childSceneNode = new THREE.Object3D();
                sceneNode.add(childSceneNode);
                parseSceneNode(childJsonNode, childSceneNode);
            }
            if (childType == "perspectiveCamera") {
                var camera = parsePerspectiveCamera(childJsonNode);
                sceneNode.add(camera);
                if (gameState.camera === undefined) gameState.camera = camera;
                parseSceneNode(childJsonNode, camera);
            }
            else if (childType == "directionalLight") {
                var light = parseDirectionalLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if (childType == "mesh") {
                var mesh = parseMesh(childJsonNode);
                sceneNode.add(mesh);
                parseSceneNode(childJsonNode, mesh);
            }
            else if (childType == "ambientLight") {
                var light = parseAmbientLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if (childType == "pointLight") {
                var light = parsePointLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if (childType == "hemisphereLight") {
                var light = parseHemisphereLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if (childType == "spotLight") {
                var light = parseSpotLight(childJsonNode, sceneNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if (childType == "text") {
                parseText(childJsonNode, sceneNode);
            }
            else if (childType == "sprite"){
            	var sprite = parseSprite(childJsonNode);
            	sceneNode.add(sprite);
            	parseSceneNode(childJsonNode, sprite);
			}
            else if (childType == "skyBox") {
            	var skybox = parseSkyBox(childJsonNode);
            	sceneNode.add(skybox);
            	parseSceneNode(childJsonNode, skybox);
			}
            else if (childType == "objFile") {
                parseObjFile(childJsonNode, sceneNode);
            }
        }
    }
}
function parseObjFile(jsonNode, parentSceneNode)
{
    var material = parseMaterial(jsonNode["material"]);
    var modelURL = jsonNode["url"];

    // Callbacks for different aspects of loading
    var onLoad = function(mesh) {
        mesh.traverse(onTraverse);
        parentSceneNode.add(mesh);
        parseSceneNode(jsonNode, mesh);
    }
    var onTraverse = function (child) {
        if (child instanceof THREE.Mesh) {
            child.material = material;
        }
    };
    var onProgress = function (x) {
        // nothing
    };
    var onError = function (x) {
        debug("Error! could not load " + modelURL);
    };

    // Load the model using the callbacks previously defined
    var loader = new THREE.OBJLoader(loadingManager);
    loader.load(modelURL, onLoad, onProgress, onError);
}

//----------------------------------------------------------------------//
// PARSE A TRANSFORM
//----------------------------------------------------------------------//

function parseTransform(jsonNode, sceneNode)
{
	//debug("parseTransform\n");

	if ("translate" in jsonNode) {
		var translate = jsonNode["translate"];
		sceneNode.position.x += translate[0];
		sceneNode.position.y += translate[1];
		sceneNode.position.z += translate[2];
	}
	if ("scale" in jsonNode) {
		var scale = jsonNode["scale"];
		sceneNode.scale.x *= scale[0];
		sceneNode.scale.y *= scale[1];
		sceneNode.scale.z *= scale[2];
	}
	if ("rotate" in jsonNode) {
		var rotate = jsonNode["rotate"];
		var axis = new THREE.Vector3(rotate[0], rotate[1], rotate[2]);
		var radians = rotate[3];
		sceneNode.rotateOnAxis(axis, radians);
	}
}
var parseSprite = function(jsonNode)
{
    //debug("parseSprite\n");

    var material = parseMaterial(jsonNode["material"]);
    var mesh = new THREE.Sprite(material);
    return mesh;
}
//----------------------------------------------------------------------//
// PARSE A PERSPECTIVE CAMERA
//----------------------------------------------------------------------//

function parsePerspectiveCamera(jsonNode)
{
	//debug("parsePerspectiveCamera\n");

	// Start with default values
	var near = 0.2;
	var far = 10000.0;
	var aspect = engine.canvas.width / engine.canvas.height;
	var fovy = 60.0;
	var eye = [0.0, 0.0, 100.0];
	var vup = [0.0, 1.0, 0.0];
	var center = [0.0, 0.0, 0.0];

	// Replace with data from jsonNode
	if ("near"   in jsonNode) near   = jsonNode["near"];
	if ("far"    in jsonNode) far    = jsonNode["far"];
	if ("fov"    in jsonNode) fovy   = jsonNode["fov"];
	if ("eye"    in jsonNode) eye    = jsonNode["eye"];
	if ("vup"    in jsonNode) vup    = jsonNode["vup"];
	if ("center" in jsonNode) center = jsonNode["center"];

	// Create and return the camera
	var camera = new THREE.PerspectiveCamera( fovy, aspect, near, far );
	camera.position.set( eye[0], eye[1], eye[2] );
	camera.up.set( vup[0], vup[1], vup[2] );
	camera.lookAt( new THREE.Vector3(center[0], center[1], center[2]) );
	return camera;
}

//----------------------------------------------------------------------//
// PARSE A DIRECTIONAL LIGHT
//----------------------------------------------------------------------//

function parseDirectionalLight(jsonNode) {
	//debug("parseDirectionalLight\n");

	// Start with default values
	var color = [1.0, 1.0, 1.0];
	var position = [1.0, 1.0, 1.0];

	// Replace with data from jsonNode
	if ("color"    in jsonNode) color    = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];

	// Create the light and return it
	var c = new THREE.Color(color[0], color[1], color[2]);	
	var light = new THREE.DirectionalLight( c );
	light.position.set( position[0], position[1], position[2] );
	return light;
}
function parseAmbientLight(jsonNode) {
    var color = [1.0, 1.0, 1.0];
    if ("color"    in jsonNode) color    = jsonNode["color"];
    // Create the light and return it
    var c = new THREE.Color(color[0], color[1], color[2]);
    var light = new THREE.AmbientLight(c);
    return light;
}
function parsePointLight(jsonNode) {
	var color = [0, 0 ,0];
	var position = [1,1,1];
	var intensity = 1;
	var distance = 0;
	var decay = 1;

	if ("color" in jsonNode) color = jsonNode["color"];
	if ("position" in jsonNode) position = jsonNode["position"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
	if ("distance" in jsonNode) distance = jsonNode["distance"];
	if ("decay" in jsonNode) decay = jsonNode["decay"];

	var c = new THREE.Color(color[0], color[1], color[2]);
	var light = new THREE.PointLight(c, intensity, distance, decay);
	light.position.set(position[0], position[1], position[2]);
	return light;
}
function parseHemisphereLight(jsonNode) {
	var skyColor = [0,0,0];
	var groundColor = [0,0,0];
	var intensity = 1;

	if ("skyColor" in jsonNode) skyColor = jsonNode["skyColor"];
	if ("groundColor" in jsonNode) groundColor = jsonNode["groundColor"];
	if ("intensity" in jsonNode) intensity = jsonNode["intensity"];

	var sc = new THREE.Color(skyColor[0], skyColor[1], skyColor[2]);
	var gc = new THREE.Color(groundColor[0], groundColor[1], groundColor[2]);
	console.log("test "+ sc + gc);
	var light = new THREE.HemisphereLight(sc, gc, intensity);
	return light;
}
function parseSpotLight(jsonNode, sceneNode) {
    var color = [0, 0, 0];
    var position = [0, 5, 0];
    var target = null;
    var intensity = 1;
    var angle = 0;
    var penumbra = 0;
    var distance = 0;
    var decay = 1;
    var castShadow = false;
    var mapSize = 512;

    if ("color" in jsonNode) color = jsonNode["color"];
    if ("position" in jsonNode) position = jsonNode["position"];
    if ("target" in jsonNode) target = jsonNode["target"];
    if ("intensity" in jsonNode) intensity = jsonNode["intensity"];
    if ("angle" in jsonNode) angle = jsonNode["angle"];
    if ("penumbra" in jsonNode) penumbra = jsonNode["penumbra"];
    if ("distance" in jsonNode) distance = jsonNode["distance"];
    if ("decay" in jsonNode) decay = jsonNode["decay"];
    if ("castShadow" in jsonNode) castShadow = jsonNode["castShadow"];
    if ("mapSize" in jsonNode) mapSize = jsonNode["mapSize"];

    var c = new THREE.Color(color[0], color[1], color[2]);

    var light = new THREE.SpotLight(c, intensity, distance, angle, penumbra, decay);
    	light.position.set(position[0], position[1], position[2]);
    	light.castShadow = castShadow;
    	light.shadow.mapSize.width = mapSize;
    	light.shadow.mapSize.height = mapSize;
    	if (target) {
                var target = jsonNode["target"];
            if (target) {
                light.target = sceneNode.getObjectByName(target);
            }
        }

	return light;
}
function parseText(jsonNode, parentSceneNode) {
    // FONTS ARE:
    // helvetiker_regular
    // helvetiker_bold
    // gentilis_regular
    // gentilis_bold
    // optimer_regular
    // optimer_bold
    // droid/droid_sans_bold
    // droid/droid_sans_mono_regular
    // droid/drois_sans_regular
    // droid/droid_serif_bold
    // droid/droid_serif_regular

    var material = parseMaterial(jsonNode["material"]);

    var loader = new THREE.FontLoader();
    var fontName = jsonNode["font"] || "helvetiker_regular";
    var fontURL = "../threejs/examples/fonts/" + fontName + ".typeface.json";

    loader.load(
        fontURL,
        function ( font ) {
            var size = jsonNode["size"] || 1.0;
            var bevelEnabled = jsonNode["bevelEnabled"];
            if (bevelEnabled === undefined) bevelEnabled = true;
            geometry = new THREE.TextGeometry( jsonNode["text"],
                {
                    font: font,
                    size: size,
                    height: jsonNode["height"] || size*0.1,
                    curveSegments: jsonNode["curveSegments"] || 5,
                    bevelEnabled: bevelEnabled,
                    bevelThickness: jsonNode["bevelThickness"] || size*0.03,
                    bevelSize: jsonNode["bevelSize"] || size*0.03,
                    bevelSegments: jsonNode["bevelSegments"] || 3
                }
            );
            geometry.computeBoundingBox();

            // centering
            var min = geometry.boundingBox.min;
            var max = geometry.boundingBox.max;
            geometry.translate(
                -(min.x+max.x)*0.5,
                -(min.y+max.y)*0.5,
                -(min.z+max.z)*0.5
            );
            geometry.computeBoundingBox();

            var fontMesh = new THREE.Mesh( geometry, material );
            fontMesh.castShadow = true;
            fontMesh.receiveShadow = true;
            parentSceneNode.add(fontMesh);
            parseSceneNode(jsonNode, fontMesh);
        }
    );
}

//----------------------------------------------------------------------//
// PARSE A MESH
//----------------------------------------------------------------------//

function parseMesh(jsonNode)
{
	//debug("parseMesh\n");

	// Get the material
	var material = parseMaterial(jsonNode["material"]);
	
	// Create the mesh geometry
	var geometryType = jsonNode["geometry"];
	var geometry;

	if (geometryType == "cube") {
		var width = 2;
		var height = 2;
		var depth = 2;
		if ("width"  in jsonNode) width  = jsonNode["width"];
		if ("height" in jsonNode) height = jsonNode["height"];
		if ("depth"  in jsonNode) depth  = jsonNode["depth"]; 
		geometry = new THREE.BoxGeometry(width, height, depth);
	}
	else if (geometryType == "sphere") {
		var radius = 1;
		var widthSegments = 8;
		var heightSegments = 6;
		if ("radius"         in jsonNode) radius         = jsonNode["radius"];       
		if ("widthSegments"  in jsonNode) widthSegments  = jsonNode["widthSegments"];
		if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
		geometry = new THREE.SphereGeometry(radius, heightSegments, widthSegments);
	} else if (geometryType == "plane") {
        var width = 1;
        var height = 1;
        var widthSegments = 1;
        var heightSegments = 1;
        if ("width"         in jsonNode) width         = jsonNode["width"];
        if ("height"         in jsonNode) height         = jsonNode["height"];
        if ("widthSegments"  in jsonNode) widthSegments  = jsonNode["widthSegments"];
        if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
        geometry = new THREE.PlaneGeometry(width, height, heightSegments, widthSegments);
	} else if (geometryType == "torus") {
		var radius = 100;
		var tube = 40;
        var radialSegments = 1;
        var tubularSegments = 1;
		var arc = Math.PI*2;
        if ("radius"         in jsonNode) radius         = jsonNode["radius"];
        if ("tube"         in jsonNode) tube         = jsonNode["tube"];
        if ("radialSegments"  in jsonNode) radialSegments  = jsonNode["radialSegments"];
        if ("tubularSegments" in jsonNode) tubularSegments = jsonNode["tubularSegments"];
        if ("arc"			in jsonNode) arc 	= jsonNode["arc"];
        geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
    } else if (geometryType == "cylinder") {
        var radiusTop = 20;
        var radiusBottom = 20;
        var height = 100;
        var radiusSegments = 8;
        var heightSegments = 1;
        var openEnded = false;
		var thetaStart = 0;
        var thetaLength = 2*Math.PI;
        if ("radiusTop"         in jsonNode) radiusTop         = jsonNode["radiusTop"];
        if ("radiusBottom"         in jsonNode) radiusBottom         = jsonNode["radiusBottom"];
        if ("height"  in jsonNode) height  = jsonNode["height"];
        if ("radiusSegments" in jsonNode) radiusSegments = jsonNode["radiusSegments"];
        if ("heightSegments"			in jsonNode) heightSegments 	= jsonNode["heightSegments"];
        if ("openEnded" in jsonNode) openEnded = jsonNode["openEnded"];
        if ("thetaStart" in jsonNode) thetaStart = jsonNode["thetaStart"];
        if ("thetaLength" in jsonNode) thetaLength = jsonNode["thetaLength"];
        geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart,thetaLength)
	} else if (geometryType == "cone") {
        var radius = 20;
        var height = 100;
        var radiusSegments = 8;
        var heightSegments = 1;
        var openEnded = false;
        var thetaStart = 0;
        var thetaLength = 2*Math.PI;
        if ("radius"         in jsonNode) radius         = jsonNode["radius"];
        if ("height"  in jsonNode) height  = jsonNode["height"];
        if ("radiusSegments" in jsonNode) radiusSegments = jsonNode["radiusSegments"];
        if ("heightSegments"			in jsonNode) heightSegments 	= jsonNode["heightSegments"];
        if ("openEnded" in jsonNode) openEnded = jsonNode["openEnded"];
        if ("thetaStart" in jsonNode) thetaStart = jsonNode["thetaStart"];
        if ("thetaLength" in jsonNode) thetaLength = jsonNode["thetaLength"];
        geometry = new THREE.ConeGeometry(radius, height, radiusSegments, heightSegments, openEnded, thetaStart,thetaLength)
    }
	// Create the mesh and return it
    if (material instanceof THREE.PointsMaterial) {
        var points = new THREE.Points(geometry, material);
        point.sortParticles = true;
        return points;
    }
    var mesh = new THREE.Mesh( geometry, material );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

//----------------------------------------------------------------------//
// PARSE A MATERIAL
//----------------------------------------------------------------------//

function parseMaterial(jsonNode)
{
	//debug("parseMaterial\n");
	//if (jsonNode === undefined) return new MeshLambertMaterial();
	var type = jsonNode["type"];
	if (type == "pointsMaterial"){
		var material = new THREE.PointCloudMaterial();
	}
	if (type == "spriteMaterial"){
		var material = new THREE.SpriteMaterial();
	}
	// Lambertian material
	if (type == "meshLambertMaterial") {
        var material = new THREE.MeshLambertMaterial();
    }
	// Basic (unlit) material
	if (type == "meshBasic") {
        var material = new THREE.MeshBasic();
    }

	if (type == "meshBasicMaterial") {
        var material = new THREE.MeshBasicMaterial();
    }

    if (type == "meshPhongMaterial") {
        var material = new THREE.MeshPhongMaterial();
    }
        if ("color" in jsonNode) {
            var d = jsonNode["color"];
            material.color = new THREE.Color(d[0], d[1], d[2]);
        }
		if ("diffuseColor" in jsonNode) {
			var d = jsonNode["diffuseColor"];
			material.color = new THREE.Color(d[0],d[1],d[2]);
		}
		if ("specular" in jsonNode) {
            var s = jsonNode["specular"];
            material.specular = new THREE.Color(s[0], s[1], s[2]);
        }
        if ("shininess" in jsonNode) {
			var s = jsonNode["shininess"];
			material.shininess = s;
		}
		if ("shading" in jsonNode) {
			var s = jsonNode["shading"];
            material.flatShading = true;
        }
        if ("bumpMap" in jsonNode) {
			var b = parseTexture(jsonNode["bumpMap"]);
			material.bumpMap = b;
		}
		if ("diffuseMap" in jsonNode) {
            var d = parseTexture(jsonNode["diffuseMap"]);
            material.diffuseMap = d;
        }
        if ("bumpScale" in jsonNode) {
			var bs = jsonNode["bumpScale"];
			material.bumpScale = bs;
		}
		if ("map" in jsonNode) {
			var t = parseTexture(jsonNode["map"]);
			material.map = t;
		}
		if ("size" in jsonNode) {
			material.size = jsonNode["size"];
		}
		if ("name" in jsonNode) {
			material.name = jsonNode["name"];
		}
    	if ("transparent" in jsonNode) {
        material.transparent = jsonNode["transparent"];
        material.alphaTest = 0.9; // hard coded threshold
    	}
		return material;
	// Failed to make a material, so return a default
	//return new THREE.MeshLambertMaterial();
}

//----------------------------------------------------------------------//
// PARSE A TEXTURE MAP - ASYNCHRONOUSLY LOADS THE TEXTURE IMAGE
//----------------------------------------------------------------------//

function parseTexture(textureURL)
{
	debug("parseTexture: " + textureURL + "\n");

	var texture = new THREE.Texture;

	/*
	// textureURL is the id of an img element 
	if (document.getElementById(textureURL))
	{
		var imageElement = document.getElementById(textureURL);
		texture.image = imageElement;
		texture.needsUpdate = true;
		return texture;
	}
	*/

	// Otherwise, assume textureURL is an image name
	var loader = new THREE.ImageLoader(engine.loadingManager);
	loader.load( 
		textureURL, 
		function(image) { // callback function
			texture.image = image;
			texture.needsUpdate = true;
		} 
	);
	return texture;
}

function parseSkyBox(jsonNode) {
    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = parseTexture(jsonNode["map"]);

    var material = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.unifroms,
        side: THREE.Backside
    } );
    var mesh = new THREE.Mesh(new THREE.CubeGeometry(500,500,500), material);
    return mesh;
}

//----------------------------------------------------------------------//
// ADD A SCRIPT TO THE RUNNING PAGE FROM AN EXTERNAL URL
//----------------------------------------------------------------------//

function loadScript(scriptURL)
{
	debug("loadScript " + scriptURL + "\n");
    
    // Create an element for the script
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptURL;

    // Add the script element to the head of the page
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(script);
}

//----------------------------------------------------------------------//
// THE MAIN FUNCTION OF THE GAME (ANIMATION) LOOP
//----------------------------------------------------------------------//

function startGameLoop() 
{
	requestAnimationFrame(startGameLoop);	// schedules another call to animate
	animateFrame();					// updates the scene for the frame
	render();						// draws the scene
}

//----------------------------------------------------------------------//
// CONTROLS ANIMATING A SINGLE FRAME
//----------------------------------------------------------------------//

function animateFrame()
{
	// Update the current camera and scene
	if (gameState.camera !== undefined) gameState.camera.updateProjectionMatrix();
	if (gameState.scene  !== undefined) gameState.scene.traverse(runScripts);

	// Update previous mouse and touch states here because animateFrame 
	// out of sync with listeners 
	engine.mousePrevX = engine.mouseX;
	engine.mousePrevY = engine.mouseY;
	engine.mousePrevScroll =  engine.mouseScroll;
	//
	engine.touchPrevX = engine.touchX;
	engine.touchPrevY = engine.touchY;
}

//----------------------------------------------------------------------//
// CALLBACK TO RUN ALL THE SCRIPTS FOR A GIVEN sceneNode
//----------------------------------------------------------------------//

function runScripts(sceneNode)
{
	var scripts = sceneNode.userData.scripts;
	if (scripts === undefined) return;

	for (var i=0; i<scripts.length; i++) {
		var f = window[scripts[i]]; // look up function by name
		if (f !== undefined) f(sceneNode);
	}
}

//----------------------------------------------------------------------//
// RENDER CURRENT SCENE WITH CURRENT RENDERER USING CURRENT CAMERA
//----------------------------------------------------------------------//

function render() 
{
	var gs = gameState;
	if (gs.scene && gs.camera && gs.renderer) {
		gs.renderer.render(gs.scene, gs.camera);
	}
	else {
		var msg = "";
		if (!gs.scene) msg += "no scene. ";
		if (!gs.camera) msg += "no camera. ";
		if (!gs.renderer) msg += "no renderer."
		debug(msg + "\n");
	}
}

//----------------------------------------------------------------------//
