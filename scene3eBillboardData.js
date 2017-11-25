var level0 = { 

"type": "node",
"name": "rootNode",

"children":
[
	// CAMERA
	{
		"type": "perspectiveCamera",
		"name": "camera1",
		"eye": [0, 3, 10],
		"center": [0, 0, 0],
		"vup": [0, 1, 0],
		"fov": 20,
		"userData": 
		{
			"scripts": ["moveCamera"]
		}
	},

	// billboard
	{
		"type": "mesh",
		"name": "billboard1",
		"scale": [1.0, 1.0, 1.0],
		"rotation": [1, 0, 0, -1.5708],
		"translate": [-1.2, 0, 0],
		"geometry": "plane",
		"material":
		{
			"type": "meshBasicMaterial",
			"name": "smat1",
			"transparent": true,
			"map": "robotImage.png"
		},
		"userData": 
		{
			"scripts": ["billboard"]
		}
	},
	// billboard
	{
		"type": "mesh",
		"name": "billboard2",
		"scale": [1.0, 1.0, 1.0],
		"rotation": [1, 0, 0, -1.57],
		"translate": [1.2, 0, 0],
		"geometry": "plane",
		"material":
		{
			"type": "meshBasicMaterial",
			"name": "smat2",
			"transparent": true,
			"map": "robotImage.png"
		},
		"userData": 
		{
			"scripts": ["billboard"]
		}
	},
	// billboard
	{
		"type": "mesh",
		"name": "billboard3",
		"scale": [1.0, 1.0, 1.0],
		"rotation": [1, 0, 0, -1.57],
		"translate": [0, 0, 0],
		"geometry": "plane",
		"material":
		{
			"type": "meshBasicMaterial",
			"name": "smat3",
			"map": "robotImage.png",
			"transparent": true
		},
		"userData": 
		{
			"scripts": ["billboard"]
		}
	}
]
}

