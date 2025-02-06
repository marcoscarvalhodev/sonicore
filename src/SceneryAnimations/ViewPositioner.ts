import * as THREE from 'three';
import Structure from '../Structure/Structure';
import gsap from 'gsap';
import EventEmitter from '../Structure/Utils/EventEmitter';
import RotateGuitar from './RotateGuitar';
import { Object3DEventMap } from 'three';

export default class ViewPositioner extends EventEmitter {
  public camera;
  public time;
  public gsap;
  public targetPosition;
  public guitarMove;
  public rotateGuitar: null | RotateGuitar;

  constructor(structure: Structure) {
    super();
    this.time = structure.time.current;
    this.camera = structure.camera.instance;
    this.gsap = gsap;
    this.targetPosition = new THREE.Vector3();
    this.guitarMove = true;
    this.rotateGuitar = null;
  }

  moveToView(
    object: THREE.Object3D<Object3DEventMap> | null,
    initialPosition: THREE.Vector3 | null
  ) {
    if (initialPosition && this.targetPosition.z < -39 && object) {
      this.gsap
        .timeline()
        .to(object.position, {
          z: initialPosition.z + 1,
          y: initialPosition.y + 1,
          duration: 1,
          onStart: () => {
            this.guitarMove = false;
            this.rotateGuitar = new RotateGuitar(this, object);
            this.trigger('guitar_on_camera');
          },
        })
        .to(object.position, {
          x: this.targetPosition.x,
          y: this.targetPosition.y,
          z: this.targetPosition.z - 5,
          duration: 1.5,
          ease: 'power4.inOut',
        });
    }
  }

  returnToOriginal(
    object: THREE.Object3D<Object3DEventMap> | null,
    initialPosition: THREE.Vector3 | null
  ) {
    if (object) {
      this.gsap.killTweensOf(object.position);

      this.gsap.to(object.position, {
        x: initialPosition?.x,
        y: initialPosition?.y,
        z: initialPosition?.z,
        duration: 2.5,
        onComplete: () => {
          this.guitarMove = true;
          this.trigger('guitar_out_camera_complete');
        },
      });

      this.trigger('guitar_out_camera');
    }
  }

  update() {
    this.targetPosition = new THREE.Vector3().copy(this.camera.position);
  }
}
