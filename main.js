document.addEventListener("DOMContentLoaded", function () {
  let loadingElement = document.getElementById("loading");
  let scene = document.querySelector("a-scene");
  
  if (scene.hasLoaded) {
    loadingElement.style.display = "none"; 
  } else {
     scene.addEventListener("loaded", function () {
     loadingElement.style.display = "none";
     });
    }
});

AFRAME.registerComponent("lod-graph", {
  init: function () {
    const scene = this.el;

    const nodes = [
      {
        id: "book",
        label: "Book",
        type: "Bibliographic Resource",
        uri: "http://example.org/book/1",
        position: { x: 0, y: 2, z: -3 },
        color: "#4CC3D9"
      },
      {
        id: "author",
        label: "Author",
        type: "Person",
        uri: "http://example.org/person/1",
        position: { x: -2, y: 1.2, z: -3.8 },
        color: "#EF2D5E"
      },
      {
        id: "subject",
        label: "Subject",
        type: "Concept",
        uri: "http://example.org/concept/1",
        position: { x: 2, y: 1.2, z: -3.8 },
        color: "#FFC65D"
      },
      {
        id: "institution",
        label: "Library",
        type: "Organization",
        uri: "http://example.org/library/1",
        position: { x: -1.4, y: 0.4, z: -5 },
        color: "#7BC8A4"
      },
      {
        id: "dataset",
        label: "Dataset",
        type: "LOD Dataset",
        uri: "http://example.org/dataset/1",
        position: { x: 1.4, y: 0.4, z: -5 },
        color: "#B10DC9"
      }
    ];

    const edges = [
      { from: "book", to: "author", label: "has author" },
      { from: "book", to: "subject", label: "has subject" },
      { from: "dataset", to: "book", label: "describes" },
      { from: "institution", to: "dataset", label: "maintains" }
    ];

    function findNode(id) {
      return nodes.find(node => node.id === id);
    }

    function showInfo(node) {
      const relatedEdges = edges
        .filter(edge => edge.from === node.id || edge.to === node.id).map(edge => {
          const from = findNode(edge.from).label;
          const to = findNode(edge.to).label;
          return `${from} ➜ ${edge.label} ➜ ${to}`;
        });

      document.querySelector("#info-title").innerText = node.label;
      document.querySelector("#info-type").innerText = node.type;
      document.querySelector("#info-uri").innerText = node.uri;
      document.querySelector("#info-relations").innerHTML = relatedEdges.length > 0 ? relatedEdges.map(r => `<li>${r}</li>`).join("") : "<li>No relations found.</li>";
    }

    edges.forEach(edge => {
      const fromNode = findNode(edge.from);
      const toNode = findNode(edge.to);

      const line = document.createElement("a-entity");

      line.setAttribute("line", {
        start: `${fromNode.position.x} ${fromNode.position.y} ${fromNode.position.z}`,
        end: `${toNode.position.x} ${toNode.position.y} ${toNode.position.z}`,
        color: "#eee9e9"
      });

      scene.appendChild(line);
    });

    nodes.forEach(node => {
      const sphere = document.createElement("a-sphere");

      sphere.setAttribute("position", node.position);
      sphere.setAttribute("radius", "0.2");
      sphere.setAttribute("color", node.color);
      sphere.setAttribute("class", "clickable");

      sphere.setAttribute("animation__mouseenter", {
        property: "scale",
        startEvents: "mouseenter",
        to: "1.3 1.3 1.3",
        dur: 200
      });

      sphere.setAttribute("animation__mouseleave", {
        property: "scale",
        startEvents: "mouseleave",
        to: "1 1 1",
        dur: 200
      });

      sphere.addEventListener("click", () => {
        showInfo(node);
        toggleZoom(node);
      });

      scene.appendChild(sphere);

      const label = document.createElement("a-text");

      label.setAttribute("value", node.label);
      label.setAttribute("align", "center");
      label.setAttribute("width", "3");
      label.setAttribute("position", {
        x: node.position.x,
        y: node.position.y + 0.35,
        z: node.position.z
      });
      label.setAttribute("color", "#eee9e9");

      scene.appendChild(label);
    });
    const camera = document.querySelector("#camera");

    const defaultCameraPosition = {
      x: 0,
      y: -0.291,
      z: -0.979
    };

    let focusedNodeId = null;

    function positionToString(position) {
      return `${position.x} ${position.y} ${position.z}`;
    }

    function moveCameraTo(position) {
      camera.removeAttribute("animation__zoom");

      camera.setAttribute("animation__zoom", {
        property: "position",
        to: positionToString(position),
        dur: 800,
        easing: "easeInOutQuad"
      });
    }

    function toggleZoom(node) {
      if (focusedNodeId === node.id) {
        moveCameraTo(defaultCameraPosition);
        focusedNodeId = null;
        return;
      }

      const zoomPosition = {
        x: node.position.x,
        y: Math.max(1.2, node.position.y + 0.05),
        z: node.position.z + 2.2
      };

      moveCameraTo(zoomPosition);
      focusedNodeId = node.id;

      showInfo(node);
    }
  }
});