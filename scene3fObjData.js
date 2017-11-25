var level0 = { 

"type": "node",
"name": "rootNode",

"children":
[
	// CAMERA
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 2, 5],
		"center": [0, 0.9, 0],
		"vup": [0, 1, 0],
		"fov": 30
	},

	// LIGHTS
	{
		"type": "directionalLight",
		"name": "dlight1",
		"color": [1, 1, 0.5],
		"position": [1, 2, 1]
	},
	{
		"type": "directionalLight",
		"name": "dlight2",
		"color": [0.1, 0.1, 0.3],
		"position": [-1, 0.1, 0.5]
	},
	{
		"type": "hemisphereLight",
		"name": "hlight",
		"skyColor": [0.3, 0.3, 0.6],
		"groundColor": [0.2, 0.3, 0],
		"intensity": 1.0
	},

	// obj file
	{
		"type": "objFile",
		"name": "osuBot",
		"scale": [1, 1, 1],
		"translate": [0, 0, 0],
		"url": "osubot.obj",
		"material": 
		{
			"type": "meshPhongMaterial",
			"name": "sm2",
			"diffuseColor": [1, 1, 1],
			"specularColor": [0.01, 0.01, 0.01],
			"diffuseMap": "osubotAObake.png",
			"bumpMap": "osubotAObake.png",
			"bumpScale": 0.002,
			"shininess": 100
		},
		"userData": 
		{ 
			"scripts": ["spinner"]
		}
	},
]
}

