var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,

mouseX = 0, mouseY = 0,
    
earthRadius = 455, sat_coords = [0,0,0],

windowHalfX = window.innerWidth / 2,
windowHalfY = window.innerHeight / 2,

SEPARATION = 200,
AMOUNTX = 10,
AMOUNTY = 10,

camera, scene, renderer;

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

    scene = new THREE.Scene();

    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    container.appendChild( renderer.domElement );

    // particles

    var PI2 = Math.PI * 2;
    var material = new THREE.SpriteCanvasMaterial( {

        color: 0xff0000,
        program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, 0.5, 0, PI2, true );
            context.fill();

        }

    } );

    for ( var i = 0; i < 1000; i ++ ) {

        particle = new THREE.Sprite( material );
        particle.position.x = Math.random() * 2 - 1;
        particle.position.y = Math.random() * 2 - 1;
        particle.position.z = Math.random() * 2 - 1;
        particle.position.normalize();
        particle.position.multiplyScalar( Math.random() * 10 + 450 );
        particle.scale.multiplyScalar( 2 );
        scene.add( particle );

    }

    // lines

    for (var i = 0; i < 300; i++) {

        var geometry = new THREE.Geometry();

        var vertex = new THREE.Vector3( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
        vertex.normalize();
        vertex.multiplyScalar( 450 );

        geometry.vertices.push( vertex );

        var vertex2 = vertex.clone();
        vertex2.multiplyScalar( Math.random() * 0.3 + 1 );

        geometry.vertices.push( vertex2 );

        var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x00ff00, opacity: Math.random() } ) );
        scene.add( line );
    }

    var geometry = new THREE.SphereGeometry( 455, 32, 32 );
    var material = new THREE.MeshPhongMaterial()
    material.map = THREE.ImageUtils.loadTexture('3js_resources/textures/Albedo.jpg')
    // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    
    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube_sat = new THREE.Mesh( geometry, material );
    scene.add( cube_sat );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

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

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
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
    sat_coords = latLongToCoords(sat_latitudeStr, sat_longitudeStr, earthRadius);
    
    cube_sat.position.x = sat_coords[0];
    cube_sat.position.y = sat_coords[1];
    cube_sat.position.z = sat_coords[2];
    console.log(sat_coords);
}

//

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {
    
    updateSatellite();

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
    camera.lookAt( scene.position );

    renderer.render( scene, camera );

}