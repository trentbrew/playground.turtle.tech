// ----- setup ----- //

var illoElem = document.querySelector(".illo");
var sceneSize = 96;
var TAU = Zdog.TAU;
var ROOT3 = Math.sqrt(3);
var isSpinning = true;
var viewRotation = new Zdog.Vector();
var displaySize;

// create the Zdog Illustration
var illo = new Zdog.Illustration({
  element: illoElem,
  scale: 8,
  resize: "fullscreen",
  onResize: function (width, height) {
    displaySize = Math.min(width, height);
    this.zoom = Math.floor(displaySize / sceneSize);
  },
});

// We'll rotate everything by -45° around z:
var mainAnchor = new Zdog.Anchor({
  addTo: illo,
  rotate: { z: -TAU / 8 }, // -TAU/8 = -45°
});

var solids = [];

// ----- octahedron helper ----- //
function createOctahedron(addToAnchor) {
  var colorWheel = [
    "#4B7E56", // darkest
    "#579465",
    "#63A76F", // original
    "#72BA80",
    "#85CE92", // lightest
  ];

  // side-length geometry
  var radius = (ROOT3 / 2) * (2 / 3);
  var height = (radius * 3) / 2;
  var tilt = Math.asin(0.5 / height);

  for (var ySide of [-1, 1]) {
    for (var i = 0; i < 4; i++) {
      var rotor = new Zdog.Anchor({
        addTo: addToAnchor,
        rotate: { y: (TAU / 4) * (i + 4.5) * -1 },
      });

      var anchor = new Zdog.Anchor({
        addTo: rotor,
        translate: { z: 0.5 },
        rotate: { x: tilt * ySide },
      });

      new Zdog.Polygon({
        sides: 3,
        radius: radius,
        addTo: anchor,
        translate: { y: (-radius / 2) * ySide },
        scale: { y: ySide },
        stroke: false,
        fill: true,
        color: colorWheel[i + 0.5 + 0.5 * ySide],
        backface: false,
      });
    }
  }
}

// ----- data for positions & scales -----
// 1. Center is largest
// 2. Cardinal directions => scale=0.5
// 3. Diagonals => scale=1
var shapeData = [
  { x: 0, y: 0, scale: 4 }, // center
  { x: 0, y: -5, scale: 1 }, // top
  // { x:  4,   y:  0,   scale: 0.5 },  // right
  { x: 0, y: 5, scale: 1 }, // bottom
  // { x: -4,   y:  0,   scale: 0.5 },  // left
  { x: 3, y: -3, scale: 2 }, // top-right
  { x: 3, y: 3, scale: 2 }, // bottom-right
  { x: -3, y: 3, scale: 2 }, // bottom-left
  { x: -3, y: -3, scale: 2 }, // top-left
];

// create all nine octahedrons
shapeData.forEach(function (cfg) {
  var anchor = new Zdog.Anchor({
    addTo: mainAnchor, // attach them to mainAnchor
    translate: { x: cfg.x, y: cfg.y },
    scale: cfg.scale,
  });
  createOctahedron(anchor);
  solids.push(anchor);
});

// -- animate --- //

function animate() {
  update();
  illo.renderGraph();
  requestAnimationFrame(animate);
}
animate();

// Track mouse position
document.addEventListener("mousemove", function (e) {
  // Convert mouse position to rotation
  // Subtract 0.5 to center around middle of screen
  viewRotation.x = (e.clientY / window.innerHeight - 0.5) * -TAU;
  viewRotation.y = (e.clientX / window.innerWidth - 0.5) * -TAU;
});

function update() {
  solids.forEach(function (solid) {
    solid.rotate.set(viewRotation);
  });

  illo.updateGraph();
}
