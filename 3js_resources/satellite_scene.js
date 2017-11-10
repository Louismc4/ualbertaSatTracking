var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,

mouseX = 0, mouseY = 0,
    
earthRadius = 455, sat_coords = [0,0,0],

windowHalfX = window.innerWidth / 2,
windowHalfY = window.innerHeight / 2,
stats, xPanel, yPanel,

SEPARATION = 200,
AMOUNTX = 10,
AMOUNTY = 10,

camera, cameraController, scene, renderer, controls;

var cube_sat, light, earthMesh;

init();
animate();

function init() {

    var container, separation = 100, amountX = 50, amountY = 50,
    particles, particle;

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 10000 );
    camera.position.z = 1000;
    cameraController = new THREE.Object3D();
    cameraController.add(camera);

    scene = new THREE.Scene();
    scene.add(cameraController);

    renderer = new THREE.WebGLRenderer({antialiasing : true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    container.appendChild( renderer.domElement );
    
    // info display
    stats = new Stats();
    xPanel = stats.addPanel( new Stats.Panel( ': long', '#ff8', '#221' ) );
    yPanel = stats.addPanel( new Stats.Panel( ': lat', '#5f8', '#221' ) );
    zPanel = stats.addPanel( new Stats.Panel( ': alt', '#46f', '#221' ) );
    stats.showPanel( 3 );
    container.appendChild( stats.dom );
    
    //controls
    controls = new THREE.OrbitControls( camera, renderer.domElement);
    controls.addEventListener( 'change', render );

    //var earthMesh, Atmos, AtmosMat;
    var Atmos, AtmosMat;
    light = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI / 2, 1);
    light.position.set(4000, 4000, 1500);
    light.target.position.set (1000, 3800, 1000);
    light.castShadow = true;
    scene.add(light);

    //EARTH
    var earthGeo = new THREE.SphereGeometry (455, 400, 400),
        earthMat = new THREE.MeshPhongMaterial();
    earthMesh = new THREE.Mesh(earthGeo, earthMat);
                
    earthMesh.position.set(0, 0, 0);
    scene.add(earthMesh);
    var temp_coords = latLongToCoords(sat_latitudeStr, sat_longitudeStr, earthRadius + 60);
    var sat_pos = new THREE.Vector3(temp_coords[0], temp_coords[1], temp_coords[2]);
    if (distanceBetween(camera.position, sat_pos) > distanceBetween(camera.position, earthMesh.position)) {
        camera.position.z = -1000;
    }
                
    //diffuse
    earthMat.map = THREE.ImageUtils.loadTexture('./3js_resources/textures/Albedo_medium.jpg');
    //bump
    earthMat.bumpMap = THREE.ImageUtils.loadTexture('./3js_resources/textures/bump-map.jpg');
    earthMat.bumpScale = 8;
    //specular
    earthMat.specularMap = THREE.ImageUtils.loadTexture('./3js_resources/textures/earthspec1k.jpg');
    earthMat.specular = new THREE.Color('#2e2e2e');
               
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
       
    //Atmosphere
    AtmosMat = new THREE.ShaderMaterial({
      uniforms:{
        "c": { type: "f", value: 0.3 },
        "p": { type: "f", value: 5.2},
        glowColor: { type: "c", value: new THREE.Color(0x00dbdb)},
        viewVector: { type: "v3", value: camera.position}
      },
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    Atmos = new THREE.Mesh(earthGeo, AtmosMat);
    Atmos.position = earthMesh.position;
    Atmos.position.x -= 50;
//    Atmos.position.x += 10;
//    Atmos.position.y += 10;
    Atmos.scale.multiplyScalar(1.25);
    scene.add(Atmos);

    //STARS
    var starGeo = new THREE.SphereGeometry (3000, 10, 100),
        starMat = new THREE.MeshBasicMaterial();
    starMat.map = THREE.ImageUtils.loadTexture('./3js_resources/textures/star-field.png');
    starMat.side = THREE.BackSide;
                
    var starMesh = new THREE.Mesh(starGeo, starMat);
                
    scene.add(starMesh);
    
    // OLD
    
    //var geometry = new THREE.SphereGeometry( 455, 256, 256 );
    //var material = new THREE.MeshPhongMaterial()
	//var material = new THREE.MeshBasicMaterial();
    //material.map = THREE.ImageUtils.loadTexture('3js_resources/textures/Albedo.jpg')
    // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    //var cube = new THREE.Mesh( geometry, material );
//    cube.rotation.y += 0.4;
//    cube.rotation.z += 0.15;
//    cube.rotation.x += 0;
    //scene.add( cube );
	
	//var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	//scene.add( light );
    
    var loader = new THREE.JSONLoader();
    loader.load('3js_resources/model/ExAlta1_low.json', function(geometry, materials) {
        cube_sat = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        //cube_sat = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materials));
		//cube_sat = new THREE.Mesh(geometry);
        
		cube_sat.scale.x = cube_sat.scale.y = cube_sat.scale.z = 40;		
		scene.add( cube_sat );
		//scene.children[2].scale = new THREE.Vector3(10,10,10);
		/*
        if (cube_sat != null) {
			cube_sat.scale.x = cube_sat.scale.y = cube_sat.scale.z = 5;
            scene.add( cube_sat );
			console.log("MEOW2", ": ", scene);
        } else {
			var geometry = new THREE.SphereGeometry( 5, 32, 32 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			cube_sat = new THREE.Mesh( geometry, material );
			scene.add( cube_sat );
		}*/
        
    });
    

    // change to a key event listener or look up a better way to do this
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    document.addEventListener( 'keydown', onGetKeyDown );
    //
    window.addEventListener( 'resize', onWindowResize, false );

}

function onGetKeyDown ( event ) {
    var inputkeyCode = event.keyCode;
    if (inputkeyCode == 39) {
        // right arrow key
        cameraController.rotation.y += 0.04;
    } else if (inputkeyCode == 37) {
        // left arrow key
        cameraController.rotation.y -= 0.04;
    } else if (inputkeyCode == 38) {
        // up arrow key
        cameraController.rotation.x += 0.04;
    } else if (inputkeyCode == 40) {
        // down arrow key
        cameraController.rotation.x -= 0.04;
    } else if (inputkeyCode == 73) {
        // i key
        cameraController.scale.x += 0.04;
        cameraController.scale.y += 0.04;
        cameraController.scale.z += 0.04;
    } else if (inputkeyCode == 75) {
        // k key
        cameraController.scale.x -= 0.04;
        cameraController.scale.y -= 0.04;
        cameraController.scale.z -= 0.04;
    }
}

function distanceBetween(point1, point2) {
    var dx = point2.x - point1.x;
    var dy = point2.y - point1.y;
    var dz = point2.z - point1.z;
    return Math.sqrt((dx*dx) + (dy*dy) + (dz*dz));
}

function latLongToCoords(latitude, longitude, radius) {
    //var lat = 90 - (Math.acos(y / RADIUS_SPHERE)) * 180 / Math.PI;
    //var lon = ((270 + (Math.atan2(x , z)) * 180 / Math.PI) % 360) -180;
    //var lon = ((270 + (Math.atan2(x , z)) * 180 / Math.PI) % 360) -360;
    var phi   = (90-latitude)*(Math.PI/180);
    var theta = (longitude+180)*(Math.PI/180);

    x = -((radius) * Math.sin(phi)*Math.cos(theta));
    z = ((radius) * Math.sin(phi)*Math.sin(theta));
    y = ((radius) * Math.cos(phi));

    return [x,y,z];
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function onDocumentMouseMove(event) {

    //mouseX = event.clientX - windowHalfX;
    //mouseY = event.clientY - windowHalfY;
    mouseX += event.clientX - windowHalfX*0.5;
    mouseY += event.clientY - windowHalfY*0.5;
}

function onDocumentTouchStart( event ) {

    if ( event.touches.length > 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;

    }

}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;

    }

}

function updateSatellite() {
    sat_coords = latLongToCoords(sat_latitudeStr, sat_longitudeStr, earthRadius + 60);
    if (cube_sat != null) {
		cube_sat.position.x = sat_coords[0];
		cube_sat.position.y = sat_coords[1];
		cube_sat.position.z = sat_coords[2];
        
		//cameraController.position.x = cube_sat.position.x;
		//cameraController.position.y = cube_sat.position.y;
		//cameraController.position.z = cube_sat.position.z;
	}
    //console.log(sat_coords);
}

//

function animate() {

    requestAnimationFrame( animate );
    controls.update();
    render();
    //stats.update();
    //var x = 296;
    stats.begin();
    var x = sat_longitudeStr;
    var y = sat_latitudeStr;
    var z = sat_altitude;
    stats.end();
    xPanel.update( x, 180 );
    yPanel.update( y, 90 );
    zPanel.update( z, 1000 );

}

function render() {
    
    updateSatellite();

//    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
//    camera.position.y += ( - mouseY + 200 - camera.position.y ) * 0.05;
//    cameraController.rotation.x += ( mouseX - camera.position.x ) * 0.000001;
//    cameraController.rotation.y += ( - mouseY + 200 - camera.position.y ) * 0.000001;
    //camera.position.x = sat_coords[0]+200;
    //camera.position.y = sat_coords[1]+200;
    //camera.position.z = sat_coords[2]+200;
    light.position.set(camera.position.x, camera.position.y, camera.position.z);
    camera.lookAt( cube_sat.position );

    renderer.clear();
    renderer.render(scene, camera); 

}