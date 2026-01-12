// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// --- Three.js Setup ---
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Camera setup
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 4; // Adjust based on model size
scene.add(camera);

// Renderer setup
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // Transparent background to blend with CSS
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Lighting for "Tech" feel (Dark Blue) ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// Main Blue Light
const blueSpotLight = new THREE.SpotLight(0x0055ff, 10);
blueSpotLight.position.set(2, 5, 5);
blueSpotLight.angle = Math.PI / 4;
blueSpotLight.penumbra = 0.5;
scene.add(blueSpotLight);

// Secondary Blue Light (Fill)
const fillLight = new THREE.PointLight(0x00aaff, 5);
fillLight.position.set(-3, -2, 3);
scene.add(fillLight);

// Back Rim Light (for silhouette)
const rimLight = new THREE.DirectionalLight(0xffffff, 2);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

// --- Load GLB Model ---
const loader = new THREE.GLTFLoader();
let model = null;

loader.load(
    'Arivia.glb', 
    (gltf) => {
        model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Center at (0,0,0)

        // Scale if needed (adjust this value based on your GLB's actual size)
        // model.scale.set(1, 1, 1); 

        scene.add(model);

        // Optional: Animation loop for idle rotation
        gsap.to(model.rotation, {
            y: Math.PI * 2,
            duration: 20,
            repeat: -1,
            ease: "none"
        });
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error occurred loading the model:', error);
        // Fallback geometry if model fails to load
        const geometry = new THREE.IcosahedronGeometry(1.5, 0);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.3,
            metalness: 0.8,
            wireframe: true 
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        model = mesh;
    }
);

// --- Resize Handler ---
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Subtle floating animation for the model if it exists
    if(model) {
        model.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }

    renderer.render(scene, camera);
}
animate();


// --- GSAP Scroll Animations ---

// Create a timeline that links to the scroll
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=150%", // Scroll distance duration
        scrub: 1,      // Smooth scrubbing
        pin: true,     // Pin the hero section while animating
    }
});

// Line 1: Moves Left
tl.to(".line-1", {
    x: "-150%", 
    opacity: 0,
    duration: 1
}, "start");

// Line 3: Moves Right
tl.to(".line-3", {
    x: "150%",
    opacity: 0,
    duration: 1
}, "start");

// Line 2: Gets Big, Fades Out (NO BLUR as requested)
tl.to(".line-2", {
    scale: 15,
    opacity: 0, 
    // Removed blur for performance and crispness
    duration: 1.5,
    ease: "power2.inOut"
}, "start");

// Fade out the info text
tl.to(".hero-info", {
    y: 100,
    opacity: 0,
    duration: 0.5
}, "start");

// Enhance 3D Model rotation on scroll
// Using a safe check function since model logic is async
const rotateModel = () => {
    if (model) {
        gsap.to(model.rotation, {
            z: Math.PI * 0.5,
            scrollTrigger: {
                 trigger: ".hero",
                 start: "top top",
                 end: "+=150%",
                 scrub: 1
            }
        });
    } else {
        requestAnimationFrame(rotateModel);
    }
};
rotateModel();

// Reveal the main content below hero
gsap.to(".hero-info", { opacity: 1, y: 0, duration: 1, delay: 0.5 });


// --- Horizontal Scroll Section (Desktop Only) ---
const horizontalSection = document.querySelector(".horizontal-section");
const wrapper = document.querySelector(".horizontal-wrapper");

ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 1024px)": function() {
        if (wrapper && horizontalSection) {
            gsap.to(wrapper, {
                x: "-250vw", // Move left by width of content
                ease: "none",
                scrollTrigger: {
                    trigger: horizontalSection,
                    pin: true,
                    scrub: 1,
                    start: "top top",
                    end: "+=3000", // Length of scroll to get through content
                }
            });
        }
    },
    // Mobile: No horizontal scroll logic required, CSS handles layout
    "(max-width: 1023px)": function() {
        // Optional: Could add simple fade-in for cards on scroll here
        gsap.utils.toArray(".h-card").forEach(card => {
            gsap.from(card, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%"
                }
            });
        });
    }
});

// --- Dot Grid Mouse Effect ---

document.querySelectorAll('.h-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});
