// set canvas
var canvas = document.getElementById("simulation"),
    context = canvas.getContext("2d");

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create({
    enableSleeping: true
});

// create a renderer
var render = Render.create({
    canvas: canvas,
    engine: engine,
});
render.options.wireframes = false;
render.options.showVelocity = true;

//mouse controls
var mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

Composite.add(engine.world, mouseConstraint);
// keep the mouse in sync with rendering
render.mouse = mouse;

// createboxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80);
// var boxB = Bodies.rectangle(400, 50, 80, 80);
// var boxC = Bodies.rectangle(400, 100, 80, 80);
var border = [],
    thickness = 10000 

border.push(Bodies.rectangle(400, 600 + thickness/2, 800 + thickness, thickness, { isStatic: true }));
border.push(Bodies.rectangle(400, - thickness/2, 800 + thickness, thickness, { isStatic: true }));
border.push(Bodies.rectangle(-thickness/2, 300, thickness, 600 + thickness, { isStatic: true }));
border.push(Bodies.rectangle(800 + thickness/2, 300, thickness, 600 + thickness, { isStatic: true }));
// add ground the world
Composite.add(engine.world, border);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

//Dynamic Frame Per Second
fps = 1
objects = []
vals = []
letters = " ABCDEFGHIJKLMNOPQRSTUVWXYZ"
colours = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"]


function startSimulation() {
    objects.forEach(function(object) {
        if (object.isStatic){
            Matter.Sleeping.set(object, false)
            Matter.Body.setStatic(object, false)
        }
    });
}

function clearObjects() {
    location.reload()
}

function createObject() {
    var box = Bodies.rectangle(400,200,document.getElementById("length").value,document.getElementById("width").value, {render: {
        fillStyle: colours.at(objects.length),
        strokeStyle: 'white',
        lineWidth: 3}})
    Matter.Body.setMass(box, parseFloat(document.getElementById("mass").value))
    Matter.Body.setStatic(box, true)
    Matter.Events.on(box, "sleepStart", function(e){
        if (selectedObject == box.render.fillStyle) {
        createGraph(selectedObject, document.getElementById("graph").innerText.slice(-3))
    }})
    objects.push(box)
    if (objects.length==6) {
        document.getElementById("addObject").disabled = true;
        document.getElementById("ao").remove()
    }
    Composite.add(engine.world, [objects.at(-1)]);
    dynamicOptions()
}

Matter.Events.on(mouseConstraint, "startdrag", function(e){
    box = e.body;
    if (box.isStatic){
        box.isSensor = true;
        Matter.Body.setStatic(box, false)
        Matter.Events.on(mouseConstraint, "mouseup", function(e){
            box.isSensor = false;
            Matter.Body.setStatic(box, true)
            Matter.Events.off(mouseConstraint, "mouseup")
        }, )
    }
})

function dynamicOptions() {
    var options = "";
    var x = 0;
    
    objects.forEach(function(object){
        x++
        var colour =  colours.at(x-1).charAt(0).toUpperCase() + colours.at(x-1).slice(1)
        options += `<li><a onclick="selectObject('${colour}')" class="dropdown-item">Object ${colour}</a></li>`;
    });
 document.getElementById("dynamicObjects").innerHTML = options;
}

function showObjects(graph) {
    document.getElementById("graph").innerHTML = "Choose Graph: " + graph;
    o = document.getElementById("obj");
    if (o.innerText.includes(":")) {
        createGraph(selectedObject, graph)
      }
    else {
        o.hidden = false;
    }
}

function createGraph(selectedObject, graph) {
    object = objects.at(colours.indexOf(selectedObject));
    if (graph=="xpt") {
        drawGraph(object, object.positionX, "xptGraph",'X-Position (cm)')
    }
    else if (graph=="ypt") {
        drawGraph(object, object.positionY, "yptGraph",'Y-Position (cm)')
    }
    else if (graph=="xvt") {
        drawGraph(object, object.velocityX, "xvtGraph",'X-Velocity (cm/ms)')
    }
    else if (graph=="yvt") {
        drawGraph(object, object.velocityY, "yvtGraph",'Y-Velocity (cm/ms)')
    }
    else if (graph=="xat") {
        drawGraph(object, object.accelerationX,"xatGraph",'X-Acceleration (cm/ms^2)')
    }
    else if (graph=="yat") {
        drawGraph(object, object.accelerationY,"yatGraph",'Y-Acceleration (cm/ms^2)')
    }
}

var graphChart = new Chart(document.getElementById("graphCanvas"), {});

function drawGraph(object,data,gt,title) {
    document.getElementById("graphTitle").textContent = title
    endState = Math.round(data.at(-1))
    xArray = object.time
    yArray = data
    while (endState == Math.round(data.at(-1))){
        xArray.pop()
        yArray.pop()
    }
    
    graphChart.destroy()
    graphChart = new Chart(document.getElementById("graphCanvas"), {
        type: "line",
        data: {
            labels: xArray,
            datasets: [{
                data: yArray,
                label: "Movement of Object "+ selectedObject,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Time (ms)'
                }
                }],
                yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: title
                }
                }]
            }
        },
    });
}

selectedObject = ""
function selectObject(obj) {
    selectedObject = obj
    document.getElementById("obj").innerHTML = "Choose Object: " + obj;
    createGraph(obj, document.getElementById("graph").innerText.slice(-3))
}

