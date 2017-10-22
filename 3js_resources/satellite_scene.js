var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,

mouseX = 0, mouseY = 0,
    
earthRadius = 455, sat_coords = [0,0,0],

windowHalfX = window.innerWidth / 2,
windowHalfY = window.innerHeight / 2,

SEPARATION = 200,
AMOUNTX = 10,
AMOUNTY = 10,

camera, cameraController, scene, renderer;

var cube_sat;

init();
animate();

function init() {

    var container, separation = 100, amountX = 50, amountY = 50,
    particles, particle;

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
    camera.position.z = 1000;
    cameraController = new THREE.Object3D();
    cameraController.add(camera);

    scene = new THREE.Scene();
    scene.add(cameraController);

    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    container.appendChild( renderer.domElement );

    var geometry = new THREE.SphereGeometry( 455, 32, 32 );
    var material = new THREE.MeshPhongMaterial()
    material.map = THREE.ImageUtils.loadTexture('3js_resources/textures/Albedo.jpg')
    // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
//    cube.rotation.y += 0.4;
//    cube.rotation.z += 0.15;
//    cube.rotation.x += 0;
    scene.add( cube );
    
    var loader = new THREE.JSONLoader();
    loader.load('3js_resources/model/ExAlta1_low.json', function(geometry) {
        //cube_sat = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        //cube_sat = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materials));
		cube_sat = new THREE.Mesh(geometry);
        console.log("Meow", ": ", cube_sat);
        if (cube_sat != null) {
            scene.add( cube_sat );
        }
        
    });
    
    if (cube_sat == null) {
        var geometry = new THREE.SphereGeometry( 5, 32, 32 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        cube_sat = new THREE.Mesh( geometry, material );
        scene.add( cube_sat );
    }
    

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
    
    cube_sat.position.x = sat_coords[0];
    cube_sat.position.y = sat_coords[1];
    cube_sat.position.z = sat_coords[2];
    cameraController.position.x = cube_sat.position.x;
    cameraController.position.y = cube_sat.position.y;
    cameraController.position.z = cube_sat.position.z;
    //console.log(sat_coords);
}

//

function animate() {

    requestAnimationFrame( animate );

    render();

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
    camera.lookAt( cube_sat.position );

    renderer.render( scene, camera );

}