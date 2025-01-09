import * as THREE from 'three';
import Structure from '../Structure/Structure';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ItemsProps } from '../Structure/Loaders/Loaders';

gsap.registerPlugin(ScrollTrigger);

export default class GuitarModel1 {
  public scene;
  public model: THREE.Group<THREE.Object3DEventMap> | null;
  public time;
  public textureMap: undefined | THREE.Texture;
  public roughnessMap: undefined | THREE.Texture;
  public structure;
  public loaders;
  public loader: ItemsProps | null;

  constructor(structure: Structure) {
    this.structure = structure;
    this.loaders = this.structure.loaders;
    this.loader = null;
    this.scene = structure.scene;
    this.model = null;
    this.time = structure.time;
    this.textureMap = undefined;
    this.roughnessMap = undefined;

    this.loader = this.loaders.items;
    this.setTextures();
    this.setModel();
    this.LenisGuitar();
    this.GsapGuitar();
  }

  setTextures() {
    if (this.loader) {
      this.roughnessMap = this.loader.guitar_1_roughnessMap;
      this.textureMap = this.loader.texture_base_1;
      this.textureMap.flipY = false;
    }
  }

  setModel() {
    if (this.loader) {
      this.model = this.loader.model_guitar_1.scene;
      this.model.frustumCulled = false;
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            roughness: 0.5,
            map: this.textureMap,
            roughnessMap: this.roughnessMap,
            metalness: 0.6,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            envMap: this.scene.environment,
            envMapIntensity: 0.5,
          });
        }
      });

      if (this.model) {
        this.model.scale.set(0.5, 0.5, 0.5);
        this.model.rotation.set(-0.3, -1, 1.3);
        this.model.position.set(-2, 0, -0.5);
        this.model.position.setLength(-1);
        this.model.castShadow = true;

        this.scene.add(this.model);
      }
    }
  }

  GuitarAnim() {
    if (window.scrollY < 15 && this.model) {
      this.model.position.y =
        this.model.position.y + Math.sin(this.time.elapsedTime * 0.003) * 0.005;
    }
  }

  GsapGuitar() {
    if (this.model) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      });
      tl.to(
        this.model.position,
        {
          y: this.model.position.y - 0.1,
          x: this.model.position.x - 1.8,
          z: this.model.position.z + 0.5,
          duration: 0.6,
        },
        0
      )
        .to(
          this.model.rotation,
          {
            y: this.model.rotation.y + 1.1,
            x: this.model.rotation.x - 1.2,
            z: this.model.rotation.z + 0.7,
            duration: 0.6,
          },
          0
        )
        .to(
          this.model.position,
          {
            x: this.model.position.x - 3,
            z: this.model.position.z,
            y: this.model.position.y - 0.3,
            duration: 2,
          },
          1.3
        )
        .to(
          this.model.rotation,
          {
            y: this.model.rotation.y + 2.2,
            z: this.model.rotation.z + 0.3,
            x: this.model.rotation.x + 0.5,
            duration: 2,
          },
          1.3
        )
        .to(
          this.model.rotation,
          {
            y: this.model.rotation.y + 2.2,
            z: this.model.rotation.z + 0.3,
            x: this.model.rotation.x + 0.5,
            duration: 2,
          },
          4
        );
    }
  }

  LenisGuitar() {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
  }

  update() {
    this.GuitarAnim();
  }
}
