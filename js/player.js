
	var
	audio 			  = document.getElementById( 'audio' ),
    PARTICLE_COUNT    = 250,
    MAX_PARTICLE_SIZE = 12,
    MIN_PARTICLE_SIZE = 2,
    GROWTH_RATE       = 5,
    DECAY_RATE        = 0.5,

    BEAM_RATE         = 0.5,
    BEAM_COUNT        = 20,

    GROWTH_VECTOR = new THREE.Vector3( GROWTH_RATE, GROWTH_RATE, GROWTH_RATE ),
    DECAY_VECTOR  = new THREE.Vector3( DECAY_RATE, DECAY_RATE, DECAY_RATE ),
    beamGroup     = new THREE.Object3D(),
    particles     = group.children,
    colors        = [ 0xaaee22, 0x04dbe5, 0xff0077, 0xffb412, 0xf6c83d ],
    t, dancer, kick;

function initDancer() {
	
	Dancer.setOptions({
		flashSWF : 'lib/soundmanager2.swf',
		flashJS  : 'lib/soundmanager2.js'
	});
	
	dancer = new Dancer();
	kick = dancer.createKick({
		frequency: [10, 1200],
		threshold: 0.1,
		decay: 0.1,
		onKick: function () {
			var i;
			if ( particles[ 0 ].scale.x > MAX_PARTICLE_SIZE ) {
				decay();
			} else {
				for ( i = PARTICLE_COUNT; i--; ) {
					particles[ i ].scale.addSelf( GROWTH_VECTOR );
				}
			}
			if ( !beamGroup.children[ 0 ].visible ) {
				for ( i = BEAM_COUNT; i--; ) {
					beamGroup.children[ i ].visible = true;
				}
			}
		},
		offKick: decay
	})
	
	setupDancer(dancer);
	dancer.fft( document.getElementById( 'fft' ) )
		.load( audio );
	
	Dancer.isSupported() || loaded();
	!dancer.isLoaded() ? dancer.bind( 'loaded', loaded ) : loaded();
}

function setupDancer(dancer) {
	dancer.onceAt( 0, function () {
		kick.on();
	}).onceAt( 3, function () {
		scene.add( beamGroup );
		changeParticleMat( 'white' );
	}).after( 3, function () {
		beamGroup.rotation.x += BEAM_RATE;
		beamGroup.rotation.y += BEAM_RATE;
	}).onceAt( 19, function () {
		changeParticleMat();
	}).onceAt( 53, function () {
		changeParticleMat( 'blue' );
	}).onceAt( 62, function () {
		changeParticleMat();
	}).onceAt( 113, function () {
		changeParticleMat( 'white' );
	}).onceAt( 124, function () {
		changeParticleMat( 'pink' );
	}).onceAt( 132, function () {
		changeParticleMat();
	}).onceAt( 203, function () {
		kick.off();
		document.getElementById('loading').style.display = 'inline';
	})
}

  function on () {
    for ( var i = PARTICLE_COUNT; i--; ) {
      particle = new THREE.Particle( newParticleMat() );
      particle.position.x = Math.random() * 2000 - 1000;
      particle.position.y = Math.random() * 2000 - 1000;
      particle.position.z = Math.random() * 2000 - 1000;
      particle.scale.x = particle.scale.y = Math.random() * 10 + 5;
      group.add( particle );
    }
    scene.add( group );

    // Beam idea from http://www.airtightinteractive.com/demos/js/nebula/
    var
      beamGeometry = new THREE.PlaneGeometry( 5000, 50, 1, 1 ),
      beamMaterial, beam;

    for ( i = BEAM_COUNT; i--; ) {
      beamMaterial = new THREE.MeshBasicMaterial({
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        color: colors[ ~~( Math.random() * 5 )]
      });
      beam = new THREE.Mesh( beamGeometry, beamMaterial );
      beam.doubleSided = true;
      beam.rotation.x = Math.random() * Math.PI;
      beam.rotation.y = Math.random() * Math.PI;
      beam.rotation.z = Math.random() * Math.PI;
      beamGroup.add( beam );
    }
  }
  
  function decay () {
    if ( beamGroup.children[ 0 ].visible ) {
      for ( i = BEAM_COUNT; i--; ) {
        beamGroup.children[ i ].visible = false;
      }
    }

    for ( var i = PARTICLE_COUNT; i--; ) {
      if ( particles[i].scale.x - DECAY_RATE > MIN_PARTICLE_SIZE ) {
        particles[ i ].scale.subSelf( DECAY_VECTOR );
      }
    }
  }
  
  function changeParticleMat ( color ) {
    for ( var i = PARTICLE_COUNT; i--; ) {
      particles[i].scale.x = particles[i].scale.y = Math.random() * 10 + 5;
    }
    
    var mat = newParticleMat( color );
    for ( var i = PARTICLE_COUNT; i--; ) {
      if ( !color ) {
        mat = newParticleMat();
      }
      particles[ i ].material = mat;
    }
    
    decay();
  }

  function newParticleMat( color ) {
    var
      sprites = [ 'pink', 'orange', 'yellow', 'blue', 'green' ],
      sprite = color || sprites[ ~~( Math.random() * 5 )];

    return new THREE.ParticleBasicMaterial({
      blending: THREE.AdditiveBlending,
      size: MIN_PARTICLE_SIZE,
      map: THREE.ImageUtils.loadTexture('images/particle_' + sprite + '.png'),
      vertexColor: 0xFFFFFF
    });
  }

  function loaded () {
    var
      loading = document.getElementById( 'loading' ),
      anchor  = document.createElement('A'),
      supported = Dancer.isSupported(),
      p;

    anchor.appendChild( document.createTextNode( supported ? 'Play!' : 'Close' ) );
    anchor.setAttribute( 'href', '#' );
    loading.innerHTML = '';
    loading.appendChild( anchor );

    if ( !supported ) {
      p = document.createElement('P');
      p.appendChild( document.createTextNode( 'Your browser does not currently support either Web Audio API or Audio Data API. The audio may play, but the visualizers will not move to the music; check out the latest Chrome or Firefox browsers!' ) );
      loading.appendChild( p );
    }

    anchor.addEventListener( 'click', function () {
	  setupDancer(dancer);
      dancer.play();
      document.getElementById('loading').style.display = 'none';
    }, false );

  }
  
  function dancerDebug() {
	window.dancer = dancer;
  }
  
  on();
  initDancer();
  dancerDebug();
