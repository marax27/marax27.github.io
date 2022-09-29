function main() {
  const scene = new THREE.Scene();

  const parent = document.getElementById("simulationWrapper");

  const screenDimensions = {
    width: parent.clientWidth,
    height: parent.clientHeight,
  };

  const camera = new THREE.PerspectiveCamera(
    75,
    screenDimensions.width / screenDimensions.height,
    0.5,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(screenDimensions.width, screenDimensions.height);

  renderer.domElement.classList.add("simulation-view");

  parent.appendChild(renderer.domElement);

  camera.position.z = 20;

  const bodies = createCelestialBodies();
  bodies.forEach((body) => scene.add(body));

  updatePositionsOnScreen(bodies);
  updateAccelerations(bodies);

  function handleResize() {
    screenDimensions.width = parent.clientWidth;
    screenDimensions.height = parent.clientHeight;

    renderer.setSize(screenDimensions.width, screenDimensions.height);
    camera.aspect = screenDimensions.width / screenDimensions.height;
    camera.updateProjectionMatrix();
  }

  function render() {
    updatePhysics(bodies);
    updatePositionsOnScreen(bodies);
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", handleResize, false);

  render();
}

function updatePhysics(bodies) {
  const deltaT = 360.0;
  const deltaT_2 = 0.5 * deltaT;
  const n = bodies.length;

  for (let i = 0; i < n; i++) {
    // V_mid
    bodies[i].V[0] += bodies[i].A[0] * deltaT_2;
    bodies[i].V[1] += bodies[i].A[1] * deltaT_2;
    bodies[i].V[2] += bodies[i].A[2] * deltaT_2;
  }

  for (let i = 0; i < n; i++) {
    // R1
    bodies[i].R[0] += bodies[i].V[0] * deltaT;
    bodies[i].R[1] += bodies[i].V[1] * deltaT;
    bodies[i].R[2] += bodies[i].V[2] * deltaT;
  }

  updateAccelerations(bodies);

  for (let i = 0; i < n; i++) {
    // V1
    bodies[i].V[0] += bodies[i].A[0] * deltaT_2;
    bodies[i].V[1] += bodies[i].A[1] * deltaT_2;
    bodies[i].V[2] += bodies[i].A[2] * deltaT_2;
  }
}

const Offset = [0.0, 0.0, 0.0];
function updateAccelerations(bodies) {
  const n = bodies.length;
  let r2 = -1.0;
  let multiplier = -1.0;

  for (let i = 0; i < n; i++) {
    if (i == 0) continue;

    Offset[0] = bodies[i].R[0] - bodies[0].R[0];
    Offset[1] = bodies[i].R[1] - bodies[0].R[1];
    Offset[2] = bodies[i].R[2] - bodies[0].R[2];

    r2 = Offset[0] * Offset[0] + Offset[1] * Offset[1] + Offset[2] * Offset[2];
    multiplier = bodies[0].GM * Math.pow(r2, -1.5);

    bodies[i].A[0] = multiplier * -Offset[0];
    bodies[i].A[1] = multiplier * -Offset[1];
    bodies[i].A[2] = multiplier * -Offset[2];
  }
}

function updatePositionsOnScreen(bodies) {
  const positionScale = 7e-6;

  bodies.forEach((body) => {
    body.position.set(
      body.R[0] * positionScale,
      body.R[1] * positionScale,
      body.R[2] * positionScale
    );
  });
}

function createCelestialBodies() {
  const bodies = [
    {
      name: "Jupiter",
      mass: 1.898e27,
      radius: 69911,
      R0: [1.153893903017146e2, -1.148461694337946e2, -2.620074534929387],
      V0: [6.122059310303819e-4, -6.729414247520527e-5, 6.140651069071555e-6],
    },
    {
      name: "Io",
      mass: 8.9319e22,
      radius: 1821.6,
      R0: [3.756821819566338e5, -1.923346784045779e5, -1.079765046069908e3],
      V0: [7.828975372621019, 1.544819077956768e1, 6.692275478537599e-1],
    },
    {
      name: "Europa",
      mass: 4.7998e22,
      radius: 1560.8,
      R0: [6.2805210236448e5, 2.468802062080678e5, 2.319657608417064e4],
      V0: [-4.918976258203184, 1.273741289567634e1, 3.54615413053752e-1],
    },
    {
      name: "Ganymede",
      mass: 1.4819e23,
      radius: 2634.1,
      R0: [-7.53046824161657e5, 7.625081910611093e5, 1.864487746826973e4],
      V0: [-7.736431695949022, -7.615538471231853, -3.974042739586112e-1],
    },
    {
      name: "Callisto",
      mass: 1.075938e23,
      radius: 2410.3,
      R0: [-1.591071536498453e6, 1.025938644972126e6, 1.110333525366796e4],
      V0: [-4.452495611857585, -6.829687395278297, -2.747565826049296e-1],
    },
  ];

  let result = [];

  const G = 6.67408e-11 / 1e3 / 1e3 / 1e3; // km^3/kg/s^2

  bodies.forEach((body) => {
    const geometry = new THREE.SphereGeometry(
      body.radius > 10000.0 ? 1.0 : 0.45,
      16,
      16
    );
    const material = new THREE.MeshBasicMaterial({ color: 0x101010 });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.R = body.R0;
    sphere.V = body.V0;
    sphere.A = [0.0, 0.0, 0.0];
    sphere.GM = G * body.mass;

    result.push(sphere);
  });

  return result;
}

window.addEventListener("DOMContentLoaded", main);
