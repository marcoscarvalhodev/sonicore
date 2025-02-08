import * as THREE from 'three';
import Throttle from '../Structure/Utils/Throttle';
import { Object3DEventMap } from 'three';
import ViewPositioner from './ViewPositioner';
export default class RotateGuitar {
  public viewPositioner;
  public isMouseDown;
  public previousMousePosition;
  public guitar;
  public deltaX;
  public deltaY;
  public rotationSpeed;
  public xRotationLimits;
  public throttle;
  public targetRotation;
  public dampingFactor;
  public rotationOffset;

  constructor(
    viewPositioner: ViewPositioner,
    guitar: THREE.Object3D<Object3DEventMap> | null | undefined
  ) {
    this.viewPositioner = viewPositioner;
    this.isMouseDown = false;
    this.previousMousePosition = new THREE.Vector2(0, 0);
    this.guitar = guitar;
    this.deltaX = 0;
    this.deltaY = 0;
    this.rotationSpeed = 0.005;
    this.xRotationLimits = { min: -Math.PI / 4, max: Math.PI / 4 };
    this.targetRotation = new THREE.Euler(); // Initialize target rotation
    this.dampingFactor = 0.035;
    this.rotationOffset = 0.1;

    window.addEventListener('mousedown', this.setMouseDown);
    this.throttle = new Throttle(this.setMouseMove, 50);
    window.addEventListener('mousemove', this.throttle.setThrottle);
    window.addEventListener('mouseup', this.setMouseUp);

    this.viewPositioner.on('guitar_out_camera', () => {
      this.setDispose();
      this.setStopMovement()
    });
  }

  setStopMovement() {
    
    if (this.guitar) {
      this.guitar.rotation.y = THREE.MathUtils.lerp(
      0,
        0,
        0.075
      );
      this.guitar.rotation.x = THREE.MathUtils.lerp(
        0,
        0,
        0.075
      );
    }

    this.deltaX = 0;
    this.deltaY = 0;
    this.rotationOffset = 0;
    this.rotationSpeed = 0;
    this.dampingFactor = 0;
  }

  setMouseDown = (event: MouseEvent) => {
    this.isMouseDown = true;
    this.previousMousePosition.set(event.clientX, event.clientY);
  };

  setMouseMove = (event: MouseEvent) => {
    if (!this.isMouseDown) return;

    this.deltaX = event.clientX - this.previousMousePosition.x;
    this.deltaY = event.clientY - this.previousMousePosition.y;

    if (this.guitar) {
      // Calculate target rotation based on mouse movement
      const targetYRotation = this.guitar.rotation.y + this.deltaX * 0.2;
      const targetXRotation = this.guitar.rotation.x + this.deltaY * 0.2;

      // Clamp the X rotation within limits
      const clampedXRotation = THREE.MathUtils.clamp(
        targetXRotation,
        this.xRotationLimits.min,
        this.xRotationLimits.max
      );

      // Smoothly transition to the target rotation using lerp
      this.guitar.rotation.y = THREE.MathUtils.lerp(
        this.guitar.rotation.y,
        targetYRotation,
        this.dampingFactor
      );
      this.guitar.rotation.x = THREE.MathUtils.lerp(
        this.guitar.rotation.x,
        clampedXRotation,
        this.dampingFactor
      );
    }

    // Update previous mouse position
    this.previousMousePosition.set(event.clientX, event.clientY);
  };

  setMouseUp = () => {
    this.isMouseDown = false;

    if (this.guitar) {
      this.targetRotation.copy(this.guitar.rotation);
      this.targetRotation.y +=
        this.deltaX * this.rotationSpeed + this.rotationOffset; // Add offset to Y rotation
      this.targetRotation.x +=
        this.deltaY * this.rotationSpeed + this.rotationOffset; // Optionally add offset to X rotation
    }

    this.animate();
  };

  animate = () => {
    if (this.isMouseDown) return;

    // Smoothly transition to the target rotation using lerp
    if (this.guitar) {
      this.guitar.rotation.x = THREE.MathUtils.lerp(
        this.guitar.rotation.x,
        this.targetRotation.x,
        this.dampingFactor
      );
      this.guitar.rotation.y = THREE.MathUtils.lerp(
        this.guitar.rotation.y,
        this.targetRotation.y,
        this.dampingFactor
      );
    }
  };

  setDispose() {
    window.removeEventListener('mousedown', this.setMouseDown);
    window.removeEventListener('mousemove', this.setMouseMove);
    window.removeEventListener('mouseup', this.setMouseUp);
  }

  update() {
    this.animate();
  }
}
