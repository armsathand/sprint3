var level0 = { 

"type": "node",
"name": "rootNode",

"children":
[
	// CAMERA
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 0, 18],
		"center": [0, 0, 0],
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

	// text
	{
		"type": "text",
		"font": "optimer_bold",
		"name": "text1",
		"text": "points",
		"bevelEnabled": false,
		"size": 2.5,
		"userData": 
		{ 
			"scripts": ["spinner"]
		},
		
		"material":
		{
			"type": "pointsMaterial",
			"name": "sm2",
			"size": 0.5,
			"transparent": true,
			"color": [1.0, 0.1, 0.1],
			"map": "dot.png"
		}
	},

	// text
	{
		"type": "text",
		"font": "optimer_bold",
		"name": "text1",
		"text": "points",
		"bevelEnabled": false,
		"size": 2.5,
		"userData": 
		{ 
			"scripts": ["spinner", "spinner", "spinner"]
		},
		
		"material":
		{
			"type": "pointsMaterial",
			"name": "sm2",
			"size": 0.2,
			"transparent": true,
			"color": [0.1, 0.1, 0.9],
		}
	},
]
}

