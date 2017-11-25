var level0 = { 

"type": "node",
"name": "rootNode",

"children":
[
	// CAMERA
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 0, 10],
		"center": [0, 0, 0],
		"vup": [0, 1, 0],
		"fov": 20
	},

	// sprite
	{
		"type": "sprite",
		"name": "robotSprite",
		"scale": [2, 3, 1],
		"translate": [-1.2, 0, 0],
		"material":
		{
			"type": "spriteMaterial",
			"name": "smat1",
			"color": [1.0, 0.0, 0.0],
			"map": "robotImage.png",
		}
	},
	// sprite
	{
		"type": "sprite",
		"name": "robotSprite2",
		"scale": [2, 3, 1],
		"translate": [0, 0, 0],
		"material":
		{
			"type": "spriteMaterial",
			"name": "smat1",
			"color": [1.0, 0.5, 0.5],
			"map": "robotImage.png",
		}
	},
	// sprite
	{
		"type": "sprite",
		"name": "robotSprite2",
		"scale": [2, 3, 1],
		"translate": [1.2, 0, 0],
		"material":
		{
			"type": "spriteMaterial",
			"name": "smat1",
			"color": [1.0, 1.0, 1.0],
			"map": "robotImage.png",
		}
	},
]
}

